"use client";

interface RocCurveProps {
  data: { fpr: number; tpr: number }[];
  height?: number;
}

export function ChartRocCurve({ data, height = 220 }: RocCurveProps) {
  const width = 320;
  const padding = { top: 12, right: 14, bottom: 24, left: 30 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const point = (fpr: number, tpr: number) => ({
    x: padding.left + Math.max(0, Math.min(1, fpr)) * plotWidth,
    y: padding.top + (1 - Math.max(0, Math.min(1, tpr))) * plotHeight,
  });
  const path = data.map((item, index) => {
    const p = point(item.fpr, item.tpr);
    return `${index === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="ROC curve">
      <g stroke="var(--border)" strokeWidth="1">
        {[0, 0.5, 1].map((ratio) => {
          const x = padding.left + plotWidth * ratio;
          const y = padding.top + plotHeight * ratio;
          return (
            <g key={ratio}>
              <line x1={x} x2={x} y1={padding.top} y2={padding.top + plotHeight} strokeDasharray="3 3" />
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} strokeDasharray="3 3" />
            </g>
          );
        })}
      </g>
      <line
        x1={padding.left}
        y1={padding.top + plotHeight}
        x2={width - padding.right}
        y2={padding.top}
        stroke="var(--muted-foreground)"
        strokeDasharray="4 4"
        opacity="0.45"
      />
      <path d={path} fill="none" stroke="var(--accent-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.slice(0, 1).concat(data.slice(-1)).map((item, index) => {
        const p = point(item.fpr, item.tpr);
        return <circle key={index} cx={p.x} cy={p.y} r="3.5" fill="var(--accent-blue)" />;
      })}
      <text x={padding.left} y={height - 8} fontSize="10" fill="var(--muted-foreground)">FPR</text>
      <text x={padding.left - 22} y={padding.top + 8} fontSize="10" fill="var(--muted-foreground)">TPR</text>
    </svg>
  );
}
