
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";

export const PARTICLE_COUNT = 8000;

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
        // Create an aesthetically pleasing complex geometric structure (layered rings / fingerprint / eye)
        let tx = 0, ty = 0;
        
        // Distribution of mathematical shapes
        const rando = Math.random();
        
        if (rando < 0.4) {
          // Inner dense torus / infinity node
          const t = Math.random() * Math.PI * 2;
          const a = 200 + Math.random() * 50; 
          const denom = 1 + Math.sin(t) * Math.sin(t);
          tx = tX + (a * Math.cos(t) * (1 + 0.2*Math.sin(t*8))) / denom;
          ty = tY + (a * Math.cos(t) * Math.sin(t) * (1 + 0.2*Math.sin(t*8))) / denom;
        } else if (rando < 0.7) {
          // Orbiting rings
          const t = Math.random() * Math.PI * 2;
          const rad = 450 + Math.random() * 80;
          tx = tX + rad * Math.cos(t);
          ty = tY + rad * Math.sin(t) * 0.4; // elliptical
        } else {
          // Wide outer aura structure
          const t = Math.random() * Math.PI * 2;
          const rad = width * Math.random();
          tx = tX + rad * Math.cos(t);
          ty = tY + rad * Math.sin(t);
        }

        const isAccent = Math.random() > 0.85;
        const color = isDark
          ? (isAccent ? "rgba(47, 109, 246, 0.4)" : "rgba(100, 116, 139, 0.2)")
          : (isAccent ? "rgba(47, 109, 246, 0.4)" : "rgba(100, 116, 139, 0.2)");
        
        return {
          tx: tx,
          ty: ty,
          color: color,
          size: (Math.random() * 1.5 + 0.5) * (isDark ? 1 : 1.2)
        };
      });
    };

    let particles = generateTargets();
    let animId: number;
    let start = Date.now();
    const CYCLE = 12000; 

    // We do not pre-calculate random start points, we calculate uniform random per frame based on time so it literally looks like TV static/noise

    const draw = () => {
      if (!canvasRef.current) return;
      const now = Date.now();
      const t = (now - start) % CYCLE;
      
      let noiseLevel = 0;
      if (t < 3000) {
        // Forward diffusion: structure -> noise
        noiseLevel = t / 3000;
        noiseLevel = noiseLevel * noiseLevel; // accelerate into noise
      } else if (t < 5000) {
        // Pure noise
        noiseLevel = 1;
      } else if (t < 10000) {
        // Reverse diffusion: noise -> structure
        noiseLevel = 1 - (t - 5000) / 5000;
        // smooth ease out
        noiseLevel = noiseLevel * noiseLevel * (3 - 2 * noiseLevel);
        noiseLevel = Math.pow(noiseLevel, 1.5); // stays noisy a bit longer, then snaps to structure
      } else {
        // Structured
        noiseLevel = 0;
      }

      ctx.clearRect(0, 0, width, height);

      // Pre-calculate rotation for the structure so the final image slowly breathes/spins
      const rotAlpha = now * 0.0002;
      const cosA = Math.cos(rotAlpha);
      const sinA = Math.sin(rotAlpha);
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // The target position with slight rotation
        const dx = p.tx - cx;
        const dy = p.ty - cy;
        const rotX = cx + (dx * cosA - dy * sinA);
        const rotY = cy + (dx * sinA + dy * cosA);

        // the purely random position (high frequency noise)
        // using pseudo-random based on id and time so it dances like TV static
        const r1 = Math.sin(i * 12.9898 + now * 0.001) * 43758.5453;
        const r2 = Math.sin(i * 78.233 + now * 0.001) * 43758.5453;
        
        const randX = (r1 - Math.floor(r1)) * width;
        const randY = (r2 - Math.floor(r2)) * height;

        // Lerp between true gaussian noise and structural truth
        const renderX = rotX * (1 - noiseLevel) + randX * noiseLevel;
        const renderY = rotY * (1 - noiseLevel) + randY * noiseLevel;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Slightly larger when in noisy state to fill more
        ctx.arc(renderX, renderY, p.size * (1 + noiseLevel), 0, Math.PI * 2);
        ctx.fill();
        
        // Draw faint connecting lines when highly structured for an "ordered network" look
        if (noiseLevel < 0.1 && i % 30 === 0) {
           // just some local connection magic
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [theme]);

  // Keep it z-0 so it stays underneath content. Use faint mask to prevent text blocking
  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className || ""}`} style={{ opacity: theme === "dark" ? 0.7 : 0.4 }}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}

