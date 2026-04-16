
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";

export const PARTICLE_COUNT = 4000;

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
    let animId: number;

    const img = new Image();
    img.src = "/brand/diffaudit-logo-black-no-text.svg";
    
    img.onload = () => {
      const hcanvas = document.createElement("canvas");
      hcanvas.width = width;
      hcanvas.height = height;
      const hctx = hcanvas.getContext("2d", { willReadFrequently: true });
      if (!hctx) return;

      // Preserve aspect ratio of the SVG logo
      const aspect = img.width / img.height;
      let drawW, drawH;
      
      // Make it span around 65% of the screen logically
      if (width > height) {
        drawH = height * 0.65;
        drawW = drawH * aspect;
        if (drawW > width * 0.8) {
          drawW = width * 0.8;
          drawH = drawW / aspect;
        }
      } else {
        drawW = width * 0.8;
        drawH = drawW / aspect;
      }
      
      // Place it in the dead center
      const lx = (width - drawW) / 2;
      const ly = (height - drawH) / 2;
      
      hctx.drawImage(img, lx, ly, drawW, drawH);

      const imgData = hctx.getImageData(0, 0, width, height).data;
      const validPoints: {x: number, y: number}[] = [];

      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const index = (y * width + x) * 4;
          if (imgData[index + 3] > 64) {
             validPoints.push({ x, y });
          }
        }
      }

      if (validPoints.length === 0) validPoints.push({ x: width/2, y: height/2 });

      const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const pt = validPoints[Math.floor(Math.random() * validPoints.length)];
        const tx = pt.x + (Math.random() - 0.5) * 4;
        const ty = pt.y + (Math.random() - 0.5) * 4;
        
        let color = isDark ? "rgba(100, 116, 139, 0.25)" : "rgba(148, 163, 184, 0.35)";
        if (Math.random() > 0.9) {
           color = isDark ? "rgba(47, 109, 246, 0.35)" : "rgba(47, 109, 246, 0.25)";
        }

        return {
          tx, ty, color,
          size: Math.random() * 1.8 + 0.8,
          rx: Math.random() * width,
          ry: Math.random() * height,
          speed: Math.random() * 0.5 + 0.5
        };
      });

      const CYCLE_MS = 24000;
      const start = Date.now();

      const draw = () => {
        const now = Date.now();
        const t = (now - start) % CYCLE_MS;
        
        let noiseLevel = 0;
        if (t < 5000) {
           noiseLevel = (t / 5000); 
           noiseLevel = noiseLevel * noiseLevel; 
        } else if (t < 9000) {
           noiseLevel = 1;
        } else if (t < 18000) {
           let p = (t - 9000) / 9000; 
           noiseLevel = 1 - p; 
           noiseLevel = Math.pow(noiseLevel, 2.5);
        } else {
           noiseLevel = 0;
        }

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
           const p = particles[i];
           const driftX = noiseLevel > 0.05 ? 0 : Math.sin(now * 0.0003 * p.speed + p.tx) * 12;
           const driftY = noiseLevel > 0.05 ? 0 : Math.cos(now * 0.0003 * p.speed + p.ty) * 12;
           
           const roamingX = p.rx + Math.sin(now * 0.0005 * p.speed + i) * 60;
           const roamingY = p.ry + Math.cos(now * 0.0005 * p.speed + i) * 60;

           const targetX = p.tx + driftX;
           const targetY = p.ty + driftY;

           const finalX = targetX * (1 - noiseLevel) + roamingX * noiseLevel;
           const finalY = targetY * (1 - noiseLevel) + roamingY * noiseLevel;
           
           ctx.fillStyle = p.color;
           ctx.beginPath();
           ctx.arc(finalX, finalY, p.size, 0, Math.PI * 2);
           ctx.fill();
        }

        animId = requestAnimationFrame(draw);
      };

      draw();
    };

    return () => {
      cancelAnimationFrame(animId);
      img.onload = null;
    };
  }, [theme]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className || ""}`} style={{ opacity: theme === "dark" ? 0.9 : 0.7 }}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}

