"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 shadow-lg backdrop-blur-sm transition-all hover:bg-muted/40 hover:shadow-xl"
      aria-label="Scroll to top"
      style={{ animation: "page-fade-in 0.2s ease forwards" }}
    >
      <ChevronUp size={18} strokeWidth={1.5} className="text-muted-foreground" />
    </button>
  );
}
