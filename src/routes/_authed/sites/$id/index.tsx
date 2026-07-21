import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import * as z from "zod";

import { AlertsList } from "@/components/alerts-list";
import { TablePagination } from "@/components/table-pagination";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getSite,
  getSiteAlerts,
  getSiteAreas,
  getSiteConsumption,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ConsumptionBreakdownItem, Site } from "@/lib/types";
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

const ALERTS_PAGE_SIZE = 25;

const TABS = ["consumption", "alerts", "details"] as const;
type SiteTab = (typeof TABS)[number];

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

const searchSchema = z.object({
  tab: z.enum(TABS).catch("consumption").optional(),
  // Only meaningful when `tab === "alerts"`; carried through router state so
  // pagination survives reloads and back/forward navigation.
  page: z.coerce.number().int().min(1).catch(1).optional(),
});

export const Route = createFileRoute("/_authed/sites/$id/")({
  validateSearch: (search) => searchSchema.parse(search),
  component: SiteDetailPage,
});

function SiteDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate({ from: "/sites/$id" });
  const { tab = "consumption" } = Route.useSearch();

  // The parent `$id.tsx` route already ensured the site loads. Reading it
  // here from the same query key just hits the cache.
  const { data: site } = useQuery({
    queryKey: queryKeys.site(id),
    queryFn: () => getSite(id),
  });

  const handleTabChange = (next: string) => {
    if (next === tab) return;
    navigate({
      search: (prev) => ({
        ...prev,
        tab: next === "consumption" ? undefined : (next as SiteTab),
        // Reset the alerts pager whenever the tab changes.
        page: undefined,
      }),
    });
  };

  if (!site) return null;

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-fit">
        <TabsList>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "consumption" ? <ConsumptionTab siteId={id} /> : null}
      {tab === "alerts" ? <AlertsTab siteId={id} /> : null}
      {tab === "details" ? <DetailsTab site={site} /> : null}
    </div>
  );
}

function ConsumptionTab({ siteId }: { siteId: string }) {
  const areasQuery = useQuery({
    queryKey: queryKeys.siteAreas(siteId),
    queryFn: () => getSiteAreas(siteId),
  });
  const areas = areasQuery.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <ConsumptionChartSection siteId={siteId} />

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

function AlertsTab({ siteId }: { siteId: string }) {
  const navigate = useNavigate({ from: "/sites/$id" });
  const { page = 1 } = Route.useSearch();

  const { data } = useQuery({
    queryKey: queryKeys.siteAlerts(siteId, {
      page,
      pageSize: ALERTS_PAGE_SIZE,
    }),
    queryFn: () => getSiteAlerts(siteId, { page, pageSize: ALERTS_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const alerts = data?.alerts ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const currentPage = data?.pagination.page ?? page;

  const handlePageChange = (next: number) =>
    navigate({ search: (prev) => ({ ...prev, page: next }) });

  if (alerts.length === 0) {
    return (
      <Alert>
        <InfoIcon />
        <AlertTitle>No alerts</AlertTitle>
        <AlertDescription>
          This site has no active alerts, opportunities, or insights.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AlertsList alerts={alerts} />
      <TablePagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

function DetailsTab({ site }: { site: Site }) {
  const numberFormatter = new Intl.NumberFormat();
  const coordFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 5,
  });
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const address = [site.addressLine1, site.city, site.postcode]
    .filter(Boolean)
    .join(", ");
  const coords =
    site.latitude !== null && site.longitude !== null
      ? `${coordFormatter.format(site.latitude)}, ${coordFormatter.format(site.longitude)}`
      : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailItem label="Address line 1" value={site.addressLine1} />
          <DetailItem label="City" value={site.city} />
          <DetailItem label="Postcode" value={site.postcode} />
          <DetailItem label="Full address" value={address || null} />
          <DetailItem label="Coordinates" value={coords} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailItem label="Name" value={site.name} />
          <DetailItem label="Sector" value={site.sector} />
          <DetailItem
            label="Area (m²)"
            value={
              site.area !== null ? numberFormatter.format(site.area) : null
            }
          />
          <DetailItem
            label="EAC (kWh)"
            value={site.eac !== null ? numberFormatter.format(site.eac) : null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metering</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailItem label="Meter type" value={site.meterType} />
          <DetailItem label="Comms vendor" value={site.commsVendor} />
          <DetailItem label="Comms ID" value={site.commsId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailItem
            label="Created"
            value={dateFormatter.format(new Date(site.createdAt))}
          />
          <DetailItem
            label="Last updated"
            value={dateFormatter.format(new Date(site.updatedAt))}
          />
          <DetailItem label="Site ID" value={site.id} mono />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm not-first:border-t not-first:border-border/60 not-first:pt-3 not-first:mt-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "col-span-2 wrap-break-word",
          mono && "font-mono text-xs",
          value === null && "text-muted-foreground italic",
        )}
      >
        {value ?? "—"}
      </dd>
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
