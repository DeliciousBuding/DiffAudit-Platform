"use client";

type KpiCardProps = {
  label: string;
  value: string | number;
  note?: string;
  icon?: React.ReactNode;
};

export function KpiCard({ label, value, note, icon }: KpiCardProps) {
  return (
    <div className="workspace-kpi-card">
      <div className="workspace-kpi-card-head">
        {icon && <span className="workspace-kpi-icon">{icon}</span>}
        <span className="workspace-kpi-card-label">{label}</span>
      </div>
      <span className="workspace-kpi-card-value">{value}</span>
      {note && <p className="workspace-kpi-card-note">{note}</p>}
    </div>
  );
}
