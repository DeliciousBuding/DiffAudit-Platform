
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
    // willReadFrequently for potential pixel reading in hidden canvas
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const isDark = theme === "dark";

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let animId: number;

    const img = new Image();
    // Use the black SVG (alpha channel will be used so color doesn't matter)
    img.src = "/brand/diffaudit-logo-black-no-text.svg";
    
    img.onload = () => {
      // Create hidden canvas to extract logo pixel map
      const hcanvas = document.createElement("canvas");
      hcanvas.width = width;
      hcanvas.height = height;
      const hctx = hcanvas.getContext("2d", { willReadFrequently: true });
      if (!hctx) return;

      const logoSize = Math.min(width, height) * 0.45;
      const lx = (width - logoSize) / 2;
      const ly = (height - logoSize) / 2 - 40; // shift up slightly
      
      hctx.drawImage(img, lx, ly, logoSize, logoSize);
      
      // Draw text below logo
      hctx.font = `bold ${logoSize * 0.3}px 'Inter', sans-serif`;
      hctx.textAlign = "center";
      hctx.textBaseline = "top";
      hctx.fillStyle = "black";
      hctx.fillText("DiffAudit", width / 2, ly + logoSize + 40);

      const imgData = hctx.getImageData(0, 0, width, height).data;
      const validPoints: {x: number, y: number}[] = [];

      // Sample every 4th pixel for structural density
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const index = (y * width + x) * 4;
          // Alpha threshold
          if (imgData[index + 3] > 64) {
             validPoints.push({ x, y });
          }
        }
      }

      if (validPoints.length === 0) validPoints.push({ x: width/2, y: height/2 });

      // Generate particles mapped exclusively to the logo and text
      const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const pt = validPoints[Math.floor(Math.random() * validPoints.length)];
        
        // Add minimal scatter for organic analog feel
        const tx = pt.x + (Math.random() - 0.5) * 4;
        const ty = pt.y + (Math.random() - 0.5) * 4;
        
        let color = isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(15, 23, 42, 0.85)";
        if (Math.random() > 0.8) {
           color = theme === "dark" ? "rgba(47, 109, 246, 0.9)" : "rgba(47, 109, 246, 0.9)";
        }

        return {
          tx, ty,
          color,
          size: Math.random() * 1.5 + 0.8,
          // Fixed random spawn point for smooth interpolation
          rx: Math.random() * width,
          ry: Math.random() * height,
          speed: Math.random() * 0.5 + 0.5
        };
      });

      const CYCLE_MS = 24000; // Slowed down significantly (24s cycle)
      const start = Date.now();

      const draw = () => {
        const now = Date.now();
        const t = (now - start) % CYCLE_MS;
        
        let noiseLevel = 0;
        if (t < 5000) {
           // Forward diffusion (gentle break apart)
           noiseLevel = (t / 5000); 
           noiseLevel = noiseLevel * noiseLevel; // ease in
        } else if (t < 9000) {
           // Pure noise state
           noiseLevel = 1;
        } else if (t < 18000) {
           // Reverse diffusion (gentle long assembly)
           let p = (t - 9000) / 9000; 
           noiseLevel = 1 - p; 
           // Exponential ease out for a snapping-into-place effect
           noiseLevel = Math.pow(noiseLevel, 2.5);
        } else {
           // Output generated image
           noiseLevel = 0;
        }

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
           const p = particles[i];
           
           // Slow, elegant drift (only during assembled state)
           const driftX = noiseLevel > 0.05 ? 0 : Math.sin(now * 0.0003 * p.speed + p.tx) * 12;
           const driftY = noiseLevel > 0.05 ? 0 : Math.cos(now * 0.0003 * p.speed + p.ty) * 12;
           
           // Gentle Brownian motion roaming when in noise state
           const roamingX = p.rx + Math.sin(now * 0.0005 * p.speed + i) * 60;
           const roamingY = p.ry + Math.cos(now * 0.0005 * p.speed + i) * 60;

           const targetX = p.tx + driftX;
           const targetY = p.ty + driftY;

           // Linear blend between chaotic state and absolute target
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

