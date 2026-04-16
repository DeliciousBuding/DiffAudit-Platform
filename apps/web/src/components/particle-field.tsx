
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";

export const PARTICLE_COUNT = 5000;
export const MEMBER_COLORS = [];

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = width * dpr;
    canvasRef.current.height = height * dpr;
    canvasRef.current.style.width = width + "px";
    canvasRef.current.style.height = height + "px";
    canvasRef.current.getContext("2d")?.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const isDark = theme === "dark";

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const generateTargets = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      const tX = width / 2;
      const tY = height / 2;
      return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        // Big spread out shape so it doesnt get blocked by hero entirely
        const r = 350 + Math.random() * 400 * Math.sin(u*6) * Math.cos(v*6);
        
        let tx = tX + r * Math.cos(u) * Math.sin(v);
        let ty = tY + r * Math.sin(u) * Math.sin(v);
        
        if (Math.random() > 0.4) { // 60% of particles fill entire screen
          tx = Math.random() * width;
          ty = Math.random() * height;
        }

        const isAccent = Math.random() > 0.8;
        const color = isDark
          ? (isAccent ? "rgba(47, 109, 246, 0.7)" : "rgba(100, 116, 139, 0.4)")
          : (isAccent ? "rgba(47, 109, 246, 0.7)" : "rgba(100, 116, 139, 0.4)");
        
        return {
          ox: Math.random() * width,
          oy: Math.random() * height,
          tx: tx,
          ty: ty,
          x: 0, y: 0,
          color: color,
          size: (Math.random() * 1.5 + 0.8) * (isDark ? 1 : 1.5)
        };
      });
    };

    let particles = generateTargets();
    let animId: number;
    let start = Date.now();
    const CYCLE = 8000;

    const draw = () => {
      if (!canvasRef.current) return;
      const now = Date.now();
      const t = (now - start) % CYCLE;
      let noiseLevel = 0;
      if (t < 2000) {
        noiseLevel = t / 2000;
      } else if (t < 3000) {
        noiseLevel = 1;
      } else if (t < 6000) {
        noiseLevel = 1 - (t - 3000) / 3000;
        noiseLevel = noiseLevel * noiseLevel * (3 - 2 * noiseLevel);
      }

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // dynamic noise center vs strict target
        const offsetRange = 100;
        const randX = p.ox + Math.sin(now * 0.001 + p.tx) * offsetRange;
        const randY = p.oy + Math.cos(now * 0.001 + p.ty) * offsetRange;
        
        p.x = p.tx * (1 - noiseLevel) + randX * noiseLevel;
        p.y = p.ty * (1 - noiseLevel) + randY * noiseLevel;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        // smaller when structured
        ctx.arc(p.x, p.y, p.size * (1 + (1-noiseLevel)), 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [theme]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-10 overflow-hidden pointer-events-none ${className || ""}`} style={{ opacity: theme === "dark" ? 0.9 : 0.4 }}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}

