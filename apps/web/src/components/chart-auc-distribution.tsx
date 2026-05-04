"use client";

interface AucDistributionProps {
  data: { auc: number; count: number }[];
  height?: number;
}

export function ChartAucDistribution({ data, height = 220 }: AucDistributionProps) {
  const width = 320;
  const padding = { top: 12, right: 14, bottom: 24, left: 30 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxCount = Math.max(1, ...data.map((item) => item.count));
  const barGap = 7;
  const barWidth = data.length > 0
    ? Math.max(10, (plotWidth - barGap * (data.length - 1)) / data.length)
    : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="AUC distribution">
      <g stroke="var(--border)" strokeWidth="1">
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + plotHeight * ratio;
          return <line key={ratio} x1={padding.left} x2={width - padding.right} y1={y} y2={y} strokeDasharray="3 3" />;
        })}
      </g>
      {data.map((item, index) => {
        const x = padding.left + index * (barWidth + barGap);
        const barHeight = (item.count / maxCount) * plotHeight;
        const y = padding.top + plotHeight - barHeight;
        return (
          <g key={`${item.auc}-${index}`}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="var(--accent-blue)" />
            <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
              {item.auc.toFixed(1)}
            </text>
          </g>
        );
      })}
      <line x1={padding.left} x2={width - padding.right} y1={padding.top + plotHeight} y2={padding.top + plotHeight} stroke="var(--border)" />
    </svg>
  );
}
