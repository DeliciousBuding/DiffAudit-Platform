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
  data: { level: string; count: number }[];
}

const RISK_COLORS: Record<string, string> = {
  High: "#ff5f46",
  Medium: "#b67619",
  Low: "#157a52",
};

export function ChartRiskDistribution({ data }: RiskDistributionProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="level"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
          {data.map((entry, index) => (
            <Cell key={index} fill={RISK_COLORS[entry.level] || "var(--accent-blue)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
