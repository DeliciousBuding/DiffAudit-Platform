"use client";

import { ToastProvider } from "@/components/toast-provider";
import { ToastContainer } from "@/components/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
