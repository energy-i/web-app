import { ListIcon, ZapIcon } from "lucide-react";
import Link from "next/link";

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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListIcon />
              </EmptyMedia>
              <EmptyTitle>Welcome to Energy-i</EmptyTitle>
              <EmptyDescription>
                We need to onboard your first site, please get in touch with us.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="mailto:help@energy-i.ai?subject=Energy-i%20Support">
                  Contact us
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
}

export default DashboardPage;
