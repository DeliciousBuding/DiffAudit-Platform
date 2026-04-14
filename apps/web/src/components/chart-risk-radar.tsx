"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface RiskRadarData {
  dimension: string;
  label: string;
  value: number; // 0-1
}

interface ChartRiskRadarProps {
  data: RiskRadarData[];
  height?: number;
}

export function ChartRiskRadar({ data, height = 260 }: ChartRiskRadarProps) {
  const isDark = typeof document !== "undefined" && (
    document.documentElement.classList.contains("dark") ||
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(33, 34, 38, 0.1)";
  const axisColor = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(33, 34, 38, 0.4)";
  const tickColor = isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(33, 34, 38, 0.6)";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fill: tickColor, fontSize: 10 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          domain={[0, 1]}
          tick={{ fill: tickColor, fontSize: 9 }}
          tickCount={5}
          axisLine={false}
          tickLine={false}
        />
        <Radar
          name="Risk"
          dataKey="value"
          stroke="var(--accent-blue, #2f6df6)"
          fill="var(--accent-blue, #2f6df6)"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--accent-blue, #2f6df6)", strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
