"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    // One-time check for returning visitors (session key already set)
    try {
      if (sessionStorage.getItem(INTRO_SESSION_KEY)) {
        setIntroComplete(true);
        return;
      }
    } catch {
      setIntroComplete(true);
      return;
    }

    // Listen for DecodeIntro's completion event — replaces 100ms polling
    const handler = () => setIntroComplete(true);
    window.addEventListener("krado:intro-complete", handler);
    return () => window.removeEventListener("krado:intro-complete", handler);
  }, []);

  return (
    <IntroStateContext.Provider value={{ introComplete }}>
      {children}
    </IntroStateContext.Provider>
  );
}
