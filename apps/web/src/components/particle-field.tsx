"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useTheme } from "@/hooks/use-theme";

export const PARTICLE_COUNT = 4000;

type Canvas2DLike = {
  setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
};

type CanvasLike = {
  width: number;
  height: number;
  style: { width: string; height: string };
  getContext: (type: "2d") => Canvas2DLike | null;
};

type ContainerLike = {
  getBoundingClientRect: () => { width: number; height: number };
};

export function syncParticleCanvasSize(
  canvas: CanvasLike,
  container: ContainerLike,
  dpr: number,
) {
  const rect = container.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const safeDpr = Math.max(1, dpr || 1);

  canvas.width = Math.round(width * safeDpr);
  canvas.height = Math.round(height * safeDpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.getContext("2d")?.setTransform(safeDpr, 0, 0, safeDpr, 0, 0);

  return { width, height, dpr: safeDpr };
}

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<{ width: number; height: number; dpr: number } | null>(null);
  const [sceneVersion, setSceneVersion] = useState(0);
  const { theme } = useTheme();

  const refreshMetrics = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const nextMetrics = syncParticleCanvasSize(
      canvasRef.current,
      containerRef.current,
      window.devicePixelRatio || 1,
    );
    const prevMetrics = metricsRef.current;

    if (
      !prevMetrics
      || prevMetrics.width !== nextMetrics.width
      || prevMetrics.height !== nextMetrics.height
      || Math.abs(prevMetrics.dpr - nextMetrics.dpr) > 0.01
    ) {
      metricsRef.current = nextMetrics;
      setSceneVersion((current) => current + 1);
    }
  }, []);

  useEffect(() => {
    refreshMetrics();

    const observer = typeof ResizeObserver !== "undefined" && containerRef.current
      ? new ResizeObserver(() => refreshMetrics())
      : null;

    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("resize", refreshMetrics);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", refreshMetrics);
    };
  }, [refreshMetrics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !container) return;

    const currentMetrics = metricsRef.current ?? syncParticleCanvasSize(
      canvas,
      container,
      window.devicePixelRatio || 1,
    );
    metricsRef.current = currentMetrics;

    const { width, height, dpr } = currentMetrics;
    const isDark = theme === "dark";
    let animId = 0;
    let disposed = false;

    const img = new Image();
    img.src = "/brand/diffaudit-logo-black-no-text.svg";

    img.onload = () => {
      if (disposed) return;

      const hcanvas = document.createElement("canvas");
      hcanvas.width = width;
      hcanvas.height = height;
      const hctx = hcanvas.getContext("2d", { willReadFrequently: true });
      if (!hctx) return;

      const aspect = img.width / img.height;
      let drawW: number;
      let drawH: number;

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

      const lx = (width - drawW) / 2;
      const ly = (height - drawH) / 2;

      hctx.drawImage(img, lx, ly, drawW, drawH);

      const imgData = hctx.getImageData(0, 0, width, height).data;
      const validPoints: Array<{ x: number; y: number }> = [];

      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const index = (y * width + x) * 4;
          if (imgData[index + 3] > 64) {
            validPoints.push({ x, y });
          }
        }
      }

      if (validPoints.length === 0) {
        validPoints.push({ x: width / 2, y: height / 2 });
      }

      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;
      for (const point of validPoints) {
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      }

      const actualCenterX = (minX + maxX) / 2;
      const actualCenterY = (minY + maxY) / 2;
      const offsetX = width / 2 - actualCenterX + (width * 0.04);
      const offsetY = height / 2 - actualCenterY;

      for (const point of validPoints) {
        point.x += offsetX;
        point.y += offsetY;
      }

      const particles = Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
        const point = validPoints[Math.floor(Math.random() * validPoints.length)];
        const tx = point.x + (Math.random() - 0.5) * 4;
        const ty = point.y + (Math.random() - 0.5) * 4;

        let color = isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(100, 116, 139, 0.35)";
        if (Math.random() > 0.9) {
          color = isDark ? "rgba(47, 109, 246, 0.45)" : "rgba(37, 99, 235, 0.35)";
        }

        return {
          tx,
          ty,
          color,
          size: Math.random() * 1.8 + 0.8,
          rx: Math.random() * width,
          ry: Math.random() * height,
          speed: Math.random() * 0.5 + 0.5,
          index,
        };
      });

      const CYCLE_MS = 18000;
      const start = Date.now() - 5000;
      const c1Blow = 1.2;
      const c3Blow = c1Blow + 1;
      const c1Gather = 1.0;
      const c3Gather = c1Gather + 1;

      const draw = () => {
        if (disposed) return;

        const latestWidth = Math.max(1, Math.round(container.getBoundingClientRect().width));
        const latestHeight = Math.max(1, Math.round(container.getBoundingClientRect().height));
        const latestDpr = Math.max(1, window.devicePixelRatio || 1);
        if (
          latestWidth !== width
          || latestHeight !== height
          || Math.abs(latestDpr - dpr) > 0.01
        ) {
          setSceneVersion((current) => current + 1);
          return;
        }

        const now = Date.now();
        const t = (now - start) % CYCLE_MS;

        let noiseLevel = 0;
        if (t < 3500) {
          const progress = t / 3500;
          const easedProgress = 1 + c3Blow * Math.pow(progress - 1, 3) + c1Blow * Math.pow(progress - 1, 2);
          noiseLevel = easedProgress;
        } else if (t < 7500) {
          noiseLevel = 1;
        } else if (t < 12000) {
          const progress = (t - 7500) / 4500;
          const easedProgress = 1 + c3Gather * Math.pow(progress - 1, 3) + c1Gather * Math.pow(progress - 1, 2);
          noiseLevel = 1 - easedProgress;
        }

        ctx.clearRect(0, 0, width, height);

        for (const particle of particles) {
          const driftScale = Math.max(0, 1 - noiseLevel * 4);
          const driftX = Math.sin(now * 0.0003 * particle.speed + particle.tx) * 12 * driftScale;
          const driftY = Math.cos(now * 0.0003 * particle.speed + particle.ty) * 12 * driftScale;

          const roamingX = particle.rx + Math.sin(now * 0.0005 * particle.speed + particle.index) * 60;
          const roamingY = particle.ry + Math.cos(now * 0.0005 * particle.speed + particle.index) * 60;

          const targetX = particle.tx + driftX;
          const targetY = particle.ty + driftY;
          const finalX = targetX * (1 - noiseLevel) + roamingX * noiseLevel;
          const finalY = targetY * (1 - noiseLevel) + roamingY * noiseLevel;

          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(finalX, finalY, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        animId = requestAnimationFrame(draw);
      };

      draw();
    };

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      img.onload = null;
    };
  }, [sceneVersion, theme]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className || ""}`}
      style={{ opacity: theme === "dark" ? 0.9 : 0.85 }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 h-full w-full" />
    </div>
  );
}
