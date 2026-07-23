"use client";

import { useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   HeroCanvas — Interactive 3D constellation with floating
   wireframe geometries, particles, connection lines, and
   mouse-reactive physics. Pure Canvas 2D with 3D projection.
   ───────────────────────────────────────────────────────────── */

// ── 3D math helpers ──

function rotateX(v: number[], angle: number): number[] {
  const [x, y, z] = v;
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x, y * c - z * s, y * s + z * c];
}

function rotateY(v: number[], angle: number): number[] {
  const [x, y, z] = v;
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x * c + z * s, y, -x * s + z * c];
}

function rotateZ(v: number[], angle: number): number[] {
  const [x, y, z] = v;
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x * c - y * s, x * s + y * c, z];
}

function project(
  v: number[],
  cx: number,
  cy: number,
  scale: number,
  fov: number = 5
): [number, number, number] {
  const [x, y, z] = v;
  const perspective = fov / (fov + z);
  return [cx + x * scale * perspective, cy + y * scale * perspective, z];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function dist2D(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// ── Geometry definitions ──

function createIcosahedron(): { vertices: number[][]; edges: [number, number][] } {
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];
  const edges: [number, number][] = [
    [0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],
    [2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],
    [4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],
    [7,8],[7,10],[8,9],[10,11],
  ];
  return { vertices, edges };
}

function createOctahedron(): { vertices: number[][]; edges: [number, number][] } {
  const vertices = [
    [0, 1, 0], [1, 0, 0], [0, 0, 1],
    [-1, 0, 0], [0, 0, -1], [0, -1, 0],
  ];
  const edges: [number, number][] = [
    [0,1],[0,2],[0,3],[0,4],
    [5,1],[5,2],[5,3],[5,4],
    [1,2],[2,3],[3,4],[4,1],
  ];
  return { vertices, edges };
}

function createTorusKnot(): { vertices: number[][]; edges: [number, number][] } {
  const vertices: number[][] = [];
  const segments = 80;
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const r = 1 + 0.4 * Math.cos(3 * t);
    vertices.push([
      r * Math.cos(2 * t),
      r * Math.sin(2 * t),
      0.4 * Math.sin(3 * t),
    ]);
  }
  const edges: [number, number][] = [];
  for (let i = 0; i < segments; i++) {
    edges.push([i, (i + 1) % segments]);
  }
  return { vertices, edges };
}

// ── Floating shape class ──

interface Shape {
  geometry: { vertices: number[][]; edges: [number, number][] };
  position: number[];      // [x, y, z] world position
  rotSpeed: number[];      // [rx, ry, rz] rotation speeds
  rotation: number[];      // current [rx, ry, rz]
  scale: number;
  baseAlpha: number;
  glowIntensity: number;
  floatPhase: number;
  floatSpeed: number;
  floatAmplitude: number;
}

// ── Particle class ──

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  alpha: number;
  phase: number;
  speed: number;
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0); // 30fps cap
  const shapesRef = useRef<Shape[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const initedRef = useRef(false);

  const initScene = useCallback((w: number, h: number) => {
    // ── Create shapes ──
    const shapes: Shape[] = [
      // Large icosahedron — top right
      {
        geometry: createIcosahedron(),
        position: [w * 0.72, h * 0.28, 0],
        rotSpeed: [0.003, 0.005, 0.002],
        rotation: [0, 0, 0],
        scale: Math.min(w, h) * 0.1,
        baseAlpha: 0.55,
        glowIntensity: 0.8,
        floatPhase: 0,
        floatSpeed: 0.8,
        floatAmplitude: 18,
      },
      // Octahedron — mid right
      {
        geometry: createOctahedron(),
        position: [w * 0.82, h * 0.58, 0],
        rotSpeed: [0.006, 0.004, 0.003],
        rotation: [0.5, 0.3, 0],
        scale: Math.min(w, h) * 0.07,
        baseAlpha: 0.45,
        glowIntensity: 0.7,
        floatPhase: Math.PI * 0.7,
        floatSpeed: 1.1,
        floatAmplitude: 14,
      },
      // Torus knot — bottom right
      {
        geometry: createTorusKnot(),
        position: [w * 0.68, h * 0.75, 0],
        rotSpeed: [0.002, 0.003, 0.004],
        rotation: [0.8, 0, 0.4],
        scale: Math.min(w, h) * 0.08,
        baseAlpha: 0.4,
        glowIntensity: 0.6,
        floatPhase: Math.PI * 1.4,
        floatSpeed: 0.6,
        floatAmplitude: 20,
      },
      // Small icosahedron — far right
      {
        geometry: createIcosahedron(),
        position: [w * 0.92, h * 0.42, 0],
        rotSpeed: [0.008, 0.006, 0.004],
        rotation: [1, 0.5, 0],
        scale: Math.min(w, h) * 0.04,
        baseAlpha: 0.35,
        glowIntensity: 0.5,
        floatPhase: Math.PI * 0.3,
        floatSpeed: 1.5,
        floatAmplitude: 10,
      },
    ];
    shapesRef.current = shapes;

    // ── Create particles ──
    const particles: Particle[] = [];
    const particleCount = Math.floor(Math.min(w * h * 0.00008, 60));
    for (let i = 0; i < particleCount; i++) {
      // Concentrate particles on the right side (60% - 100% width)
      const x = w * (0.45 + Math.random() * 0.55);
      const y = h * Math.random();
      particles.push({
        x,
        y,
        z: Math.random() * 2 - 1,
        vx: 0,
        vy: 0,
        baseX: x,
        baseY: y,
        size: 2 + Math.random() * 2.5,
        alpha: 0.25 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.5,
      });
    }
    particlesRef.current = particles;
    initedRef.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── Resize ──
    const resize = () => {
      const isMobile = window.innerWidth < 768;
      const maxDpr = isMobile ? 1 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = isMobile ? "low" : "high";
      initScene(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Mouse tracking ──
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      mouseRef.current.x = (e.clientX - rect.left) / w;
      mouseRef.current.y = (e.clientY - rect.top) / h;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    // Skip mouse tracking on touch devices — no cursor exists
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
    }

    // ── Animation loop ──
    const animate = (timestamp: number) => {
      // 30fps cap — every skipped frame is a full frame given back to scroll/React
      if (timestamp - lastTimeRef.current < 33) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTimeRef.current = timestamp;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += 0.016;
      const time = timeRef.current;

      // Smooth mouse interpolation
      const sm = smoothMouseRef.current;
      let targetX = mouseRef.current.active ? mouseRef.current.x : 0.5;
      let targetY = mouseRef.current.active ? mouseRef.current.y : 0.5;
      
      if (isNaN(targetX)) targetX = 0.5;
      if (isNaN(targetY)) targetY = 0.5;

      sm.x = lerp(sm.x, targetX, 0.04);
      sm.y = lerp(sm.y, targetY, 0.04);

      if (isNaN(sm.x)) sm.x = 0.5;
      if (isNaN(sm.y)) sm.y = 0.5;

      const mouseWorldX = sm.x * w;
      const mouseWorldY = sm.y * h;

      ctx.clearRect(0, 0, w, h);

      // ── Update & draw particles ──
      const particles = particlesRef.current;
      particles.forEach((p) => {
        // Gentle drift animation
        p.x = p.baseX + Math.sin(time * p.speed + p.phase) * 15;
        p.y = p.baseY + Math.cos(time * p.speed * 0.7 + p.phase) * 10;

        // Mouse repulsion
        const dx = p.x - mouseWorldX;
        const dy = p.y - mouseWorldY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 150;
        if (dist < repelRadius && mouseRef.current.active) {
          const force = (1 - dist / repelRadius) * 30;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Pulse alpha
        const pulseAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 2 + p.phase));
        
        // Draw particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 85, 0, ${pulseAlpha})`;
        ctx.fill();

        // Glow — simple large low-opacity circle instead of createRadialGradient (no per-frame allocation)
        if (p.size > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 85, 0, ${pulseAlpha * 0.08})`;
          ctx.fill();
        }
      });

      // ── Draw connection lines between nearby particles ──
      // Limit to max 3 nearest neighbours per particle to avoid O(N²) cost
      const connectionDist = 120;
      const maxConnections = 3;
      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < particles.length && connections < maxConnections; j++) {
          const d = dist2D(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
          if (d < connectionDist) {
            connections++;
            const alpha = (1 - d / connectionDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 85, 0, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // ── Draw shapes ──
      const shapes = shapesRef.current;
      shapes.forEach((shape) => {
        // Update rotation
        shape.rotation[0] += shape.rotSpeed[0];
        shape.rotation[1] += shape.rotSpeed[1];
        shape.rotation[2] += shape.rotSpeed[2];

        // Float animation
        const floatY = Math.sin(time * shape.floatSpeed + shape.floatPhase) * shape.floatAmplitude;
        const floatX = Math.cos(time * shape.floatSpeed * 0.5 + shape.floatPhase) * shape.floatAmplitude * 0.5;

        // Mouse influence — shapes subtly follow cursor
        const mouseInfluenceX = (sm.x - 0.5) * 40;
        const mouseInfluenceY = (sm.y - 0.5) * 30;

        const cx = shape.position[0] + floatX + mouseInfluenceX;
        const cy = shape.position[1] + floatY + mouseInfluenceY;

        // Mouse proximity glow boost
        const distToMouse = dist2D(cx, cy, mouseWorldX, mouseWorldY);
        const proximityBoost = mouseRef.current.active
          ? Math.max(0, 1 - distToMouse / 300) * 0.4
          : 0;

        // Add extra rotation toward mouse
        const mouseRotX = (sm.y - 0.5) * 0.3;
        const mouseRotY = (sm.x - 0.5) * 0.3;

        // Project vertices
        const projected = shape.geometry.vertices.map((v) => {
          let rv = [...v];
          rv = rotateX(rv, shape.rotation[0] + mouseRotX);
          rv = rotateY(rv, shape.rotation[1] + mouseRotY);
          rv = rotateZ(rv, shape.rotation[2]);
          return project(rv, cx, cy, shape.scale);
        });

        // Draw edges with depth-based alpha
        shape.geometry.edges.forEach(([a, b]) => {
          const [x1, y1, z1] = projected[a];
          const [x2, y2, z2] = projected[b];
          const avgZ = (z1 + z2) / 2;
          const depthAlpha = 0.3 + 0.7 * ((avgZ + 2) / 4);
          const alpha = (shape.baseAlpha + proximityBoost) * depthAlpha;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(255, 85, 0, ${Math.min(alpha, 0.85)})`;
          ctx.lineWidth = 1.5 + proximityBoost * 2;
          ctx.stroke();
        });

        // Draw vertices as glowing dots
        projected.forEach(([x, y, z]) => {
          const depthAlpha = 0.3 + 0.7 * ((z + 2) / 4);
          const alpha = (shape.baseAlpha + proximityBoost) * depthAlpha;
          const radius = (2.5 + proximityBoost * 3) * (0.7 + 0.3 * depthAlpha);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 85, 0, ${Math.min(alpha * 1.5, 0.9)})`;
          ctx.fill();

          // Vertex glow — simple circle, no createRadialGradient allocation
          if (proximityBoost > 0.1) {
            ctx.beginPath();
            ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 85, 0, ${proximityBoost * 0.1})`;
            ctx.fill();
          }
        });

      });

      // ── Mouse cursor glow — simple arc, no createRadialGradient allocation ──
      if (mouseRef.current.active) {
        ctx.beginPath();
        ctx.arc(mouseWorldX, mouseWorldY, 80, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 85, 0, 0.025)";
        ctx.fill();
      }

      if (isVisible) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          cancelAnimationFrame(animRef.current);
          animRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    animRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [initScene]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas-3d"
      aria-hidden="true"
    />
  );
}
