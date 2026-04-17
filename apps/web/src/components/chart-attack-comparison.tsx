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
  data: {
    dimension: string;
    Recon: number;
    PIA: number;
    GSA: number;
  }[];
}

/** Track colors using CSS variables for theme consistency */
const TRACK_COLORS = {
  recon: "var(--risk-high, #ff5f46)",
  pia: "var(--risk-medium, #b67619)",
  gsa: "var(--accent-blue, #2f6df6)",
};

/** Shared tooltip style for charts */
const chartTooltipStyle: React.CSSProperties = {
  fontSize: 11,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
};

export function ChartAttackComparison({ data }: AttackComparisonProps) {
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
        <Radar
          name="Recon"
          dataKey="Recon"
          stroke={TRACK_COLORS.recon}
          fill={TRACK_COLORS.recon}
          fillOpacity={0.12}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Radar
          name="PIA"
          dataKey="PIA"
          stroke={TRACK_COLORS.pia}
          fill={TRACK_COLORS.pia}
          fillOpacity={0.12}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Radar
          name="GSA"
          dataKey="GSA"
          stroke={TRACK_COLORS.gsa}
          fill={TRACK_COLORS.gsa}
          fillOpacity={0.12}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
