"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: ReadonlyArray<{ label: string; href: string }>;
  activeSection: string;
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
  },
};

const linkContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.2 },
  },
};

export function MobileNav({
  isOpen,
  onClose,
  links,
  activeSection,
}: MobileNavProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = setTimeout(() => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusable = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      focusable[0]?.focus();
    }, 120);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusable = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          ref={overlayRef}
          id="mobile-nav"
          className="fixed inset-0 z-40 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="relative w-full max-w-sm h-full bg-surface border-l border-border shadow-2xl overflow-hidden flex flex-col justify-center px-8"
            variants={prefersReducedMotion ? overlayVariants : drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Blurred background text */}
            <div className="absolute inset-0 flex items-center justify-center -z-10 overflow-hidden pointer-events-none opacity-5">
              <span className="text-[20vh] font-heading font-black tracking-tighter text-foreground rotate-90 scale-[2.5]">
                KRADO
              </span>
            </div>

            <motion.nav
              className="flex flex-col gap-6"
              variants={linkContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {links.map((link, i) => {
                const isActive = `#${activeSection}` === link.href;
                return (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="group relative text-4xl font-heading font-bold text-foreground overflow-hidden"
                    variants={linkVariants}
                    onClick={onClose}
                  >
                    <span className="text-sm font-mono text-accent-primary mr-4 inline-block transform -translate-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      0{i + 1}
                    </span>
                    <span className={isActive ? "text-accent-primary" : "group-hover:text-accent-primary transition-colors duration-300"}>
                      {link.label}
                    </span>
                  </motion.a>
                );
              })}

              <motion.div variants={linkVariants} className="mt-12 flex flex-col gap-6">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center bg-accent-primary text-background font-bold py-4 px-8 rounded-sm hover:bg-accent-secondary transition-colors"
                  onClick={onClose}
                >
                  Start a Project
                </a>
                <div className="self-start">
                  <ThemeToggle />
                </div>
              </motion.div>
            </motion.nav>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
