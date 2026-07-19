import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSite } from "@/lib/api";

import EditSiteForm from "./components/edit-site-form";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const site = await getSite(id);

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
