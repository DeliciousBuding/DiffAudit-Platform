"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Config ────────────────────────────────────────────────────
const PARTICLE_COUNT = 800;
const CONNECT_DIST = 90;
const MOUSE_RADIUS = 200;
const MOUSE_FORCE = 12000;
const SPRING_STRENGTH = 0.008;
const DAMPING = 0.96;

interface Particle {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  /** Noise timestep — simulates diffusion schedule */
  noiseT: number;
}

function createParticles(w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    particles.push({
      x,
      y,
      anchorX: x,
      anchorY: y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 1.0 + Math.random() * 1.6,
      alpha: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      noiseT: Math.random() * 1000,
    });
  }
  return particles;
}

/** Simplex-like noise approximation for organic motion */
function noise2D(x: number, y: number): number {
  const s = Math.sin(x * 0.8 + y * 1.2) * 0.5 +
            Math.sin(x * 1.7 - y * 0.9) * 0.3 +
            Math.sin(x * 0.3 + y * 2.1) * 0.2;
  return s;
}

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const isDarkRef = useRef(false);
  const timeRef = useRef(0);

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

    const handleMouse = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", handleMouse);
    canvasRef.current?.addEventListener("mouseleave", handleMouseLeave);

    const observer = new MutationObserver(() => {
      isDarkRef.current = document.documentElement.getAttribute("data-theme") === "dark";
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
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
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      timeRef.current += 0.012;
      const t = timeRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // ─── Diffusion-inspired noise field ────────────────────
      // Each particle follows a continuously evolving noise field,
      // simulating the forward diffusion process (adding noise).
      // Mouse proximity triggers "denoising" — particles snap toward structure.
      for (const p of particles) {
        p.noiseT += 0.006;
        const nx = noise2D(p.x * 0.005 + t * 0.3, p.y * 0.005 + p.phase);
        const ny = noise2D(p.y * 0.005 - t * 0.25, p.x * 0.005 + p.phase + 50);

        // Noise-driven flow (the "diffusion" force)
        p.vx += nx * 0.12;
        p.vy += ny * 0.12;

        // Spring back to anchor (gentle structure pull)
        const dx = p.anchorX - p.x;
        const dy = p.anchorY - p.y;
        p.vx += dx * SPRING_STRENGTH;
        p.vy += dy * SPRING_STRENGTH;

        // Mouse repulsion — "denoising" zone
        const mx = p.x - mouse.x;
        const my = p.y - mouse.y;
        const mDist = Math.sqrt(mx * mx + my * my);
        if (mDist < MOUSE_RADIUS && mDist > 1) {
          const force = MOUSE_FORCE / (mDist * mDist);
          p.vx += (mx / mDist) * force;
          p.vy += (my / mDist) * force;
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges for infinite flow feel
        if (p.x < -20) { p.x = w + 20; p.anchorX = p.x; }
        if (p.x > w + 20) { p.x = -20; p.anchorX = p.x; }
        if (p.y < -20) { p.y = h + 20; p.anchorY = p.y; }
        if (p.y > h + 20) { p.y = -20; p.anchorY = p.y; }
      }

      // ─── Draw connections ────────────────────────────────
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const distSq = ddx * ddx + ddy * ddy;
          if (distSq < CONNECT_DIST * CONNECT_DIST) {
            const dist = Math.sqrt(distSq);
            // Center-fade: lines near hero center become transparent
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const cxDist = Math.abs(midX - w / 2) / (w / 2);
            const cyDist = Math.abs(midY - h / 2) / (h / 2);
            const centerFade = Math.min(1, Math.max(cxDist, cyDist) * 1.8);
            const lineAlpha = (1 - dist / CONNECT_DIST) * 0.3 * centerFade;
            if (lineAlpha < 0.01) continue;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = dark
              ? `rgba(140, 180, 255, ${lineAlpha})`
              : `rgba(0, 0, 0, ${lineAlpha * 0.4})`;
            ctx.stroke();
          }
        }
      }

      // ─── Draw particles ──────────────────────────────────
      for (const p of particles) {
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const excitement = Math.min(speed / 2, 1);

        // Center-fade: particles near hero center area are more transparent
        const cxDist = Math.abs(p.x - w / 2) / (w / 2);
        const cyDist = Math.abs(p.y - h / 2) / (h / 2);
        const centerFade = Math.min(1, Math.max(cxDist, cyDist) * 1.6);
        const fadedAlpha = p.alpha * centerFade;
        if (fadedAlpha < 0.02) continue;

        if (dark) {
          const glowR = p.radius * (2 + excitement * 3);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grad.addColorStop(0, `rgba(140, 190, 255, ${fadedAlpha * (0.6 + excitement * 0.4)})`);
          grad.addColorStop(0.4, `rgba(91, 142, 249, ${fadedAlpha * 0.25})`);
          grad.addColorStop(1, `rgba(91, 142, 249, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (0.8 + excitement * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${fadedAlpha * (0.7 + excitement * 0.3)})`;
          ctx.fill();
        } else {
          const r = p.radius * (0.7 + excitement * 0.5);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${fadedAlpha * (0.25 + excitement * 0.3)})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
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
