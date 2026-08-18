"use client";

import { useEffect, useRef, useState } from "react";

const phi = (1 + Math.sqrt(5)) / 2;
const VERTS = [[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]];
const EDGES = [[0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],[2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],[4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],[7,8],[7,10],[8,9],[10,11]];

function rotateX(v: number[], a: number): number[] { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c]; }
function rotateY(v: number[], a: number): number[] { const c = Math.cos(a), s = Math.sin(a); return [v[0]*c + v[2]*s, v[1], -v[0]*s + v[2]*c]; }
function project(v: number[], cx: number, cy: number, scale: number, fov = 5): [number, number, number] {
  const p = fov / (fov + v[2]); return [cx + v[0]*scale*p, cy + v[1]*scale*p, v[2]];
}

export function WireframeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Detect touch device — skip canvas entirely on mobile
  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setIsMounted(e.isIntersecting), { rootMargin: "100px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [isTouchDevice]);

  useEffect(() => {
    if (!isMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // M24: isMobile and dpr are now evaluated inside resize() so they
    // re-read window.innerWidth on every resize/rotation event.
    // Previously: const isMobile = window.innerWidth < 768 was captured
    // once at mount — rotating phone from portrait→landscape left it stale.
    let dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 2);

    function resize() {
      const isMobile = window.innerWidth < 768; // re-evaluate on every resize
      const el = canvas!.parentElement!;
      const w = el.clientWidth, h = el.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function animate(timestamp: number) {
      if (timestamp - lastTimeRef.current < 33) { animRef.current = requestAnimationFrame(animate); return; }
      lastTimeRef.current = timestamp;
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = canvas!.width / dpr, h = canvas!.height / dpr;
      const cx = w / 2, cy = h / 2, scale = Math.min(w, h) * 0.32;

      ctx!.clearRect(0, 0, w, h);

      const projected: [number, number, number][] = VERTS.map(v => {
        let r = rotateX(v.map(c => c * 1.5), t * 0.7);
        r = rotateY(r, t);
        return project(r, cx, cy, scale);
      });

      ctx!.lineWidth = 1.2;
      for (const [a, b] of EDGES) {
        const pa = projected[a], pb = projected[b];
        const avgZ = (pa[2] + pb[2]) / 2;
        const depthAlpha = 0.3 + 0.7 * ((avgZ + 2) / 4);
        const alpha = 0.28 * depthAlpha;
        ctx!.strokeStyle = `rgba(255,85,0,${alpha})`;
        ctx!.beginPath(); ctx!.moveTo(pa[0], pa[1]); ctx!.lineTo(pb[0], pb[1]); ctx!.stroke();
      }

      ctx!.fillStyle = "rgba(255,85,0,0.28)";
      for (const p of projected) {
        ctx!.beginPath(); ctx!.arc(p[0], p[1], 1.5, 0, Math.PI * 2); ctx!.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isMounted]);

  if (isTouchDevice) return <div className="services-wireframe" aria-hidden="true" />;

  return (
    <div ref={containerRef} className="services-wireframe" aria-hidden="true">
      {isMounted && <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />}
    </div>
  );
}
