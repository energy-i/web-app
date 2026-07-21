import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSite } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

import EditSiteForm from "./-components/edit-site-form";

export const Route = createFileRoute("/_authed/sites/$id/edit")({
  component: EditSitePage,
});

function EditSitePage() {
  const { id } = Route.useParams();
  const { data: site } = useSuspenseQuery({
    queryKey: queryKeys.site(id),
    queryFn: () => getSite(id),
  });

  if (!site) return null;

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
}
