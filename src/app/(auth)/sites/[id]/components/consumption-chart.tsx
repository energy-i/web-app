"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import type { Consumption, ConsumptionBreakdownItem } from "@/lib/types";
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

export function ConsumptionChart({
  siteId,
  initialData,
  initialRange = "90d",
}: {
  siteId: string;
  initialData: Consumption;
  initialRange?: Range;
}) {
  const isMobile = useIsMobile();
  const [range, setRange] = React.useState<Range>(initialRange);
  const [data, setData] = React.useState<Consumption>(initialData);
  const [isPending, startTransition] = React.useTransition();

  // Prevent overwriting fresh data with a stale response.
  const requestIdRef = React.useRef(0);

  const fetchRange = React.useCallback(
    (next: Range) => {
      const requestId = ++requestIdRef.current;
      const { from, to } = computeWindow(next);
      const search = new URLSearchParams({ from, to, interval: "day" });

      startTransition(async () => {
        try {
          const res = await fetch(
            `/api/sites/${siteId}/consumption?${search.toString()}`,
            { cache: "no-store" },
          );
          if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
          }
          const body = (await res.json()) as { consumption: Consumption };
          if (requestId === requestIdRef.current) {
            setData(body.consumption);
          }
        } catch {
          toast.error("Failed to load consumption data");
        }
      });
    },
    [siteId],
  );

  React.useEffect(() => {
    if (isMobile && range !== "7d") {
      setRange("7d");
      fetchRange("7d");
    }
    // Only react to mobile switching; range changes are handled by the toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const handleRangeChange = (next: string) => {
    if (!next || next === range) return;
    const nextRange = next as Range;
    setRange(nextRange);
    fetchRange(nextRange);
  };

  const chartConfig = React.useMemo(
    () => buildChartConfig(data.breakdown),
    [data.breakdown],
  );
  const chartData = React.useMemo(
    () => buildChartData(data.breakdown),
    [data.breakdown],
  );
  const total = React.useMemo(
    () => data.breakdown.reduce((sum, item) => sum + item.total, 0),
    [data.breakdown],
  );

  const unit = data.unit || "kWh";
  const formattedTotal = total.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });

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
          isPending && "opacity-60",
        )}
      >
        <AreaChart data={chartData}>
          <defs>
            {data.breakdown.map((item) => {
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
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
                formatter={(value, name, item) => {
                  const key = String(name);
                  const label = chartConfig[key]?.label ?? key;
                  const color =
                    (item as { color?: string } | undefined)?.color ??
                    `var(--color-${key})`;
                  return (
                    <div className="flex w-full items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex flex-1 items-center justify-between gap-2">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-semibold text-foreground tabular-nums">
                          {typeof value === "number"
                            ? value.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })
                            : String(value)}{" "}
                          {unit}
                        </span>
                      </div>
                    </div>
                  );
                }}
                indicator="dot"
              />
            }
          />
          {data.breakdown.map((item) => {
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
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
