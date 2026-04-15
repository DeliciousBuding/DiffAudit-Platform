"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ChartEmptyState } from "./chart-empty-state";

interface RocCurveProps {
  data: { fpr: number; tpr: number }[];
}

/** Shared tooltip style for charts */
const chartTooltipStyle: React.CSSProperties = {
  fontSize: 11,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
};

export function ChartRocCurve({ data }: RocCurveProps) {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="No ROC data available / 暂无 ROC 数据" height={220} />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={220} aspect={1.8}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="fpr"
          domain={[0, 1]}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => v.toFixed(1)}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          label={{ value: "False Positive Rate", position: "bottom", fontSize: 10, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickFormatter={(v: number) => v.toFixed(1)}
          tickLine={false}
          axisLine={false}
          label={{ value: "True Positive Rate", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--muted-foreground)" }}
        />
        <Tooltip contentStyle={chartTooltipStyle} />
        <ReferenceLine
          segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
          stroke="var(--muted-foreground)"
          strokeDasharray="4 4"
          opacity={0.4}
        />
        <Line
          type="monotone"
          dataKey="tpr"
          stroke="var(--accent-blue)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
