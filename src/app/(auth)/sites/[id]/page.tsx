import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const areas = await prisma.area.findMany({
    where: { siteId: id },
    include: {
      _count: { select: { appliances: true } },
    },
    orderBy: { name: "asc" },
  });

  if (areas.length === 0) {
    return (
      <Alert>
        <InfoIcon />
        <AlertTitle>No areas</AlertTitle>
        <AlertDescription>
          This site does not have any areas yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area) => (
        <Card key={area.id}>
          <CardHeader>
            <CardTitle>{area.name}</CardTitle>
            <CardDescription>
              {area._count.appliances}{" "}
              {area._count.appliances === 1 ? "appliance" : "appliances"}
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      ))}
    </div>
  );
};

export default Page;
