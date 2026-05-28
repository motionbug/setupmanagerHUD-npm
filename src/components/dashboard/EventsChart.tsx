import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { StoredEvent, SetupManagerFinishedWebhook } from "@/types";
import { isFinishedWebhook, getFinishedEvents, hasFailedActions, TIME_RANGE_MS } from "@/types";
import { tooltipStyles, CHART_COLORS } from "@/lib/chartStyles";

interface EventsChartProps {
  events: StoredEvent[];
  embedded?: boolean;
}

type TimeRange = "day" | "week" | "month" | "all";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "day", label: "24h" },
  { value: "week", label: "7d" },
  { value: "month", label: "30d" },
  { value: "all", label: "All" },
];

export function EventsChart({ events, embedded = false }: EventsChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("week");
  const chartData = createTimeBuckets(events, timeRange);

  if (events.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-edge text-ink-faint text-base">
        No event data yet
      </div>
    );
  }

  const chart = (
    <div className="space-y-4">
      <div className="flex justify-end gap-1">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              timeRange === range.value
                ? "bg-jamf-purple text-white shadow-md"
                : "text-ink-muted hover:bg-control-hover"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      {chartData.length === 0 ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-edge text-ink-faint text-base">
          No data for selected range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--edge-subtle)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 13, fill: "var(--ink-faint)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--edge-subtle)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 13, fill: "var(--ink-faint)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip {...tooltipStyles} />
            <Bar
              dataKey="success"
              name="Success"
              fill={CHART_COLORS.success}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="failure"
              name="Failure"
              fill={CHART_COLORS.failure}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  if (embedded) {
    return chart;
  }

  return <div>{chart}</div>;
}

function createTimeBuckets(events: StoredEvent[], timeRange: TimeRange) {
  const finishedEvents = getFinishedEvents(events);

  if (finishedEvents.length === 0) return [];

  const now = Date.now();

  const cutoffMap: Record<TimeRange, number> = {
    day: now - TIME_RANGE_MS.day,
    week: now - TIME_RANGE_MS.week,
    month: now - TIME_RANGE_MS.month,
    all: 0,
  };
  const cutoff = cutoffMap[timeRange];

  const eventTimes = finishedEvents
    .map((e) => {
      const payload = e.payload;
      const time = new Date(payload.finished || payload.started).getTime();
      const hasFailed = hasFailedActions(payload.enrollmentActions);
      return { time, success: !hasFailed };
    })
    .filter((e) => !isNaN(e.time) && e.time >= cutoff);

  if (eventTimes.length === 0) return [];

  const timestamps = eventTimes.map((e) => e.time);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  let bucketSize: number;
  let formatOptions: Intl.DateTimeFormatOptions;
  let maxBuckets: number;

  if (timeRange === "day") {
    bucketSize = TIME_RANGE_MS.hour;
    formatOptions = { hour: "numeric" };
    maxBuckets = 24;
  } else if (timeRange === "week") {
    bucketSize = TIME_RANGE_MS.day;
    formatOptions = { weekday: "short" };
    maxBuckets = 7;
  } else if (timeRange === "month") {
    bucketSize = TIME_RANGE_MS.day;
    formatOptions = { month: "short", day: "numeric" };
    maxBuckets = 15;
  } else {
    const range = maxTime - minTime;
    if (range <= 7 * TIME_RANGE_MS.day) {
      bucketSize = TIME_RANGE_MS.day;
      formatOptions = { weekday: "short" };
    } else {
      bucketSize = TIME_RANGE_MS.day;
      formatOptions = { month: "short", day: "numeric" };
    }
    maxBuckets = 15;
  }

  const buckets: Map<number, { success: number; failure: number }> = new Map();
  const startBucket = Math.floor(minTime / bucketSize) * bucketSize;
  const endBucket = Math.floor(maxTime / bucketSize) * bucketSize;

  for (let bucket = startBucket; bucket <= endBucket; bucket += bucketSize) {
    buckets.set(bucket, { success: 0, failure: 0 });
  }

  for (const { time, success } of eventTimes) {
    const bucket = Math.floor(time / bucketSize) * bucketSize;
    const data = buckets.get(bucket);
    if (data) {
      if (success) {
        data.success++;
      } else {
        data.failure++;
      }
    }
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, data]) => ({
      label: new Date(timestamp).toLocaleString("en-US", formatOptions),
      ...data,
    }))
    .slice(-maxBuckets);
}
