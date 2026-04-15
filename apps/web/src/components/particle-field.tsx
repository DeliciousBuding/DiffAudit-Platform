"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Config ────────────────────────────────────────────────────
const PARTICLE_COUNT = 200;
const CONNECT_DIST = 130;
const MOUSE_RADIUS = 180;
const MOUSE_FORCE = 9000;
const SPRING_STRENGTH = 0.015;
const DAMPING = 0.93;
const BASE_DRIFT = 0.18;

interface Particle {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  /** Per-particle phase for gentle oscillation */
  phase: number;
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
      vx: (Math.random() - 0.5) * BASE_DRIFT,
      vy: (Math.random() - 0.5) * BASE_DRIFT,
      radius: 1.5 + Math.random() * 2.2,
      alpha: 0.35 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
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

    // Re-scatter particles if canvas just initialized
    if (particlesRef.current.length === 0) {
      particlesRef.current = createParticles(w, h);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    // Track mouse
    const handleMouse = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", handleMouse);
    canvasRef.current?.addEventListener("mouseleave", handleMouseLeave);

    // Observe theme changes
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute("data-theme");
      isDarkRef.current = theme === "dark";
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    isDarkRef.current =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.documentElement.classList.contains("dark");

    // Animation loop
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

      timeRef.current += 0.008;
      const t = timeRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Update particles
      for (const p of particles) {
        // Spring back to anchor
        const dx = p.anchorX - p.x;
        const dy = p.anchorY - p.y;
        p.vx += dx * SPRING_STRENGTH;
        p.vy += dy * SPRING_STRENGTH;

        // Mouse repulsion
        const mx = p.x - mouse.x;
        const my = p.y - mouse.y;
        const mDist = Math.sqrt(mx * mx + my * my);
        if (mDist < MOUSE_RADIUS && mDist > 1) {
          const force = MOUSE_FORCE / (mDist * mDist);
          p.vx += (mx / mDist) * force;
          p.vy += (my / mDist) * force;
        }

        // Gentle drift oscillation — natural flow
        p.vx += Math.sin(t * 1.2 + p.phase) * 0.06;
        p.vy += Math.cos(t * 0.9 + p.phase * 1.3) * 0.06;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Soft boundary bounce
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -0.5;
        }
        if (p.x > w) {
          p.x = w;
          p.vx *= -0.5;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -0.5;
        }
        if (p.y > h) {
          p.y = h;
          p.vy *= -0.5;
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < CONNECT_DIST) {
            const lineAlpha = (1 - dist / CONNECT_DIST) * 0.4;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            if (dark) {
              ctx.strokeStyle = `rgba(140, 180, 255, ${lineAlpha})`;
            } else {
              ctx.strokeStyle = `rgba(0, 0, 0, ${lineAlpha * 0.35})`;
            }
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        // Displacement from anchor → visual excitement
        const disp = Math.sqrt(
          (p.x - p.anchorX) ** 2 + (p.y - p.anchorY) ** 2,
        );
        const excitement = Math.min(disp / 60, 1);

        if (dark) {
          // Glow effect in dark mode
          const glowRadius = p.radius * (2 + excitement * 3);
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            glowRadius,
          );
          gradient.addColorStop(
            0,
            `rgba(140, 190, 255, ${p.alpha * (0.6 + excitement * 0.4)})`,
          );
          gradient.addColorStop(0.4, `rgba(91, 142, 249, ${p.alpha * 0.3})`);
          gradient.addColorStop(1, `rgba(91, 142, 249, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(
            p.x,
            p.y,
            p.radius * (0.8 + excitement * 0.4),
            0,
            Math.PI * 2,
          );
          ctx.fillStyle = `rgba(200, 220, 255, ${p.alpha * (0.7 + excitement * 0.3)})`;
          ctx.fill();
        } else {
          // Light mode — bold dark dots
          const r = p.radius * (0.9 + excitement * 0.4);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${p.alpha * (0.3 + excitement * 0.3)})`;
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
