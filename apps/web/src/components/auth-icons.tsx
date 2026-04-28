"use client";

type Provider = "google" | "github";
type FieldIcon = "user" | "mail" | "lock" | "shield";

export function ProviderIcon({ provider, className = "h-5 w-5" }: { provider: Provider; className?: string }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.48a5.54 5.54 0 0 1-2.4 3.63v3.02h3.9c2.28-2.1 3.54-5.2 3.54-8.68Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.9-3.02c-1.07.72-2.45 1.15-4.04 1.15-3.11 0-5.75-2.1-6.7-4.92H1.28v3.11A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.3 14.31a7.2 7.2 0 0 1 0-4.62V6.58H1.28a12 12 0 0 0 0 10.84l4.02-3.11Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.58 1.77l3.44-3.44C17.94 1.16 15.23 0 12 0A12 12 0 0 0 1.28 6.58l4.02 3.11c.94-2.82 3.58-4.92 6.7-4.92Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-current`}>
      <path d="M12 0C5.37 0 0 5.49 0 12.26c0 5.42 3.44 10.01 8.2 11.64.6.11.82-.26.82-.58 0-.28-.01-1.22-.01-2.22-3.34.75-4.04-1.46-4.04-1.46-.55-1.4-1.33-1.78-1.33-1.78-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.27 1.84 1.27 1.07 1.88 2.8 1.34 3.48 1.02.11-.79.42-1.34.77-1.65-2.66-.31-5.45-1.37-5.45-6.08 0-1.34.47-2.43 1.24-3.29-.12-.32-.54-1.58.12-3.3 0 0 1-.33 3.3 1.26A11.2 11.2 0 0 1 12 5.95c1.02 0 2.05.15 3.01.43 2.29-1.59 3.29-1.26 3.29-1.26.66 1.72.24 2.98.12 3.3.77.86 1.24 1.95 1.24 3.29 0 4.72-2.8 5.77-5.47 6.08.43.4.81 1.14.81 2.3 0 1.66-.01 2.99-.01 3.39 0 .33.21.71.82.58A12.24 12.24 0 0 0 24 12.26C24 5.49 18.63 0 12 0Z" />
    </svg>
  );
}

export function InputIcon({ icon, className = "h-4 w-4" }: { icon: FieldIcon; className?: string }) {
  if (icon === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current stroke-[1.8]`}>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
        <path d="m5.5 7.5 6.5 5 6.5-5" />
      </svg>
    );
  }

  if (icon === "lock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current stroke-[1.8]`}>
        <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
        <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" />
      </svg>
    );
  }

  if (icon === "shield") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current stroke-[1.8]`}>
        <path d="M12 3.5 5.5 6v5.7c0 4.27 2.55 7.32 6.5 8.8 3.95-1.48 6.5-4.53 6.5-8.8V6L12 3.5Z" />
        <path d="m9.3 12 1.85 1.86 3.55-3.71" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current stroke-[1.8]`}>
      <path d="M12 4a4 4 0 1 1 0 8a4 4 0 0 1 0-8Z" />
      <path d="M5 19.5c1.7-3.1 4.03-4.65 7-4.65s5.3 1.55 7 4.65" />
    </svg>
  );
}
