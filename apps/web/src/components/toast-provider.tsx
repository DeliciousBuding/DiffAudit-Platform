"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (opts: { type: ToastType; title: string; duration?: number }) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

function generateId(): string {
  return `toast-${Date.now()}-${++nextId}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: { type: ToastType; title: string; duration?: number }) => {
      const id = generateId();
      const duration = opts.duration ?? 3000;
      setToasts((prev) => {
        const next = [...prev, { id, type: opts.type, title: opts.title, duration }];
        return next.length > 3 ? next.slice(next.length - 3) : next;
      });
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a no-op toast when used outside ToastProvider (e.g., in tests)
    return { toasts: [], toast: () => {}, dismiss: () => {} } satisfies ToastContextValue;
  }
  return ctx;
}
