/* eslint-disable */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
// Skip evaluating callbacks for triggers whose elements are far offscreen
ScrollTrigger.config({ limitCallbacks: true });

/**
 * Expose the Lenis instance via context so other components
 * (e.g. DecodeIntro) can call lenis.stop() / lenis.start().
 */
const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion — skip smooth scroll entirely
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    // eslint-disable-next-line
    setLenisInstance(lenis);

    // Sync Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      // Skip RAF when Lenis is stopped (e.g., during DecodeIntro).
      // Saves ~60 useless calls/sec on mobile during intro.
      if (lenis.isStopped) return;
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    // Disable GSAP lag compensation — Lenis handles its own smoothing.
    // lagSmoothing(500, 33) was adding interpolation frames that fought Lenis easing.
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger positions AFTER intro completes — not during it.
    // During intro, body.overflow is "hidden" so measurements are wrong.
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const onIntroComplete = () => {
      // Wait 150ms for Framer Motion curtain exit + layout stabilization
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    window.addEventListener("krado:intro-complete", onIntroComplete, { once: true });
    // Fallback: if intro already played (session revisit), refresh after 800ms
    const fallbackTimer = setTimeout(() => {
      if (sessionStorage.getItem("krado-intro-seen")) {
        ScrollTrigger.refresh();
      }
    }, 800);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      clearTimeout(fallbackTimer);
      window.removeEventListener("krado:intro-complete", onIntroComplete);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
