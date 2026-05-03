"use client";

import { useRouter } from "next/navigation";
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
  onClick?: (entry: { key: string; label: string; count: number }) => void;
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

export function ChartRiskDistribution({ data, onClick }: RiskDistributionProps) {
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
        <Tooltip
          contentStyle={chartTooltipStyle}
          formatter={((value: number) => [value, "Count"]) as (...args: unknown[]) => React.ReactNode}
        />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
          isAnimationActive={false}
          onClick={onClick ? (entry) => onClick(entry as unknown as { key: string; label: string; count: number }) : undefined}
          style={onClick ? { cursor: "pointer" } : undefined}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={RISK_COLORS[entry.key] || "var(--accent-blue)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Interactive wrapper that navigates to risk-findings on bar click */
export function InteractiveRiskDistribution({
  data,
}: {
  data: { key: string; label: string; count: number }[];
}) {
  const router = useRouter();

  function handleClick(entry: { key: string }) {
    router.push(`/workspace/risk-findings?severity=${entry.key}`);
  }

  return <ChartRiskDistribution data={data} onClick={handleClick} />;
}
