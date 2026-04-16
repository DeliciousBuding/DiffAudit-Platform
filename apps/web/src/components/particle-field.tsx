
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";

export const PARTICLE_COUNT = 10000;

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
        let tx = 0, ty = 0;
        const r = Math.random();
        
        let color = isDark ? "rgba(100, 116, 139, 0.4)" : "rgba(100, 116, 139, 0.4)";
        let size = Math.random() * 1.5 + 0.5;

        // Image generation metaphor: "An AI generated Landscape of Data"
        if (r < 0.15) {
          // The AI Sun / Halo
          const ang = Math.random() * Math.PI * 2;
          const rad = 150 * Math.random();
          // hollow sun effect
          const actualRad = Math.random() > 0.8 ? rad : 150 + Math.random()*5;
          const moonX = tX;
          const moonY = tY - 100;
          tx = moonX + actualRad * Math.cos(ang);
          ty = moonY + actualRad * Math.sin(ang);
          color = "rgba(47, 109, 246, 0.8)"; // accent blue
          size = 1.5;
        } else if (r < 0.5) {
          // Mathematical sweeping mountains (Data Manifolds)
          const nx = (Math.random() - 0.5) * width * 1.4; // spread across screen
          tx = tX + nx;
          
          // Use multiple sines for procedural terrain
          const peak1 = Math.sin(nx * 0.004) * 200;
          const peak2 = Math.cos(nx * 0.01 + 2) * 50;
          const peak = peak1 + peak2 + 50;
          
          // Mountain volume
          const depth = Math.random() * (height - (tY + peak));
          ty = tY + peak + Math.abs(depth);
          
          // Highlight the mountain ridge edges
          if (Math.random() > 0.9) {
            ty = tY + peak + (Math.random() * 5);
            color = isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(12, 12, 12, 0.6)";
            size = 2;
          }
        } else if (r < 0.70) {
          // Distant Background Mountain Layer
          const nx = (Math.random() - 0.5) * width * 1.4; 
          tx = tX + nx;
          const peak = Math.cos(nx * 0.003 - 1) * 250 - 50;
          
          const depth = Math.random() * (height - (tY + peak));
          ty = tY + peak + Math.abs(depth) * 0.5;
          color = "rgba(47, 109, 246, 0.3)";
        } else if (r < 0.85) {
          // Reflection / Lake (Digital Grid) underneath
          const nx = (Math.random() - 0.5) * width * 1.2;
          tx = tX + nx;
          // horizontal strict data lines
          const lineY = Math.floor(Math.random() * 10) * 20;
          ty = tY + 250 + lineY;
        } else {
          // Starry sky / Persistent ambient noise
          tx = Math.random() * width;
          ty = Math.random() * height;
          if (ty < tY && Math.random() > 0.95) {
            size = 2.5; 
            color = isDark ? "white" : "black";
          }
        }

        return { tx, ty, color, size, seed1: Math.random(), seed2: Math.random() };
      });
    };

    let particles = generateTargets();
    let animId: number;
    let start = Date.now();
    const CYCLE = 14000; 

    const draw = () => {
      if (!canvasRef.current) return;
      const now = Date.now();
      const t = (now - start) % CYCLE;
      
      let noiseLevel = 0;
      if (t < 3000) {
        // Forward diffusion: blow the image into pure noise
        noiseLevel = t / 3000;
        noiseLevel = Math.pow(noiseLevel, 2); 
      } else if (t < 5000) {
        // Pure high entropy noise (the blank latent state)
        noiseLevel = 1;
      } else if (t < 11000) {
        // Reverse diffusion denoising: settling into the landscape
        noiseLevel = 1 - (t - 5000) / 6000;
        noiseLevel = noiseLevel * noiseLevel * (3 - 2 * noiseLevel); 
        noiseLevel = Math.pow(noiseLevel, 1.2); 
      } else {
        // Final generated image holds briefly
        noiseLevel = 0;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Unique high-frequency dancing noise for each particle
        const r1 = Math.sin(p.seed1 * 12345 + now * 0.002) * 10000;
        const r2 = Math.sin(p.seed2 * 54321 + now * 0.002) * 10000;
        
        const randX = (r1 - Math.floor(r1)) * width;
        const randY = (r2 - Math.floor(r2)) * height;

        // Subtle pan/breathing for the landscape
        const driftX = Math.sin(now * 0.0005) * 20;

        const targetX = p.tx + driftX;
        const targetY = p.ty;

        // Denosing Lerp
        const renderX = targetX * (1 - noiseLevel) + randX * noiseLevel;
        const renderY = targetY * (1 - noiseLevel) + randY * noiseLevel;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size * (1 + noiseLevel * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [theme]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className || ""}`} style={{ opacity: theme === "dark" ? 0.8 : 0.6 }}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}

