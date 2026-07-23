"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { useLenis } from "@/components/layout/smooth-scroll-provider";

const INTRO_SESSION_KEY = "krado-intro-seen";

export function DecodeIntro() {
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [scrambledText, setScrambledText] = useState("KRADO");
  const lenis = useLenis();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      sessionStorage.removeItem(INTRO_SESSION_KEY);
    } catch {}
    setShouldShow(true);
  }, []);

  // Lock scroll
  useEffect(() => {
    if (shouldShow) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldShow, lenis]);

  // Handle exit state
  const handleExit = useCallback(() => {
    setIsExiting(true);
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {}
  }, []);

  const handleExitComplete = useCallback(() => {
    document.body.style.overflow = "";
    lenis?.start();
    setShouldShow(false);
  }, [lenis]);

  useEffect(() => {
    if (!shouldShow || shouldShow === null) return;
    
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setTimeout(handleExit, 800);
      return;
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    let iterations = 0;
    const interval = setInterval(() => {
      setScrambledText((prev) =>
        prev
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return "KRADO"[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      if (iterations >= "KRADO".length) {
        clearInterval(interval);
      }
      iterations += 1 / 8; // Slower decode to match laser
    }, 40);

    const tl = gsap.timeline({
      onComplete: handleExit,
    });
    
    // Initial fade in for the logo
    gsap.set(".intro-logo-mask", { opacity: 0, filter: "blur(10px)" });
    tl.to(".intro-logo-mask", {
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.8,
      ease: "power2.out"
    }, 0)
    // Animate the laser scan line width
    .to(".intro-laser", {
      scaleX: 1,
      duration: 1.5,
      ease: "power4.inOut",
      delay: 0.2
    }, 0)
    .to(".intro-container", {
      scale: 1.05,
      duration: 2.2,
      ease: "power2.out"
    }, 0);
    
    return () => {
      clearInterval(interval);
      tl.kill();
    };
  }, [shouldShow, handleExit]);

  if (shouldShow === null || shouldShow === false) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {!isExiting && (
        <motion.div
          ref={containerRef}
          key="decode-intro"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center intro-container overflow-hidden bg-background"
          initial={{ opacity: 1 }}
          exit={{ 
            clipPath: "inset(100% 0% 0% 0%)", 
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Krado</span>
          
          <div className="relative flex flex-col items-center w-full">
            <h1 
              className="text-[12vw] sm:text-[15vw] leading-none font-bold tracking-tighter intro-logo-mask text-foreground uppercase font-[family-name:var(--font-heading)]"
            >
              {scrambledText}
            </h1>
            
            {/* Laser Line */}
            <div 
              className="intro-laser absolute top-1/2 left-0 w-full h-[2px] origin-left -translate-y-1/2 opacity-80 z-10"
              style={{ 
                background: "var(--accent-primary)",
                boxShadow: "0 0 10px var(--accent-primary), 0 0 20px var(--accent-primary)",
                transform: "scaleX(0)"
              }}
            />
          </div>
          
          <div className="absolute bottom-8 right-8 text-xs font-mono uppercase tracking-widest text-muted-foreground opacity-50">
            [ INITIALIZING SEQUENCE ]
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
