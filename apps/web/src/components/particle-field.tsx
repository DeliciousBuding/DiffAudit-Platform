"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Diffusion-inspired particle field.
 *
 * Visual metaphor for the forward/reverse diffusion process:
 *   1. Particles start in structured positions (clean data)
 *   2. Noise gradually disperses them (forward diffusion — adding noise)
 *   3. They slowly reconverge to new structures (reverse diffusion — denoising)
 *   4. Cycle repeats endlessly
 *
 * No mouse interaction — purely ambient, organic animation.
 */

// ─── Config ────────────────────────────────────────────────────
const PARTICLE_COUNT = 900;
const CONNECT_DIST = 70;

interface Particle {
  x: number;
  y: number;
  /** Structured target position (the "clean data" state) */
  targetX: number;
  targetY: number;
  /** Current noise offset */
  noiseX: number;
  noiseY: number;
  radius: number;
  alpha: number;
  phase: number;
  speed: number;
}

/** Generate a grid-like structured arrangement */
function generateStructure(w: number, h: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (w / h)));
  const rows = Math.ceil(PARTICLE_COUNT / cols);
  const cellW = w / cols;
  const cellH = h / rows;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    points.push({
      x: (col + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.6,
      y: (row + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.6,
    });
  }
  return points;
}

function createParticles(w: number, h: number): Particle[] {
  const structure = generateStructure(w, h);
  return structure.map((pt) => ({
    x: pt.x + (Math.random() - 0.5) * 80,
    y: pt.y + (Math.random() - 0.5) * 80,
    targetX: pt.x,
    targetY: pt.y,
    noiseX: 0,
    noiseY: 0,
    radius: 0.8 + Math.random() * 1.2,
    alpha: 0.25 + Math.random() * 0.45,
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.7,
  }));
}

/** Smooth noise for organic motion */
function fbm(x: number, y: number): number {
  return (
    Math.sin(x * 1.1 + y * 0.7) * 0.5 +
    Math.sin(x * 2.3 - y * 1.8) * 0.25 +
    Math.sin(x * 0.4 + y * 3.1) * 0.25
  );
}

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const isDarkRef = useRef(false);
  const timeRef = useRef(0);
  const cycleRef = useRef(0);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    if (particlesRef.current.length === 0) {
      particlesRef.current = createParticles(w, h);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    const observer = new MutationObserver(() => {
      isDarkRef.current = document.documentElement.getAttribute("data-theme") === "dark";
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    isDarkRef.current =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.documentElement.classList.contains("dark");

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const dark = isDarkRef.current;
      const particles = particlesRef.current;

      timeRef.current += 0.004;
      cycleRef.current += 0.0008;
      const t = timeRef.current;

      // Diffusion schedule: oscillates between 0 (structured) and 1 (noisy)
      // This creates the forward/reverse diffusion cycle
      const diffusionT = (Math.sin(cycleRef.current) + 1) / 2; // 0..1
      const noiseStrength = diffusionT * 180; // max displacement in noise state

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // ─── Update particles ──────────────────────────────
      for (const p of particles) {
        // Noise field displacement (organic, flowing)
        const nx = fbm(p.targetX * 0.003 + t * 0.8, p.targetY * 0.003 + p.phase);
        const ny = fbm(p.targetY * 0.003 - t * 0.6, p.targetX * 0.003 + p.phase + 10);

        // Target: blend between structure and noise
        p.noiseX = nx * noiseStrength;
        p.noiseY = ny * noiseStrength;

        const goalX = p.targetX + p.noiseX;
        const goalY = p.targetY + p.noiseY;

        // Smooth interpolation toward goal
        const lerpRate = 0.015 * p.speed;
        p.x += (goalX - p.x) * lerpRate;
        p.y += (goalY - p.y) * lerpRate;

        // Add micro-jitter for organic feel
        p.x += (Math.random() - 0.5) * 0.3;
        p.y += (Math.random() - 0.5) * 0.3;
      }

      // ─── Center-fade for hero readability ──────────────
      function centerFade(px: number, py: number): number {
        const cx = Math.abs(px - w / 2) / (w / 2);
        const cy = Math.abs(py - h / 2) / (h / 2);
        return Math.min(1, Math.max(cx, cy) * 1.6);
      }

      // ─── Draw connections ──────────────────────────────
      // More connections appear during structured state (low diffusion)
      const connectAlphaScale = 1 - diffusionT * 0.6;
      ctx.lineWidth = 0.3;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECT_DIST * CONNECT_DIST) {
            const dist = Math.sqrt(distSq);
            const fade = centerFade((a.x + b.x) / 2, (a.y + b.y) / 2);
            const lineAlpha =
              (1 - dist / CONNECT_DIST) * 0.2 * connectAlphaScale * fade;
            if (lineAlpha < 0.008) continue;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = dark
              ? `rgba(140, 180, 255, ${lineAlpha})`
              : `rgba(0, 0, 0, ${lineAlpha * 0.5})`;
            ctx.stroke();
          }
        }
      }

      // ─── Draw particles ────────────────────────────────
      for (const p of particles) {
        const fade = centerFade(p.x, p.y);
        const a = p.alpha * fade;
        if (a < 0.02) continue;

        // Particles grow slightly during noise state (diffusing)
        const sizeBoost = 1 + diffusionT * 0.4;

        if (dark) {
          // Glow effect
          const glowR = p.radius * 2.5 * sizeBoost;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0, `rgba(140, 190, 255, ${a * 0.5})`);
          grad.addColorStop(0.5, `rgba(91, 142, 249, ${a * 0.15})`);
          grad.addColorStop(1, `rgba(91, 142, 249, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.8 * sizeBoost, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${a * 0.7})`;
          ctx.fill();
        } else {
          const r = p.radius * 0.7 * sizeBoost;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${a * 0.3})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [handleResize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
