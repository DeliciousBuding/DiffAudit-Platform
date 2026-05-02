"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AttackComparisonProps {
  data: Record<string, string | number>[];
}

/** Color palette for attack families */
const FAMILY_COLORS = [
  "var(--risk-high, #ff5f46)",
  "var(--risk-medium, #b67619)",
  "var(--accent-blue, #2f6df6)",
  "var(--success, #22c55e)",
  "var(--info, #3b82f6)",
];

/** Shared tooltip style for charts */
const chartTooltipStyle: React.CSSProperties = {
  fontSize: 11,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
};

/** Extract numeric data keys from the data (exclude string keys like "dimension") */
function getNumericKeys(data: Record<string, string | number>[]): string[] {
  if (data.length === 0) return [];
  const first = data[0];
  return Object.keys(first).filter((k) => typeof first[k] === "number");
}

export function ChartAttackComparison({ data }: AttackComparisonProps) {
  const keys = getNumericKeys(data);

  if (data.length === 0 || keys.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-xs text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
        />
        <PolarRadiusAxis
          tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
          axisLine={false}
          domain={[0, 1]}
          tickCount={5}
        />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Legend
          wrapperStyle={{ fontSize: 10 }}
        />
        {keys.map((key, i) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={FAMILY_COLORS[i % FAMILY_COLORS.length]}
            fill={FAMILY_COLORS[i % FAMILY_COLORS.length]}
            fillOpacity={0.12}
            strokeWidth={2}
            isAnimationActive={false}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
