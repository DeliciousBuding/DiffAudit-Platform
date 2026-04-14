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
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10 }}
        />
        <Radar
          name="Recon"
          dataKey="Recon"
          stroke="#ff5f46"
          fill="#ff5f46"
          fillOpacity={0.12}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Radar
          name="PIA"
          dataKey="PIA"
          stroke="#b67619"
          fill="#b67619"
          fillOpacity={0.12}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Radar
          name="GSA"
          dataKey="GSA"
          stroke="#2f6df6"
          fill="#2f6df6"
          fillOpacity={0.12}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
