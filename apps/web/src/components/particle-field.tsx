"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Membership Inference Attack (MIA) visual metaphor particle system.
 *
 * - 350 particles, 10% are "members" (colored highlights)
 * - Tangential force field creates laminar flow around center
 * - Audit pulse: member-to-member connections flash with signal frequency
 * - Diffusion cycle: noise ↔ structure oscillation
 * - Center exclusion zone keeps hero text readable
 */

const PARTICLE_COUNT = 455;
const MEMBER_RATIO = 0.1;
const CONNECT_DIST_NORMAL = 50;
const CONNECT_DIST_MEMBER = 130;

const BASE_COLOR_LIGHT = { r: 156, g: 163, b: 175 }; // gray-400
const BASE_COLOR_DARK = { r: 100, g: 116, b: 139 };  // slate-500

const MEMBER_COLORS = [
  { r: 150, g: 165, b: 210 }, // muted indigo
  { r: 170, g: 155, b: 200 }, // muted violet
  { r: 120, g: 185, b: 145 }, // muted green
  { r: 200, g: 160, b: 110 }, // muted amber
];

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  noiseX: number;
  noiseY: number;
  isMember: boolean;
  color: { r: number; g: number; b: number };
  radius: number;
  phase: number;
  speed: number;
  auditedState: number;
}

function fbm(x: number, y: number): number {
  return (
    Math.sin(x * 1.1 + y * 0.7) * 0.5 +
    Math.sin(x * 2.3 - y * 1.8) * 0.25 +
    Math.sin(x * 0.4 + y * 3.1) * 0.25
  );
}

function generateStructure(w: number, h: number) {
  const points: { x: number; y: number }[] = [];
  const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (w / h)));
  const rows = Math.ceil(PARTICLE_COUNT / cols);
  const cellW = w / cols;
  const cellH = h / rows;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    points.push({
      x: (col + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.5,
      y: (row + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.5,
    });
  }
  return points;
}

function createParticles(w: number, h: number): Particle[] {
  const structure = generateStructure(w, h);
  return structure.map((pt) => ({
    x: pt.x + (Math.random() - 0.5) * 100,
    y: pt.y + (Math.random() - 0.5) * 100,
    targetX: pt.x,
    targetY: pt.y,
    noiseX: 0,
    noiseY: 0,
    isMember: Math.random() < MEMBER_RATIO,
    color: MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)],
    radius: 1.2 + Math.random() * 1.8,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.6,
    auditedState: 0,
  }));
}

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const isDarkRef = useRef(false);

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

    particlesRef.current = createParticles(w, h);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    // Dark mode observer
    const observer = new MutationObserver(() => {
      isDarkRef.current =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        document.documentElement.classList.contains("dark");
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
      const BASE = dark ? BASE_COLOR_DARK : BASE_COLOR_LIGHT;

      timeRef.current += 0.005;
      const t = timeRef.current;

      const diffusionPhase = (Math.sin(t * 2) + 1) / 2;
      const isDenoising = Math.cos(t * 2) > 0;
      const noiseStrength = diffusionPhase * 250;

      const cx = w / 2;
      const cy = h / 2;
      const exclusionRadius = Math.min(w, h) * 0.12;
      const fadeZone = Math.min(w, h) * 0.25;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // ─── Update particle physics (tangential force field) ─────
      for (const p of particles) {
        const nx = fbm(p.targetX * 0.002 + t * 0.5, p.targetY * 0.002 + p.phase);
        const ny = fbm(p.targetY * 0.002 - t * 0.4, p.targetX * 0.002 + p.phase + 10);

        let currentNoiseStrength = noiseStrength;

        // Audit trigger: members converge during denoising phase
        if (p.isMember && isDenoising && diffusionPhase < 0.7) {
          currentNoiseStrength *= Math.pow(diffusionPhase / 0.7, 3);
          p.auditedState = Math.min(1, p.auditedState + 0.12);
        } else {
          p.auditedState = Math.max(0, p.auditedState - 0.025);
        }

        p.noiseX = nx * currentNoiseStrength;
        p.noiseY = ny * currentNoiseStrength;

        let goalX = p.targetX + p.noiseX;
        let goalY = p.targetY + p.noiseY;

        // Fluid dynamics: tangential force near center
        const dxC = goalX - cx;
        const dyC = goalY - cy;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC);

        if (distC < exclusionRadius + fadeZone && distC > 0.01) {
          const force = Math.pow(
            1 - Math.max(0, distC - exclusionRadius) / fadeZone,
            2
          );

          // Weak radial push — particles can flow through center
          goalX += (dxC / distC) * force * exclusionRadius * 0.03;
          goalY += (dyC / distC) * force * exclusionRadius * 0.03;

          // Tangential slip for laminar flow aesthetics
          const slip = p.phase % 2 > 1 ? 1 : -1;
          goalX += (-dyC / distC) * force * exclusionRadius * 0.15 * slip;
          goalY += (dxC / distC) * force * exclusionRadius * 0.15 * slip;
        }

        const lerpRate =
          p.isMember && p.auditedState > 0.5 ? 0.08 : 0.015 * p.speed;
        p.x += (goalX - p.x) * lerpRate;
        p.y += (goalY - p.y) * lerpRate;
      }

      // Spatial alpha: soft exclusion in center with minimum visibility
      function getSpatialAlpha(px: number, py: number): number {
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < exclusionRadius) return 0.08;
        if (dist < exclusionRadius + fadeZone) {
          const ratio = (dist - exclusionRadius) / fadeZone;
          return 0.08 + 0.92 * ratio * ratio * ratio;
        }
        return 1;
      }

      // ─── Draw topology connections (signal pulse) ────────────
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const alphaA = getSpatialAlpha(a.x, a.y);
        if (alphaA <= 0.01) continue;

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const alphaB = getSpatialAlpha(b.x, b.y);
          if (alphaB <= 0.01) continue;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;

          const isBothAudited =
            a.isMember &&
            b.isMember &&
            a.auditedState > 0.4 &&
            b.auditedState > 0.4;
          const currentLimit = isBothAudited
            ? CONNECT_DIST_MEMBER
            : CONNECT_DIST_NORMAL;

          if (distSq < currentLimit * currentLimit) {
            const dist = Math.sqrt(distSq);
            const spatialFade = Math.min(alphaA, alphaB);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);

            if (isBothAudited) {
              // Signal pulse: high-frequency shimmer on audited connections
              const pulse = (Math.sin(t * 15 + dist) + 1) / 2;
              const baseAlpha = (1 - dist / currentLimit) * spatialFade;
              const lineAlpha = baseAlpha * (0.4 + 0.6 * pulse);

              const r = Math.round(
                BASE.r + (a.color.r - BASE.r) * a.auditedState
              );
              const g = Math.round(
                BASE.g + (a.color.g - BASE.g) * a.auditedState
              );
              const bCol = Math.round(
                BASE.b + (a.color.b - BASE.b) * a.auditedState
              );

              ctx.strokeStyle = `rgba(${r}, ${g}, ${bCol}, ${lineAlpha})`;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            } else if (!a.isMember && !b.isMember) {
              const lineAlpha =
                (1 - dist / currentLimit) *
                spatialFade *
                0.12 *
                (1 - diffusionPhase * 0.6);
              ctx.strokeStyle = `rgba(${BASE.r}, ${BASE.g}, ${BASE.b}, ${lineAlpha})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
        }
      }

      // ─── Draw particle nodes (micro-glow on audited members) ──
      for (const p of particles) {
        const spatialAlpha = getSpatialAlpha(p.x, p.y);
        if (spatialAlpha <= 0.01) continue;

        if (p.isMember) {
          const size = p.radius * (1 + p.auditedState * 0.4);
          const alpha = (0.3 + p.auditedState * 0.7) * spatialAlpha;

          const r = Math.round(
            BASE.r + (p.color.r - BASE.r) * p.auditedState
          );
          const g = Math.round(
            BASE.g + (p.color.g - BASE.g) * p.auditedState
          );
          const bCol = Math.round(
            BASE.b + (p.color.b - BASE.b) * p.auditedState
          );

          // Core particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${bCol}, ${alpha})`;
          ctx.fill();

          // Audit glow halo
          if (p.auditedState > 0.1) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${bCol}, ${alpha * 0.15 * p.auditedState})`;
            ctx.fill();
          }
        } else {
          const size = p.radius * (1 + diffusionPhase * 0.3);
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${BASE.r}, ${BASE.g}, ${BASE.b}, ${0.35 * spatialAlpha})`;
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
