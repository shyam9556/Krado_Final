"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   TorusKnotCanvas — Living Data Sphere.

   A slowly rotating sphere of interconnected dots — like a
   global data network. Back hemisphere fades naturally, front
   hemisphere glows. A sweep pulse ring travels across the
   sphere surface periodically for visual interest.

   Fibonacci spiral distribution ensures even dot spacing.
   ───────────────────────────────────────────────────────────── */

const NUM_DOTS = 90;
const CONNECT_DIST_SQ = 0.55; // squared threshold — avoids sqrt()
const ACCENT_R = 255, ACCENT_G = 85, ACCENT_B = 0;

// ── Fibonacci sphere: evenly distributed points on unit sphere ──
function createFibSphere(n: number): number[][] {
  const pts: number[][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2; // -1 to 1
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    pts.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius]);
  }
  return pts;
}

const BASE_POINTS = createFibSphere(NUM_DOTS);

// ── 3D rotation ──
function rotateY(v: number[], a: number): number[] {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}
function rotateX(v: number[], a: number): number[] {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}

export function TorusKnotCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);

  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setIsMounted(e.isIntersecting),
      { rootMargin: "100px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isTouchDevice]);

  useEffect(() => {
    if (isTouchDevice || !isMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      w = rect.width;
      h = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);

    // Pre-allocate projected positions
    const px = new Float32Array(NUM_DOTS);
    const py = new Float32Array(NUM_DOTS);
    const pz = new Float32Array(NUM_DOTS);

    const animate = (timestamp: number) => {
      if (timestamp - lastTimeRef.current < 33) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTimeRef.current = timestamp;
      timeRef.current += 0.016;
      const t = timeRef.current;
      if (w === 0) { animRef.current = requestAnimationFrame(animate); return; }

      const cx = w * 0.5;
      const cy = h * 0.5;
      const radius = Math.min(w, h) * 0.38;
      // Gentle breathing — sphere radius oscillates slightly
      const breathe = 1 + Math.sin(t * 0.6) * 0.03;
      const r = radius * breathe;
      // Tilt slightly so it's not a boring front-on view
      const tiltX = 0.35;
      const rotY = t * 0.3; // slow rotation

      ctx.clearRect(0, 0, w, h);

      // ── Project dots ──
      for (let i = 0; i < NUM_DOTS; i++) {
        let v = BASE_POINTS[i];
        v = rotateY(v, rotY);
        v = rotateX(v, tiltX);
        px[i] = cx + v[0] * r;
        py[i] = cy + v[1] * r;
        pz[i] = v[2]; // -1 to 1, front is positive
      }

      // Sweep pulse: a ring of latitude that brightens periodically
      const pulsePhase = (t * 0.4) % 1; // 0-1 repeating
      const pulseY = 1 - pulsePhase * 2; // +1 to -1

      // ── Draw connections (only front hemisphere, nearby dots) ──
      for (let i = 0; i < NUM_DOTS; i++) {
        if (pz[i] < -0.15) continue; // skip back hemisphere
        const alphaI = pz[i] < 0.15
          ? 0.03 + (pz[i] + 0.15) * 0.5
          : 0.15 + (pz[i] - 0.15) * 0.25;

        for (let j = i + 1; j < NUM_DOTS; j++) {
          if (pz[j] < -0.15) continue;
          // Squared distance check on unit sphere (before projection)
          const bp_i = BASE_POINTS[i], bp_j = BASE_POINTS[j];
          let vi = rotateY(bp_i, rotY); vi = rotateX(vi, tiltX);
          let vj = rotateY(bp_j, rotY); vj = rotateX(vj, tiltX);
          const dx = vi[0] - vj[0], dy = vi[1] - vj[1], dz = vi[2] - vj[2];
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq > CONNECT_DIST_SQ) continue;

          const alphaJ = pz[j] < 0.15
            ? 0.03 + (pz[j] + 0.15) * 0.5
            : 0.15 + (pz[j] - 0.15) * 0.25;
          const lineAlpha = Math.min(alphaI, alphaJ) * (1 - distSq / CONNECT_DIST_SQ);

          ctx.beginPath();
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
          ctx.strokeStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${lineAlpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // ── Draw dots ──
      for (let i = 0; i < NUM_DOTS; i++) {
        const z = pz[i];
        if (z < -0.2) continue; // cull back hemisphere

        // Depth-based visibility
        const depthAlpha = z < 0
          ? 0.04 + (z + 0.2) * 0.6
          : 0.16 + z * 0.5;

        // Pulse sweep boost — dots near the sweep latitude brighten
        const dotY = BASE_POINTS[i][1]; // original Y before rotation
        let vi_rot = rotateY(BASE_POINTS[i], rotY);
        vi_rot = rotateX(vi_rot, tiltX);
        const projectedY = vi_rot[1]; // Y after rotation
        const distToPulse = Math.abs(projectedY - pulseY);
        const pulseBoost = distToPulse < 0.15
          ? (1 - distToPulse / 0.15) * 0.4
          : 0;

        const alpha = Math.min(depthAlpha + pulseBoost, 0.85);
        const dotRadius = 1.4 + z * 0.6 + pulseBoost * 2;

        // Glow on bright dots
        if (alpha > 0.25) {
          ctx.beginPath();
          ctx.arc(px[i], py[i], dotRadius * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${alpha * 0.08})`;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(px[i], py[i], Math.max(dotRadius, 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${alpha})`;
        ctx.fill();
      }

      // ── Subtle center glow ──
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.015)`;
      ctx.fill();

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isTouchDevice, isMounted]);

  if (isTouchDevice) return null;

  return (
    <div ref={wrapperRef} className="about-manifesto-canvas" aria-hidden="true">
      {isMounted && (
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
}
