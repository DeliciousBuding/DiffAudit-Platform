import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { RouteRecovery } from "@/components/route-recovery";
import { ThemeProvider } from "@/components/theme-provider";
import { router } from "@/router/routes";

import "./app/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      <RouteRecovery />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
