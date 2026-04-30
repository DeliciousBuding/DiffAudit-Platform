"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RiskDistributionProps {
  data: { key: string; label: string; count: number }[];
}

const RISK_COLORS: Record<string, string> = {
  high: "var(--risk-high, #ff5f46)",
  medium: "var(--risk-medium, #b67619)",
  low: "var(--success, #157a52)",
};

/** Shared tooltip style for charts */
const chartTooltipStyle: React.CSSProperties = {
  fontSize: 11,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
};

export function ChartRiskDistribution({ data }: RiskDistributionProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell key={index} fill={RISK_COLORS[entry.key] || "var(--accent-blue)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
