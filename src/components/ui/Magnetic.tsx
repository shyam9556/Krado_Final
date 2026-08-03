/* eslint-disable */
"use client";

import React, { useRef, useCallback } from "react";
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

  // MotionValues update the DOM directly — zero React re-renders on mousemove
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ display: "inline-flex", x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}
