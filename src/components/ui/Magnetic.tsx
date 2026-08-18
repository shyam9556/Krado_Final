/* eslint-disable */
"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function Magnetic({
  children,
  strength = 0.2,
  springOptions = { stiffness: 150, damping: 15, mass: 0.1 },
}: {
  children: React.ReactNode;
  strength?: number;
  springOptions?: { stiffness?: number; damping?: number; mass?: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  // M23: detect touch at mount — must use useState (not useRef) so the
  // component re-renders after detection and Framer Motion binds the
  // whileTap gesture listeners. useRef mutation doesn't trigger re-render,
  // leaving whileTap as undefined forever.
  // Hydration-safe: initial false matches SSR → useEffect sets true on client.
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  // MotionValues update the DOM directly — zero React re-renders on mousemove
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Skip spring physics on touch devices — no cursor to follow.
      // Check at event-time instead of render-time to avoid SSR hydration mismatch.
      // matchMedia("(hover: none)") is true on phones/tablets.
      if (window.matchMedia("(hover: none)").matches) return;
      if (!ref.current) return;
      const { height, width, left, top } =
        ref.current.getBoundingClientRect();
      const middleX = e.clientX - (left + width / 2);
      const middleY = e.clientY - (top + height / 2);
      x.set(middleX * strength);
      y.set(middleY * strength);
    },
    [strength, x, y]
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Always render <motion.div> — identical DOM tree on server and client.
  // On touch devices, handleMouse returns immediately so springs stay at (0,0).
  // whileTap gives touch users a press-feel since hover/spring never fire for them.
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileTap={isTouch ? { scale: 0.97 } : undefined}
      style={{ display: "inline-flex", x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}
