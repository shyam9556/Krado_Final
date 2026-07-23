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
    // Poll until DecodeIntro finishes and sets the session key.
    // We intentionally do NOT check the key synchronously on mount
    // because DecodeIntro clears the key on its own mount to replay
    // every refresh — a synchronous check could hit a stale value
    // before the clear runs.
    const interval = setInterval(() => {
      try {
        if (sessionStorage.getItem(INTRO_SESSION_KEY)) {
          setIntroComplete(true);
          clearInterval(interval);
        }
      } catch {
        setIntroComplete(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <IntroStateContext.Provider value={{ introComplete }}>
      {children}
    </IntroStateContext.Provider>
  );
}
