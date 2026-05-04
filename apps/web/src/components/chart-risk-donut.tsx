"use client";

import { useRouter } from "next/navigation";

interface RiskDonutProps {
  data: { key: string; label: string; count: number }[];
  totalLabel?: string;
  height?: number;
}

const RISK_COLORS: Record<string, string> = {
  high: "var(--risk-high, #ff5f46)",
  medium: "var(--risk-medium, #b67619)",
  low: "var(--success, #22c55e)",
};

function donutSegment(cx: number, cy: number, radius: number, start: number, end: number) {
  const startRad = (start - 90) * Math.PI / 180;
  const endRad = (end - 90) * Math.PI / 180;
  const startPoint = { x: cx + radius * Math.cos(startRad), y: cy + radius * Math.sin(startRad) };
  const endPoint = { x: cx + radius * Math.cos(endRad), y: cy + radius * Math.sin(endRad) };
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y}`;
}

export function ChartRiskDonut({ data, totalLabel = "总结果", height = 160 }: RiskDonutProps) {
  const router = useRouter();
  const total = data.reduce((acc, item) => acc + item.count, 0);
  const chartSize = Math.max(106, Math.min(124, height - 46));
  let cursor = 0;

  return (
    <div className="risk-donut-wrap" style={{ height }}>
      <div className="risk-donut-canvas" style={{ height: chartSize, width: chartSize }}>
        <svg viewBox="0 0 160 160" width={chartSize} height={chartSize} role="img" aria-label="Risk distribution">
          <circle cx="80" cy="80" r="58" fill="none" stroke="var(--muted)" strokeWidth="18" opacity="0.55" />
          {data.map((item) => {
            const start = cursor;
            const sweep = total > 0 ? (item.count / total) * 360 : 0;
            cursor += sweep;
            return (
              <path
                key={item.key}
                d={donutSegment(80, 80, 58, start, start + Math.max(0.1, sweep))}
                fill="none"
                stroke={RISK_COLORS[item.key] || "var(--accent-blue)"}
                strokeWidth="18"
                strokeLinecap="round"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/workspace/risk-findings?severity=${item.key}`)}
              />
            );
          })}
        </svg>
        <div className="risk-donut-center">
          <strong>{total}</strong>
          <small>{totalLabel}</small>
        </div>
      </div>
      <ul className="risk-donut-legend">
        {data.map((item) => {
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0";
          return (
            <li key={item.key}>
              <span style={{ background: RISK_COLORS[item.key] }} />
              <em>{item.label}</em>
              <strong>{item.count}</strong>
              <i>{pct}%</i>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
