"use client";

import "@/styles/hero.css";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { useLenis } from "@/components/layout/smooth-scroll-provider";
import { useIntroState } from "@/components/layout/intro-state-provider";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroCanvas } from "@/components/ui/HeroCanvas";

const NAVBAR_HEIGHT = 72;
const SCROLL_FADE_DISTANCE = 100;

export function Hero() {
  const { introComplete } = useIntroState();
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();
  const scrollOpacityRef = useRef(1);
  const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Direct DOM tilt on mouse move — no React style conflict,
     no Framer Motion RAF, no GSAP CSSPlugin. CSS transition handles reset. ── */
  const tiltRef = useRef<HTMLDivElement>(null);
  const isCoarsePointer = useRef(false);

  // Evaluate pointer type once on mount — reading a ref is zero-cost vs
  // calling window.matchMedia() on every mousemove (60+ times/sec).
  useEffect(() => {
    isCoarsePointer.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isCoarsePointer.current) return;
    if (prefersReducedMotion || !tiltRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    tiltRef.current.style.transform =
      `perspective(1000px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
  }, [prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  }, []);

  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => {
      const progress = Math.min(lenis.scroll / SCROLL_FADE_DISTANCE, 1);
      // Once fully faded, unregister — no more scroll work needed
      if (progress >= 1 && scrollOpacityRef.current === 0) return;
      const newOpacity = 1 - progress;
      // Force update at exact boundaries (0 or 1) to guarantee clean fade-out/in.
      // Otherwise, a final delta < 0.05 leaves a faint ghost at ~4% opacity.
      const isBoundary =
        (newOpacity === 0 && scrollOpacityRef.current !== 0) ||
        (newOpacity === 1 && scrollOpacityRef.current !== 1);
      // Only trigger React re-render when opacity changes by > 0.05 or hits boundary
      if (isBoundary || Math.abs(newOpacity - scrollOpacityRef.current) > 0.05) {
        scrollOpacityRef.current = newOpacity;
        setScrollIndicatorOpacity(newOpacity);
      }
    };
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  const shouldAnimate = prefersReducedMotion ? "visible" : introComplete ? "visible" : "hidden";

  // Split headline for clip-path animation
  const headlineLine1 = ["Building"];
  const headlineLine2 = ["software", "that"];
  const headlineWords2 = ["your", "business", "forward"];

  const wordAnimation: Variants = {
    hidden: { y: "110%" },
    visible: { 
      y: "0%", 
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
    }
  };

  const fadeAnimation: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.6 } 
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-background pt-20 md:pt-24 pb-8"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* ── Background Textures ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="scanline-grid opacity-10 dark:opacity-30" />
        <div className="light-leak" />
        
        {/* Subtle radial glow — top-left accent */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none transition-opacity duration-1000"
          style={{
            background: "radial-gradient(circle, rgba(255,85,0,0.03) 0%, transparent 80%)",
          }}
        />
      </div>

      {/* ── Interactive 3D Canvas ── */}
      {!prefersReducedMotion && <HeroCanvas />}

      {/* ── Vertical Decorative Label ── */}
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 rotate-90 origin-right text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase opacity-60 dark:opacity-40">
        01 — IT Services & Software
      </div>

      {/* ── Foreground content ── */}
      <motion.div
        className="hero-inner-container relative z-10"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate={shouldAnimate}
      >
        {/* Inner wrapper for direct DOM tilt — separated from
            motion.div so entrance animation and tilt don't conflict */}
        <div ref={tiltRef} className="hero-tilt-wrapper" style={{ transformStyle: "preserve-3d" }}>
          <div className="max-w-4xl" style={{ transform: "translateZ(40px)" }}>
          
          <motion.h1 className="h1 flex flex-col gap-1 uppercase tracking-tighter mb-4 md:mb-6 leading-[0.9]">
            {/* Line 1 — BUILDING */}
            <div className="flex gap-x-4 overflow-hidden py-2">
              {headlineLine1.map((word, i) => (
                <motion.span 
                  key={i} 
                  className="inline-block" 
                  variants={wordAnimation}
                  transition={{ delay: i * 0.05 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Line 2 — SOFTWARE THAT */}
            <div className="flex gap-x-4 overflow-hidden py-2">
              {headlineLine2.map((word, i) => (
                <motion.span 
                  key={i} 
                  className="inline-block" 
                  variants={wordAnimation}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            
            {/* Accent Line */}
            <div className="overflow-hidden py-2 -my-2">
              <motion.span 
                className="inline-block text-accent-primary dark:drop-shadow-[0_0_15px_rgba(255,85,0,0.3)]" 
                variants={wordAnimation}
                transition={{ delay: 0.2 }}
              >
                MOVES
              </motion.span>
            </div>

            {/* Line 3 */}
            <div className="flex flex-wrap gap-x-4 overflow-hidden py-2">
              {headlineWords2.map((word, i) => (
                <motion.span 
                  key={i} 
                  className="inline-block" 
                  variants={wordAnimation}
                  transition={{ delay: 0.3 + (i * 0.05) }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </motion.h1>

          <motion.p 
            variants={fadeAnimation} 
            className="body-lg max-w-xl mb-6 md:mb-8 border-l-2 border-accent-primary pl-6 text-muted-foreground"
            style={{ transform: "translateZ(20px)" }}
          >
            We partner with ambitious teams to design, develop, and ship
            high-quality software products — from early-stage MVPs to
            enterprise-grade platforms.
          </motion.p>

          <motion.div 
            variants={fadeAnimation} 
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8"
            style={{ transform: "translateZ(30px)" }}
          >
            <Magnetic strength={0.25}>
              <a 
                href="#contact" 
                className="hero-cta-primary relative overflow-hidden bg-foreground px-8 py-4 text-sm font-bold text-background inline-flex items-center gap-3 border"
                style={{ borderRadius: "2px" }}
              >
                <div className="hero-cta-primary__sweep absolute inset-0 bg-accent-primary" />
                <span className="hero-cta-primary__text relative z-10">Start a Project</span>
                <span className="hero-cta-primary__arrow relative z-10">→</span>
              </a>
            </Magnetic>
            
            <Magnetic strength={0.15}>
              <a 
                href="#work" 
                className="hero-cta-secondary relative text-sm font-bold tracking-widest uppercase text-foreground inline-flex items-center gap-2 overflow-hidden py-2"
              >
                <span className="relative flex flex-col items-center">
                  <span className="hero-cta-secondary__slide-top">View Our Work</span>
                  <span className="hero-cta-secondary__slide-bottom">View Our Work</span>
                </span>
                <span className="hero-cta-secondary__arrow text-accent-primary">↗</span>
              </a>
            </Magnetic>

          </motion.div>

        </div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-8 left-6 md:left-12 flex flex-col items-center gap-2 transition-opacity duration-300"
        style={{ opacity: scrollIndicatorOpacity }}
        aria-hidden="true"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground rotate-90 origin-bottom translate-y-6">Scroll</span>
        <div className="w-[1px] h-12 bg-foreground/20 dark:bg-border relative overflow-hidden mt-8">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-accent-primary animate-[scrollDown_2s_infinite]" />
        </div>
      </div>
      

    </section>
  );
}
