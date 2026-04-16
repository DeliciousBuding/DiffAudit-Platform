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
import { ChartEmptyState } from "./chart-empty-state";

interface RiskRadarData {
  dimension: string;
  label: string;
  value: number; // 0-1
}

interface ChartRiskRadarProps {
  data: RiskRadarData[];
  height?: number;
}

/** Shared tooltip style for charts */
const chartTooltipStyle: React.CSSProperties = {
  fontSize: 11,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
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

  if (!data || data.length === 0) {
    return <ChartEmptyState message="No radar data available / 暂无雷达数据" height={height} />;
  }

  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(33, 34, 38, 0.1)";
  const tickColor = isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(33, 34, 38, 0.6)";
  const tickFont = {
    fill: tickColor,
    fontSize: 10,
    fontFamily: "\"PingFang SC\", \"Microsoft YaHei\", \"Segoe UI\", sans-serif",
    fontWeight: 500,
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="label"
          tick={tickFont}
          tickLine={false}
        />
        <PolarRadiusAxis
          domain={[0, 1]}
          tick={{ ...tickFont, fontSize: 9 }}
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
              <div style={{ ...chartTooltipStyle, padding: "6px 10px" }}>
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
