import { notFound } from "next/navigation";

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
import { getUserWithOrganisation } from "@/lib/auth";
import prisma from "@/lib/prisma";

const Layout = async ({
  params,
  children,
  powerChart,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
  powerChart: React.ReactNode;
}) => {
  const { id } = await params;
  const user = await getUserWithOrganisation();
  const site = await prisma.site.findFirst({
    where: {
      organisationId: user?.organisationId || undefined,
      id,
    },
  });

  if (!site) {
    notFound();
  }

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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/sites">Sites</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage className="hidden md:block">
                {site.name}
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex-1 flex-col gap-4 p-4 pt-0 space-y-4">
        {powerChart}
        {children}
      </div>
    </>
  );
};

export default Layout;
