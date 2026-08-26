/* eslint-disable */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

    // Fix #2: Disable browser scroll restoration and start from top.
    // Animated single-page sites must always begin from the top so GSAP
    // ScrollTrigger positions are measured correctly.
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
      anchors: true,
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

    // Refresh ScrollTrigger positions AFTER intro completes — not during it.
    // During intro, body.overflow is "hidden" so measurements are wrong.
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    // Deep link helper — reads from the global set by the inline script
    // in layout.tsx (which strips the hash to prevent browser auto-scroll)
    const handleDeepLink = () => {
      const hash = (window as any).__kradoDeepLink as string | undefined;
      if (hash) {
        const target = document.querySelector<HTMLElement>(hash);
        if (target) {
          lenis.scrollTo(target, { offset: -80, duration: 1.2 });
        }
        delete (window as any).__kradoDeepLink;
      }
    };

    const onIntroComplete = () => {
      // Wait 150ms for Framer Motion curtain exit + layout stabilization
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
        handleDeepLink();
      }, 150);
    };
    window.addEventListener("krado:intro-complete", onIntroComplete, { once: true });
    // Fallback: if intro already played (session revisit), refresh after 800ms
    const fallbackTimer = setTimeout(() => {
      if (sessionStorage.getItem("krado-intro-seen")) {
        ScrollTrigger.refresh();
        handleDeepLink();
      }
    }, 800);

    // Fix #5: Re-sync Lenis ↔ ScrollTrigger when tab wakes from sleep.
    // Browsers throttle requestAnimationFrame to 0 fps when tab is hidden,
    // causing Lenis's internal scroll position to drift from reality.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      clearTimeout(fallbackTimer);
      window.removeEventListener("krado:intro-complete", onIntroComplete);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
