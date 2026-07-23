"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, useSpring, Variants } from "framer-motion";
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
  const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const springConfig = { damping: 30, stiffness: 150, mass: 0.5 };
  
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // 3D Tilt for main content
  const rotateX = useTransform(mouseY, [-1, 1], [3, -3]);
  const rotateY = useTransform(mouseX, [-1, 1], [-3, 3]);

  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => {
      const progress = Math.min(lenis.scroll / SCROLL_FADE_DISTANCE, 1);
      setScrollIndicatorOpacity(1 - progress);
    };
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  const shouldAnimate = prefersReducedMotion ? "visible" : introComplete ? "visible" : "hidden";

  // Split headline for clip-path animation
  const headlineWords1 = ["Building", "software", "that"];
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
      className="relative min-h-screen overflow-hidden bg-background pt-20 md:pt-24 pb-12"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* ── Background Textures ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="scanline-grid opacity-30 dark:opacity-10" />
        <div className="light-leak" />
        
        {/* Subtle radial glow — top-left accent */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none transition-opacity duration-1000"
          style={{
            background: "radial-gradient(circle, rgba(255,85,0,0.05) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* ── Interactive 3D Canvas ── */}
      {!prefersReducedMotion && <HeroCanvas />}

      {/* ── Vertical Decorative Label ── */}
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 rotate-90 origin-right text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase opacity-40">
        01 — IT Services & Software
      </div>

      {/* ── Foreground content ── */}
      <motion.div
        className="hero-inner-container relative z-10"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate={shouldAnimate}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <div className="max-w-4xl" style={{ transform: "translateZ(40px)" }}>
          
          <motion.h1 className="h1 flex flex-col gap-2 uppercase tracking-tighter mb-8 leading-[0.9]">
            {/* Line 1 */}
            <div className="flex flex-wrap gap-x-4 overflow-hidden py-2">
              {headlineWords1.map((word, i) => (
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
            
            {/* Accent Line */}
            <div className="overflow-hidden py-2 -my-2">
              <motion.span 
                className="inline-block text-accent-primary drop-shadow-[0_0_15px_rgba(255,85,0,0.3)]" 
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
            className="body-lg max-w-xl mb-12 border-l-2 border-accent-primary pl-6 text-muted-foreground"
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
                className="group relative overflow-hidden bg-foreground px-8 py-4 text-sm font-bold text-background transition-all duration-300 inline-flex items-center gap-3 border border-transparent hover:border-accent-primary"
                style={{ borderRadius: "2px" }}
              >
                <div className="absolute inset-0 bg-accent-primary transform scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-[0.76,0,0.24,1]" />
                <span className="relative z-10 group-hover:text-[#060609] transition-colors duration-300">Start a Project</span>
                <span className="relative z-10 transform translate-x-0 group-hover:translate-x-1 group-hover:text-[#060609] transition-all duration-300">→</span>
              </a>
            </Magnetic>
            
            <Magnetic strength={0.15}>
              <a 
                href="#work" 
                className="group relative text-sm font-bold tracking-widest uppercase text-foreground inline-flex items-center gap-2 overflow-hidden py-2"
              >
                <span className="relative flex flex-col items-center">
                  <span className="transition-transform duration-300 ease-[0.76,0,0.24,1] group-hover:-translate-y-[120%]">View Our Work</span>
                  <span className="absolute top-0 left-0 transition-transform duration-300 ease-[0.76,0,0.24,1] translate-y-[120%] group-hover:translate-y-0 text-accent-primary">View Our Work</span>
                </span>
                <span className="text-accent-primary transform translate-x-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
              </a>
            </Magnetic>
          </motion.div>

        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-8 left-6 md:left-12 flex flex-col items-center gap-2 transition-opacity duration-300"
        style={{ opacity: scrollIndicatorOpacity }}
        aria-hidden="true"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground rotate-90 origin-bottom translate-y-6">Scroll</span>
        <div className="w-[1px] h-12 bg-border relative overflow-hidden mt-8">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-accent-primary animate-[scrollDown_2s_infinite]" />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}} />
    </section>
  );
}
