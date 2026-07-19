import { InfoIcon, ZapIcon } from "lucide-react";
import Link from "next/link";

import SitesTable from "@/components/sites-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getOrganisation } from "@/lib/api";

async function DashboardPage() {
  const organisation = await getOrganisation();

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
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex-1 flex-col gap-4 p-4 pt-0 space-y-4">
        {!organisation || !organisation.sites.length ? (
          <Alert>
            <InfoIcon />
            <AlertTitle>No sites available</AlertTitle>
            <AlertDescription>
              Your organisation does not have any sites set up yet. Please
              contact your administrator.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Button asChild variant="secondary" className="mb-4">
              <Link href="/sites/new">Add new site</Link>
            </Button>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Peak power</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    4.2 kW
                  </CardTitle>
                  <CardAction>
                    <ZapIcon />
                  </CardAction>
                </CardHeader>
              </Card>
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Peak power</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    4.2 kW
                  </CardTitle>
                  <CardAction>
                    <ZapIcon />
                  </CardAction>
                </CardHeader>
              </Card>
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Peak power</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    4.2 kW
                  </CardTitle>
                  <CardAction>
                    <ZapIcon />
                  </CardAction>
                </CardHeader>
              </Card>
            </div>
            <SitesTable sites={organisation.sites} />
          </>
        )}
      </div>
    </>
  );
}

export default DashboardPage;
