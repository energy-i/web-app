import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserWithOrganisation } from "@/lib/auth";
import prisma from "@/lib/prisma";

import EditSiteForm from "./components/edit-site-form";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getUserWithOrganisation();

  if (!user) {
    notFound();
  }

  const site = await prisma.site.findFirst({
    where: {
      id,
      organisationId: user.organisationId,
    },
  });

  if (!site) {
    notFound();
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Edit site</CardTitle>
        <CardDescription>Update the details for {site.name}.</CardDescription>
      </CardHeader>
      <CardContent>
        <EditSiteForm site={site} />
      </CardContent>
    </Card>
  );
};

export default Page;
