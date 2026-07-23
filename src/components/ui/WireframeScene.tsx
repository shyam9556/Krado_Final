"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   WireframeScene — Three.js replacement for the 2D Canvas
   icosahedron in the Services section.

   Before: ~150 lines JS math + 42 draw calls/frame @ 30fps
   After:  1 GPU draw call, zero main-thread matrix math
   ───────────────────────────────────────────────────────────── */

function IcoMesh() {
  const groupRef = useRef<THREE.Group>(null!);

  // Geometries built once at mount — never re-allocated
  const solidGeo = useMemo(() => new THREE.IcosahedronGeometry(1.5, 0), []);
  const wireGeo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1.5, 0);
    return new THREE.WireframeGeometry(g);
  }, []);

  useFrame(({ mouse, clock }) => {
    const t = clock.elapsedTime;
    // Same rotation formula as original canvas code
    groupRef.current.rotation.x = t * 0.7 + mouse.y * 0.3;
    groupRef.current.rotation.y = t + mouse.x * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* Pass 1: invisible solid mesh — writes depth buffer so back edges are occluded */}
      <mesh geometry={solidGeo}>
        <meshBasicMaterial colorWrite={false} side={THREE.BackSide} />
      </mesh>

      {/* Pass 2: wireframe LineSegments — GPU depth test clips back faces naturally */}
      <lineSegments geometry={wireGeo}>
        <lineBasicMaterial
          color="#ff5500"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export function WireframeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Pause rendering when scrolled off-screen — same as original IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="services-wireframe" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop={isVisible ? "always" : "demand"}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <IcoMesh />
      </Canvas>
    </div>
  );
}
