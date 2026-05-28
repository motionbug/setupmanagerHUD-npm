import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { StoredEvent } from "@/types";
import { getFinishedEvents } from "@/types";
import { tooltipStyles, CHART_COLORS } from "@/lib/chartStyles";

interface ActionsChartProps {
  events: StoredEvent[];
  embedded?: boolean;
}

export function ActionsChart({ events, embedded = false }: ActionsChartProps) {
  const actionData = getFinishedEvents(events)
    .flatMap((e) => e.payload.enrollmentActions || [])
    .reduce(
      (acc, action) => {
        if (!acc[action.label]) {
          acc[action.label] = { label: action.label, finished: 0, failed: 0 };
        }
        if (action.status === "finished") acc[action.label].finished++;
        else acc[action.label].failed++;
        return acc;
      },
      {} as Record<string, { label: string; finished: number; failed: number }>
    );

  const chartData = Object.values(actionData)
    .sort((a, b) => b.finished + b.failed - (a.finished + a.failed))
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-edge text-ink-faint text-base">
        No enrollment action data yet
      </div>
    );
  }

  const chart = (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" barCategoryGap="18%">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--edge-subtle)" />
        <XAxis
          type="number"
          tick={{ fontSize: 13, fill: "var(--ink-faint)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--edge-subtle)" }}
        />
        <YAxis
          dataKey="label"
          type="category"
          tick={{ fontSize: 13, fill: "var(--ink-muted)" }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip {...tooltipStyles} />
        <Bar
          dataKey="finished"
          name="Finished"
          fill={CHART_COLORS.success}
          stackId="a"
          radius={[0, 6, 6, 0]}
        />
        <Bar
          dataKey="failed"
          name="Failed"
          fill={CHART_COLORS.failure}
          stackId="a"
          radius={[0, 6, 6, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  if (embedded) {
    return chart;
  }

  return <div>{chart}</div>;
}
