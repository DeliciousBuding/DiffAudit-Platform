"use client";

import { PieChart, Pie, Cell } from "recharts";

type RadialGaugeProps = {
  value: number;
  label?: string;
  size?: number;
  /** If provided, the entire filled arc uses this single color.
   *  If omitted, the filled arc is split into green/yellow/red risk zones. */
  color?: string;
};

export function RadialGauge({ value, label, size = 120, color }: RadialGaugeProps) {
  const v = Math.max(0, Math.min(100, value));
  const GAP = 3;

  const data: { name: string; value: number; fill: string }[] = [];

  if (color) {
    /* Single-color mode: one filled arc + empty arc with a gap between */
    if (v > 0) {
      data.push({ name: "filled", value: v, fill: color });
    }
    if (v < 100) {
      if (v > 0) data.push({ name: "gap", value: GAP, fill: "transparent" });
      data.push({ name: "empty", value: 100 - v - (v > 0 ? GAP : 0), fill: "var(--border)" });
    }
  } else {
    /* Risk-zone mode: green (0-40) / yellow (40-70) / red (70-100) — vivid */
    const ZONES = [
      { limit: 40, fill: "var(--risk-low, #10b981)" },
      { limit: 70, fill: "var(--risk-medium, #f59e0b)" },
      { limit: 100, fill: "var(--risk-high, #ef4444)" },
    ] as const;

    let prevLimit = 0;
    for (const zone of ZONES) {
      const zoneSize = zone.limit - prevLimit;
      const filledInZone = Math.max(0, Math.min(zoneSize, v - prevLimit));

      if (filledInZone > 0) {
        if (data.length > 0) {
          data.push({ name: `gap-${zone.limit}`, value: GAP, fill: "transparent" });
        }
        data.push({ name: `seg-${zone.limit}`, value: filledInZone, fill: zone.fill });
      }
      prevLimit = zone.limit;
    }

    const totalFilled = data.reduce((s, d) => (d.fill === "transparent" ? s : s + d.value), 0);
    const emptyValue = 100 - totalFilled - (data.length > 0 ? GAP : 0);
    if (emptyValue > 0) {
      if (data.length > 0) {
        data.push({ name: "gap-empty", value: GAP, fill: "transparent" });
      }
      data.push({ name: "empty", value: emptyValue, fill: "var(--border)" });
    }
  }

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={size * 0.36}
          outerRadius={size * 0.46}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: "var(--foreground)" }}>
          {value}
        </span>
        {label && (
          <span style={{ fontSize: size * 0.1, color: "var(--muted-foreground)" }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
