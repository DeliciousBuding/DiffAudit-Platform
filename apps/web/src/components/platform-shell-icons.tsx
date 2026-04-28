import { BrandMark as SiteBrandMark } from "@/components/brand-mark";

export function BrandMark() {
  return <SiteBrandMark compact href="/" prefetch={false} />;
}

export function NavIcon({ icon }: { icon: "spark" | "dashboard" | "report" | "settings" | "key" | "account" }) {
  if (icon === "key") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    );
  }

  if (icon === "spark") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
      >
        <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
        <path d="M18.5 15.5 20 19l-3.5-1.5L15 14l3.5 1.5Z" />
        <path d="M7 15.2 8 18l-2.8-1-1-2.8 2.8 1Z" />
      </svg>
    );
  }

  if (icon === "dashboard") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
      >
        <rect x="3.5" y="4" width="7.5" height="7.5" rx="1.8" />
        <rect x="13" y="4" width="7.5" height="4.5" rx="1.8" />
        <rect x="13" y="10.5" width="7.5" height="9.5" rx="1.8" />
        <rect x="3.5" y="13.5" width="7.5" height="6.5" rx="1.8" />
      </svg>
    );
  }

  if (icon === "report") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
      >
        <path d="M7 3.5h8l4 4V19a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V5.3A1.8 1.8 0 0 1 7 3.5Z" />
        <path d="M15 3.8V8h4.2" />
        <path d="M8.5 12h7" />
        <path d="M8.5 15.5h7" />
      </svg>
    );
  }

  if (icon === "account") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
      >
        <path d="M12 3.8a3.2 3.2 0 1 1 0 6.4a3.2 3.2 0 0 1 0-6.4Z" />
        <path d="M4.5 19.2c1.8-3.1 4.3-4.6 7.5-4.6s5.7 1.5 7.5 4.6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
    >
      <path d="M12 3.8a3.2 3.2 0 1 1 0 6.4a3.2 3.2 0 0 1 0-6.4Z" />
      <path d="M4.5 19.2c1.8-3.1 4.3-4.6 7.5-4.6s5.7 1.5 7.5 4.6" />
      <path d="M6 7.5h.01" />
      <path d="M18 7.5h.01" />
    </svg>
  );
}

export function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.79 8.2 11.38.6.11.82-.25.82-.56 0-.28-.01-1.2-.01-2.19-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48 1 .11-.77.42-1.3.77-1.6-2.66-.3-5.45-1.33-5.45-5.94 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.55.12-3.22 0 0 1-.32 3.3 1.23A11.4 11.4 0 0 1 12 5.8c1.02 0 2.05.14 3.01.42 2.29-1.55 3.29-1.23 3.29-1.23.66 1.67.24 2.91.12 3.22.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.63-5.47 5.93.43.38.81 1.11.81 2.23 0 1.61-.01 2.9-.01 3.29 0 .31.21.68.82.56A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

