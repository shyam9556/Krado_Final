/* eslint-disable */
"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export function Magnetic({
  children,
  strength = 0.2,
  springOptions = { type: "spring", stiffness: 150, damping: 15, mass: 0.1 },
}: {
  children: React.ReactNode;
  strength?: number;
  springOptions?: Record<string, unknown>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={springOptions}
      style={{ display: "inline-flex" }}
    >
      {children}
    </motion.div>
  );
}
