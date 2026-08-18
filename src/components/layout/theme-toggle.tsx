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
      <div className="p-[9px] -m-[9px]">
        <div className="w-[48px] h-[26px] rounded-full bg-border opacity-50" aria-hidden="true" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="p-[9px] -m-[9px] cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <motion.button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle theme"
        tabIndex={-1}
        className="relative flex items-center w-[48px] h-[26px] rounded-full px-[3px] border border-border pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary group [@media(hover:hover)]:hover:border-accent-primary [@media(hover:hover)]:hover:scale-105 active:scale-95 transition-all"
        animate={{
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        }}
      >
        <motion.div
          className="w-[18px] h-[18px] rounded-full shadow-sm [@media(hover:hover)]:group-hover:shadow-[0_0_8px_var(--accent-primary)]"
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
    </div>
  );
}
