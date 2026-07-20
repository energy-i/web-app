import { InfoIcon } from "lucide-react";

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
import { getAlerts } from "@/lib/api";

import { ViewTabs, type AlertsView } from "./components/view-tabs";

function parseView(raw: string | string[] | undefined): AlertsView {
  return raw === "snoozed" ? "snoozed" : "active";
}

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) => {
  const { view: rawView } = await searchParams;
  const view = parseView(rawView);

  // For the "snoozed" tab we ask the API to include currently-snoozed alerts,
  // then narrow to only the still-snoozed ones (API returns both active +
  // snoozed when the flag is on).
  const alerts = await getAlerts({ includeSnoozed: view === "snoozed" });

  const now = Date.now();
  const visible =
    view === "snoozed"
      ? alerts.filter(
          (a) =>
            a.snoozedUntil !== null &&
            new Date(a.snoozedUntil).getTime() > now,
        )
      : alerts;

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
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
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
        <ViewTabs value={view} />

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
};

export default Page;
