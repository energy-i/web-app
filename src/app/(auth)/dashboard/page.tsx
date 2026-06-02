import { InfoIcon } from "lucide-react";
import { headers } from "next/headers";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  if (!organisation || !organisation.sites.length) {
    return (
      <Alert>
        <InfoIcon />
        <AlertTitle>No sites available</AlertTitle>
        <AlertDescription>
          Your organisation does not have any sites set up yet. Please contact
          your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return <h1 className="text-2xl font-bold">{organisation.name} Dashboard</h1>;
}

export default DashboardPage;
