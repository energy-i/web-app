import { InfoIcon } from "lucide-react";

import { AlertsList } from "@/components/alerts-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSiteAlerts, getSiteAreas, getSiteConsumption } from "@/lib/api";

import { ConsumptionChart } from "./components/consumption-chart";

const DEFAULT_RANGE_DAYS = 90;

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - DEFAULT_RANGE_DAYS);

  const [areas, consumption, alerts] = await Promise.all([
    getSiteAreas(id),
    getSiteConsumption(id, {
      from: from.toISOString(),
      to: to.toISOString(),
      interval: "day",
    }),
    getSiteAlerts(id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <ConsumptionChart
          siteId={id}
          initialData={consumption}
          initialRange="90d"
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Alerts</h2>
        {alerts.length === 0 ? (
          <Alert>
            <InfoIcon />
            <AlertTitle>No alerts</AlertTitle>
            <AlertDescription>
              This site has no active alerts, opportunities, or insights.
            </AlertDescription>
          </Alert>
        ) : (
          <AlertsList alerts={alerts} />
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Areas</h2>
        {areas.length === 0 ? (
          <Alert>
            <InfoIcon />
            <AlertTitle>No areas</AlertTitle>
            <AlertDescription>
              This site does not have any areas yet.
            </AlertDescription>
          </Alert>
        ) : (
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
        )}
      </section>
    </div>
  );
};

export default Page;
