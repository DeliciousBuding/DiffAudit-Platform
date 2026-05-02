import { LayoutDashboard, Database, ShieldAlert, FileBarChart, Key, User, Settings } from "lucide-react";
import { BrandMark as SiteBrandMark } from "@/components/brand-mark";

export function BrandMark() {
  return <SiteBrandMark compact href="/" prefetch={false} />;
}

export function NavIcon({ icon }: { icon: "spark" | "dashboard" | "model" | "risk" | "report" | "key" | "account" | "settings" }) {
  const iconMap: Record<string, React.ReactNode> = {
    settings: <Settings size={18} strokeWidth={1.5} />,
    key: <Key size={18} strokeWidth={1.5} />,
    model: <Database size={18} strokeWidth={1.5} />,
    spark: <LayoutDashboard size={18} strokeWidth={1.5} />,
    dashboard: <LayoutDashboard size={18} strokeWidth={1.5} />,
    report: <FileBarChart size={18} strokeWidth={1.5} />,
    risk: <ShieldAlert size={18} strokeWidth={1.5} />,
    account: <User size={18} strokeWidth={1.5} />,
  };

  return <>{iconMap[icon] ?? <LayoutDashboard size={18} strokeWidth={1.5} />}</>;
}

export function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.79 8.2 11.38.6.11.82-.25.82-.56 0-.28-.01-1.2-.01-2.19-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48 1 .11-.77.42-1.3.77-1.6-2.66-.3-5.45-1.33-5.45-5.94 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.55.12-3.22 0 0 1-.32 3.3 1.23A11.4 11.4 0 0 1 12 5.8c1.02 0 2.05.14 3.01.42 2.29-1.55 3.29-1.23 3.29-1.23.66 1.67.24 2.91.12 3.22.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.63-5.47 5.93.43.38.81 1.11.81 2.23 0 1.61-.01 2.9-.01 3.29 0 .31.21.68.82.56A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

