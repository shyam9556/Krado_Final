/* eslint-disable */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[44px] h-[24px] rounded-full bg-border opacity-50" aria-hidden="true" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center w-[48px] h-[26px] rounded-full px-[3px] border border-border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary group"
      animate={{
        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      }}
      whileHover={{ 
        scale: 1.05,
        borderColor: "var(--accent-primary)"
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-[18px] h-[18px] rounded-full shadow-sm group-hover:shadow-[0_0_8px_var(--accent-primary)]"
        initial={false}
        animate={{
          x: isDark ? 22 : 0,
          backgroundColor: isDark ? "var(--foreground)" : "var(--accent-primary)"
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    </motion.button>
  );
}
