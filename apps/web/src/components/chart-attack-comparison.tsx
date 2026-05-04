"use client";

interface AttackComparisonProps {
  data: Record<string, string | number>[];
  height?: number;
}

const FAMILY_COLORS = [
  "var(--risk-high, #ff5f46)",
  "var(--risk-medium, #b67619)",
  "var(--accent-blue, #2f6df6)",
  "var(--success, #22c55e)",
  "var(--info, #3b82f6)",
];

function getNumericKeys(data: Record<string, string | number>[]): string[] {
  if (data.length === 0) return [];
  const first = data[0];
  return Object.keys(first).filter((k) => typeof first[k] === "number");
}

export function ChartAttackComparison({ data, height = 170 }: AttackComparisonProps) {
  const keys = getNumericKeys(data);
  const width = 220;
  const cx = width / 2;
  const cy = 73;
  const radius = 58;

  if (data.length === 0 || keys.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-xs text-muted-foreground">
        No data available
      </div>
    );
  }

  const angleFor = (index: number) => (Math.PI * 2 * index) / data.length - Math.PI / 2;
  const polygonFor = (key: string) => data.map((entry, index) => {
    const value = typeof entry[key] === "number" ? Math.max(0, Math.min(1, entry[key] as number)) : 0;
    const angle = angleFor(index);
    return `${(cx + Math.cos(angle) * radius * value).toFixed(2)},${(cy + Math.sin(angle) * radius * value).toFixed(2)}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Attack comparison">
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={data.map((_, index) => {
            const angle = angleFor(index);
            return `${(cx + Math.cos(angle) * radius * ratio).toFixed(2)},${(cy + Math.sin(angle) * radius * ratio).toFixed(2)}`;
          }).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      {data.map((entry, index) => {
        const angle = angleFor(index);
        const x = cx + Math.cos(angle) * (radius + 16);
        const y = cy + Math.sin(angle) * (radius + 16);
        return (
          <g key={String(entry.dimension)}>
            <line x1={cx} y1={cy} x2={cx + Math.cos(angle) * radius} y2={cy + Math.sin(angle) * radius} stroke="var(--border)" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="var(--muted-foreground)">
              {String(entry.dimension)}
            </text>
          </g>
        );
      })}
      {keys.map((key, index) => (
        <polygon
          key={key}
          points={polygonFor(key)}
          fill={FAMILY_COLORS[index % FAMILY_COLORS.length]}
          fillOpacity="0.12"
          stroke={FAMILY_COLORS[index % FAMILY_COLORS.length]}
          strokeWidth="2"
        />
      ))}
      <g transform={`translate(64 ${height - 34})`}>
        {keys.slice(0, 3).map((key, index) => (
          <g key={key} transform={`translate(0 ${index * 12})`}>
            <rect width="8" height="8" rx="2" fill={FAMILY_COLORS[index % FAMILY_COLORS.length]} />
            <text x="12" y="8" fontSize="10" fill="var(--muted-foreground)">{key}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
