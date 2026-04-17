"use client";

import { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
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

/** Shared tooltip style for charts — avoids duplication */
const chartTooltipStyle: React.CSSProperties = {
  fontSize: 11,
  borderRadius: 4,
  padding: "4px 8px",
};

export function ChartRiskRadar({ data, height = 260 }: ChartRiskRadarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const update = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark",
      );
    };
    update();
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "class" || m.attributeName === "data-theme") {
          update();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

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
        <Tooltip
          content={({ payload }) => {
            if (!payload?.length) return null;
            const p = payload[0];
            return (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, padding: "6px 10px", ...chartTooltipStyle }}>
                <div style={{ fontWeight: 600 }}>{p.payload?.label ?? p.name}</div>
                <div style={{ color: "var(--muted-foreground)" }}>{(p.value as number)?.toFixed(2)}</div>
              </div>
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
