"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   TorusKnotScene — Three.js replacement for the 400-line 2D
   Canvas torus knot in the About / DNA section.

   Fixes applied vs v1:
   • Replaced CatmullRom curve + TubeGeometry with
     THREE.TorusKnotGeometry — clean topology, no seam line
   • IntersectionObserver now re-runs after isTouchDevice resolves
     (div was not mounted when effect first ran — observer never attached)
   • Added float / bob animation so knot moves like other shapes
   ───────────────────────────────────────────────────────────── */

/* ── 14 particles sampled from the torus knot parametric equation ── */
function KnotParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const NUM = 14;

  const state = useMemo(() =>
    Array.from({ length: NUM }, (_, i) => ({
      offset: i / NUM,
      speed:  0.00035 + Math.random() * 0.0003,
    })), []);

  const positions = useMemo(() => new Float32Array(NUM * 3), []);

  // Same parametric equation as original canvas (p=2, q=3 trefoil)
  const getKnotPoint = (t: number): [number, number, number] => {
    const a = t * Math.PI * 2;
    const R = 2.5, r = 1;
    return [
      (R + r * Math.cos(3 * a)) * Math.cos(2 * a),
      (R + r * Math.cos(3 * a)) * Math.sin(2 * a),
      r * Math.sin(3 * a),
    ];
  };

  useFrame(() => {
    for (let i = 0; i < NUM; i++) {
      state[i].offset = (state[i].offset + state[i].speed) % 1;
      const [x, y, z] = getKnotPoint(state[i].offset);
      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ff5500"
        size={0.16}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ── Main knot mesh ── */
function TorusKnot() {
  const groupRef   = useRef<THREE.Group>(null!);
  const wireMatRef = useRef<THREE.LineBasicMaterial>(null!);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null!);

  // THREE.TorusKnotGeometry — clean topology, no seam artifact
  // p=2, q=3 matches the original canvas parametric equation exactly
  const knotGeo = useMemo(() => new THREE.TorusKnotGeometry(2.5, 0.28, 160, 8, 2, 3), []);
  const wireGeo = useMemo(() => new THREE.WireframeGeometry(knotGeo), [knotGeo]);
  // Thin glow version — same p/q, smaller tube radius
  const glowGeo = useMemo(() => new THREE.TorusKnotGeometry(2.5, 0.06, 160, 4, 2, 3), []);

  useFrame(({ mouse, clock }) => {
    const t = clock.elapsedTime;

    // Mouse proximity brightness boost
    const dist      = Math.sqrt(mouse.x ** 2 + mouse.y ** 2);
    const proximity = Math.max(0, 1 - dist * 2.2);
    const influence = 0.45 + proximity * 0.35;

    // Continuous rotation + mouse tilt — same formula as original canvas
    groupRef.current.rotation.y = t       + mouse.x * influence;
    groupRef.current.rotation.x = t * 0.5 + mouse.y * influence;
    groupRef.current.rotation.z = t * 0.3;

    // Gentle float — same style as Hero shapes
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.6;
    groupRef.current.position.x = Math.cos(t * 0.25) * 0.35;

    // Opacity pulse on proximity
    if (wireMatRef.current) wireMatRef.current.opacity = 0.22 + proximity * 0.2;
    if (glowMatRef.current) glowMatRef.current.opacity = 0.07 + proximity * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Glow pass — additive blending for the warm halo effect */}
      <mesh geometry={glowGeo}>
        <meshBasicMaterial
          ref={glowMatRef}
          color="#ff5500"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe structural edges */}
      <lineSegments geometry={wireGeo}>
        <lineBasicMaterial
          ref={wireMatRef}
          color="#ff5500"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </lineSegments>

      {/* Travelling particles */}
      <KnotParticles />
    </group>
  );
}

/* ── Exported wrapper ── */
export function TorusKnotScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible]         = useState(false);
  // Hydration-safe: starts true (renders null) so server + first paint match.
  // After mount useEffect resolves the real value.
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Set real touch value after hydration — safe to call window here
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Depends on isTouchDevice so it re-runs once the div is actually mounted.
  // Without this dep, the effect fires when isTouchDevice=true (div absent),
  // containerRef.current is null, and the observer never attaches.
  useEffect(() => {
    if (isTouchDevice) return;
    const el = containerRef.current;
    if (!el) return;
    // Assume visible initially — section may already be in viewport
    setIsVisible(true);
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isTouchDevice]);

  // Don't render on touch/mobile — no hover, conserve GPU
  if (isTouchDevice) return null;

  return (
    <div ref={containerRef} className="about-manifesto-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop={isVisible ? "always" : "demand"}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 12], fov: 45 }}
      >
        <TorusKnot />
      </Canvas>
    </div>
  );
}
