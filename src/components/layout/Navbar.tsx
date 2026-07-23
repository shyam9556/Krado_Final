/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/layout/smooth-scroll-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/MobileNav";
import { useIntroState } from "@/components/layout/intro-state-provider";
import { Magnetic } from "@/components/ui/Magnetic";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_BG_THRESHOLD = 60;
const SCROLL_HIDE_THRESHOLD = 200;

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Our Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
] as const;

const SECTION_IDS = ["home", "services", "work", "about", "testimonials", "contact"];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();
  const { introComplete } = useIntroState();

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // eslint-disable-next-line
    if (introComplete) setVisible(true);
  }, [mounted, introComplete]);

  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => {
      const scrollPos = lenis.scroll;
      const dir = lenis.direction;

      setScrolled((prev) => {
        const next = scrollPos > SCROLL_BG_THRESHOLD;
        return prev === next ? prev : next;
      });

      setHidden((prev) => {
        const next = dir === 1 && scrollPos > SCROLL_HIDE_THRESHOLD;
        return prev === next ? prev : next;
      });
    };

    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  useEffect(() => {
    if (!mounted) return;
    const triggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActiveSection(id);
          },
        });
        triggers.push(trigger);
      });
    }, 600);

    // The Work section is GSAP-pinned — its effective scroll distance is
    // much larger than the DOM element height. Listen for a custom event
    // that Work.tsx dispatches via onEnter/onLeave ScrollTrigger callbacks.
    const onWorkEvent = (e: Event) => {
      const sectionId = (e as CustomEvent<string>).detail;
      if (sectionId) setActiveSection(sectionId);
    };
    window.addEventListener("krado:section", onWorkEvent);

    return () => {
      clearTimeout(timer);
      triggers.forEach((t) => t.kill());
      window.removeEventListener("krado:section", onWorkEvent);
    };
  }, [mounted]);

  const openMobile = useCallback(() => {
    setMobileOpen(true);
    lenis?.stop();
    document.body.style.overflow = "hidden";
  }, [lenis]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    lenis?.start();
    document.body.style.overflow = "";
    setTimeout(() => hamburgerRef.current?.focus(), 60);
  }, [lenis]);

  if (!mounted) return null;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: hidden && visible ? "-100%" : "0%",
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
        className="navbar-root"
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <div
          className="navbar-glass transition-colors duration-500 ease-out"
          style={{ 
            opacity: scrolled ? 1 : 0,
            background: "var(--surface-glass)",
            boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.06)",
            borderBottom: "none"
          }}
          aria-hidden="true"
        />

        <nav className="navbar-content py-4 px-6 md:px-8" aria-label="Main navigation">
          {/* Editorial Logo */}
          <Magnetic strength={0.15}>
            <a
              href="#home"
              className="group relative flex items-center gap-3 text-lg font-bold tracking-widest text-foreground font-mono"
              aria-label="Krado — Back to top"
            >
              <span className="w-1 h-4 bg-accent-primary transform scale-y-50 origin-bottom transition-transform duration-300 group-hover:scale-y-100" />
              KRADO
            </a>
          </Magnetic>

          {/* Desktop nav links with Sliding Pill */}
          <div className="hidden lg:flex items-center gap-1 relative">
            {NAV_LINKS.map((link) => {
              const isActive = `#${activeSection}` === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`group relative px-4 py-2 text-sm font-medium overflow-hidden z-10 ${
                    isActive ? "text-background" : "text-muted-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-foreground rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {isActive ? (
                    <span>{link.label}</span>
                  ) : (
                    <span className="relative flex flex-col items-center">
                      <span className="transition-transform duration-300 ease-[0.76,0,0.24,1] group-hover:-translate-y-[120%]">{link.label}</span>
                      <span className="absolute top-0 left-0 transition-transform duration-300 ease-[0.76,0,0.24,1] translate-y-[120%] group-hover:translate-y-0 text-foreground">{link.label}</span>
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <Magnetic strength={0.25}>
              <a 
                href="#contact" 
                className="hidden md:flex items-center gap-2 group relative overflow-hidden bg-transparent border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-accent-primary"
                style={{ borderRadius: "2px" }} // Sharp corners
              >
                <div className="absolute inset-0 bg-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute left-0 bottom-0 w-full h-[2px] bg-accent-primary transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
                <span className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1">Start a Project</span>
                <span className="relative z-10 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 ease-out text-accent-primary">→</span>
              </a>
            </Magnetic>

            <ThemeToggle />

            <button
              ref={hamburgerRef}
              type="button"
              className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 z-[60]"
              onClick={mobileOpen ? closeMobile : openMobile}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <motion.span 
                animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 8 : 0 }}
                className="w-6 h-px bg-foreground block transition-transform"
              />
              <motion.span 
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                className="w-6 h-px bg-foreground block transition-opacity"
              />
              <motion.span 
                animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -8 : 0 }}
                className="w-6 h-px bg-foreground block transition-transform"
              />
            </button>
          </div>
        </nav>
      </motion.header>

      <MobileNav
        isOpen={mobileOpen}
        onClose={closeMobile}
        links={NAV_LINKS}
        activeSection={activeSection}
      />
    </>
  );
}
