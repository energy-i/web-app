import { Badge, InfoIcon, TrendingUpIcon } from "lucide-react";
import { headers } from "next/headers";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const organisation = await prisma.organisation.findFirst({
    where: {
      id: session?.user.organisationId || undefined,
    },
    include: {
      sites: true,
    },
  });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    $1,250.00
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">
                      <TrendingUpIcon />
                      +12.5%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    Trending up this month <TrendingUpIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Visitors for the last 6 months
                  </div>
                </CardFooter>
              </Card>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Energy Usage (kWh)</TableHead>
                  <TableHead>Revenue ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organisation.sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableHead>{site.name}</TableHead>
                    <TableHead>{site.city}</TableHead>
                    <TableHead>1,000</TableHead>
                    <TableHead>500.00</TableHead>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </>
  );
}

export default DashboardPage;
