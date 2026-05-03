"use client";

import { useToast, type ToastItem } from "./toast-provider";

const iconMap: Record<ToastItem["type"], React.ReactNode> = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
      <path d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  ),
};

const variantClasses: Record<ToastItem["type"], string> = {
  success: "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)]",
  error: "border-[var(--color-accent-coral)]/30 bg-[var(--color-accent-coral)]/10 text-[var(--color-accent-coral)]",
  warning: "border-[var(--color-accent-amber)]/30 bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]",
  info: "border-[var(--color-accent-blue)]/30 bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]",
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium shadow-xl ${variantClasses[toast.type]}`}
      role="alert"
      style={{
        animation: "toast-slide-in 0.25s ease-out forwards",
      }}
    >
      {iconMap[toast.type]}
      <span className="flex-1">{toast.title}</span>
      <button
        onClick={onDismiss}
        className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
          <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(16px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-slide-out {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(16px) scale(0.96); }
        }
      `}</style>
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </>
  );
}
