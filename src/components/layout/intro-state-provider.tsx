"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

const INTRO_SESSION_KEY = "krado-intro-seen";

interface IntroState {
  /** True once the DecodeIntro overlay has finished and exited */
  introComplete: boolean;
}

const IntroStateContext = createContext<IntroState>({ introComplete: false });

/**
 * Read the shared intro-completion state.
 * Returns `{ introComplete }` — true once DecodeIntro has exited
 * (or immediately on repeat visits where the session key already exists).
 */
export function useIntroState(): IntroState {
  return useContext(IntroStateContext);
}

/**
 * Wraps DecodeIntro, Navbar, and page content. Provides a single
 * `introComplete` boolean via context so consumers don't need to
 * independently poll sessionStorage.
 */
export function IntroStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [introComplete, setIntroComplete] = useState(false);

  /* ── Returning visitors: check BEFORE paint ──
     useLayoutEffect fires synchronously after DOM mutation but BEFORE
     the browser paints. This ensures introComplete=true is set before
     the first visual frame — no flash of hidden hero content. */
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(INTRO_SESSION_KEY)) {
        setIntroComplete(true);
      }
    } catch {
      setIntroComplete(true);
    }
  }, []);

  /* ── First-time visitors: listen for intro completion event ── */
  useEffect(() => {
    if (introComplete) return; // Already done (returning visitor)
    const handler = () => setIntroComplete(true);
    window.addEventListener("krado:intro-complete", handler);
    return () => window.removeEventListener("krado:intro-complete", handler);
  }, [introComplete]);

  return (
    <IntroStateContext.Provider value={{ introComplete }}>
      {children}
    </IntroStateContext.Provider>
  );
}
