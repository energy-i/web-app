import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { AlertsList } from "@/components/alerts-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSiteAlerts, getSiteAreas, getSiteConsumption } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ConsumptionBreakdownItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Range = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<Range, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const RANGE_LABEL: Record<Range, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 3 months",
};

// Cycle through the shadcn chart palette defined in globals.css.
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

function computeWindow(range: Range): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - RANGE_DAYS[range]);
  return { from: from.toISOString(), to: to.toISOString() };
}

// Prefix keys so they never collide with the reserved `timestamp` field even
// if a breakdown item is named "timestamp".
const seriesKey = (id: string) => `s_${id}`;

type ChartRow = { timestamp: string } & Record<string, number | string>;

function buildChartData(breakdown: ConsumptionBreakdownItem[]): ChartRow[] {
  const byTimestamp = new Map<string, ChartRow>();

  for (const item of breakdown) {
    const key = seriesKey(item.id);
    for (const point of item.series) {
      let row = byTimestamp.get(point.timestamp);
      if (!row) {
        row = { timestamp: point.timestamp };
        byTimestamp.set(point.timestamp, row);
      }
      row[key] = point.value;
    }
  }

  // Fill in missing values so stacked areas render continuously.
  const rows = Array.from(byTimestamp.values()).sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );
  for (const row of rows) {
    for (const item of breakdown) {
      const key = seriesKey(item.id);
      if (row[key] === undefined) row[key] = 0;
    }
  }
  return rows;
}

function buildChartConfig(breakdown: ConsumptionBreakdownItem[]): ChartConfig {
  const config: ChartConfig = {};
  breakdown.forEach((item, index) => {
    config[seriesKey(item.id)] = {
      label: item.name,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
  });
  return config;
}

export const Route = createFileRoute("/_authed/sites/$id/")({
  component: SiteDetailPage,
});

function SiteDetailPage() {
  const { id } = Route.useParams();

  const areasQuery = useQuery({
    queryKey: queryKeys.siteAreas(id),
    queryFn: () => getSiteAreas(id),
  });

  const alertsQuery = useQuery({
    queryKey: queryKeys.siteAlerts(id),
    queryFn: () => getSiteAlerts(id),
  });

  const areas = areasQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <ConsumptionChartSection siteId={id} />
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
}

function ConsumptionChartSection({ siteId }: { siteId: string }) {
  const isMobile = useIsMobile();
  const [userRange, setUserRange] = React.useState<Range | null>(null);
  // On mobile default to the 7d window; on desktop honour the user's toggle
  // choice (or 90d otherwise). Deriving instead of syncing state with useEffect.
  const range: Range = userRange ?? (isMobile ? "7d" : "90d");

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.siteConsumption(siteId, range),
    queryFn: () =>
      getSiteConsumption(siteId, {
        ...computeWindow(range),
        interval: "day",
      }),
    placeholderData: (prev) => prev,
  });

  const chartConfig = React.useMemo(
    () => (data ? buildChartConfig(data.breakdown) : {}),
    [data],
  );
  const chartData = React.useMemo(
    () => (data ? buildChartData(data.breakdown) : []),
    [data],
  );
  const total = React.useMemo(
    () =>
      data ? data.breakdown.reduce((sum, item) => sum + item.total, 0) : 0,
    [data],
  );

  const unit = data?.unit || "kWh";
  const formattedTotal = total.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });

  const handleRangeChange = (next: string) => {
    if (!next || next === range) return;
    setUserRange(next as Range);
  };

  return (
    <div className="@container/chart flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Consumption</h2>
          <p className="text-sm text-muted-foreground">
            <span className="hidden @[540px]/chart:inline">
              {formattedTotal} {unit} total · {RANGE_LABEL[range]}
            </span>
            <span className="@[540px]/chart:hidden">
              {formattedTotal} {unit}
            </span>
          </p>
        </div>
        <div>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={handleRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/chart:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/chart:hidden"
              size="sm"
              aria-label="Select a range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ChartContainer
        config={chartConfig}
        className={cn(
          "aspect-auto h-62.5 w-full transition-opacity",
          isFetching && "opacity-60",
        )}
      >
        <AreaChart data={chartData}>
          <defs>
            {(data?.breakdown ?? []).map((item) => {
              const key = seriesKey(item.id);
              return (
                <linearGradient
                  key={key}
                  id={`fill-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={44}
            tickFormatter={(value: number) =>
              value.toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value as string).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
                indicator="dot"
              />
            }
          />
          {(data?.breakdown ?? []).map((item) => {
            const key = seriesKey(item.id);
            return (
              <Area
                key={key}
                dataKey={key}
                name={key}
                type="natural"
                fill={`url(#fill-${key})`}
                stroke={`var(--color-${key})`}
                stackId="consumption"
              />
            );
          })}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
