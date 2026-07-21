import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import * as z from "zod";

import { AlertsList } from "@/components/alerts-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAlerts } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

const searchSchema = z.object({
  view: z.enum(["active", "snoozed"]).catch("active"),
});

type AlertsView = z.infer<typeof searchSchema>["view"];

export const Route = createFileRoute("/_authed/alerts")({
  validateSearch: (search) => searchSchema.parse(search),
  component: AlertsPage,
});

function AlertsPage() {
  const navigate = useNavigate({ from: "/alerts" });
  const { view } = Route.useSearch();

  const { data: alerts = [] } = useQuery({
    queryKey: queryKeys.alerts(view),
    queryFn: () => getAlerts({ includeSnoozed: view === "snoozed" }),
  });

  // For the "snoozed" tab we ask the API to include currently-snoozed alerts,
  // then narrow to only the still-snoozed ones (API returns both active +
  // snoozed when the flag is on).
  const visible =
    view === "snoozed"
      ? alerts.filter((a) => {
          if (a.snoozedUntil === null) return false;
          return new Date(a.snoozedUntil).getTime() > Date.now();
        })
      : alerts;

  const handleChange = (next: string) => {
    if (next === view) return;
    navigate({
      search: { view: next as AlertsView },
    });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to="/">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage className="hidden md:block">
                Alerts
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Tabs value={view} onValueChange={handleChange} className="w-fit">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="snoozed">Snoozed</TabsTrigger>
          </TabsList>
        </Tabs>

        {visible.length === 0 ? (
          <Alert>
            <InfoIcon />
            <AlertTitle>
              No {view === "snoozed" ? "snoozed" : "active"} alerts
            </AlertTitle>
            <AlertDescription>
              {view === "snoozed"
                ? "You haven't snoozed any alerts."
                : "You have no active alerts, opportunities, or insights."}
            </AlertDescription>
          </Alert>
        ) : (
          <AlertsList alerts={visible} />
        )}
      </div>
    </>
  );
}
