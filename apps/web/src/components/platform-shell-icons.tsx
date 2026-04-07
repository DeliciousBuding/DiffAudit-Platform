export function BrandMark() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true" className="h-[52px] w-[52px]">
      <defs>
        <linearGradient id="brandGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(258 60% 63%)" />
          <stop offset="100%" stopColor="hsl(203 89% 60%)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="52" height="52" rx="16" fill="url(#brandGradient)" />
      <path
        d="M26 11l12 4.6v8.4c0 8.1-4.8 14.6-12 17-7.2-2.4-12-8.9-12-17v-8.4L26 11Z"
        fill="rgba(255,255,255,0.18)"
      />
      <path
        d="M26 17.5a8.5 8.5 0 1 1 0 17a8.5 8.5 0 0 1 0-17Zm0 3a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z"
        fill="#fff"
      />
      <path d="M32.5 32.5l4.5 4.5" stroke="#fff" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

export function NavIcon({ icon }: { icon: "image" | "dashboard" | "stack" | "report" | "guide" }) {
  if (icon === "image") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
      >
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M6.5 17l4.2-4.6 3.1 3.2 2.7-2.8L19.5 17" />
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

  if (icon === "stack") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
      >
        <path d="M4 8.5 12 4l8 4.5-8 4.5L4 8.5Z" />
        <path d="M4 12.5 12 17l8-4.5" />
        <path d="M4 16.5 12 21l8-4.5" />
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

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]"
    >
      <path d="M4.5 6.5h15" />
      <path d="M4.5 12h15" />
      <path d="M4.5 17.5h9" />
      <path d="M16.5 17.5h3" />
      <path d="M7 3.5v6" />
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

