/* eslint-disable */
"use client";

import "@/styles/testimonials.css";

import { useState, useRef, useEffect, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

/* ════════════════════════════════════════════════════════════
   Data
   ════════════════════════════════════════════════════════════ */
interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  metric: string;
  quote: string;
  avatar: string;
  brandColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "vercel",
    name: "Sarah Jenkins",
    role: "VP of Product",
    company: "Vercel",
    metric: "+180% Page Performance",
    quote: "Krado didn't just deliver a beautiful codebase — they completely re-engineered our core dashboard layout. The level of craft and performance obsession they bring is unmatched.",
    avatar: "/images/avatars/avatar-vercel.webp",
    brandColor: "rgba(255, 255, 255, 0.4)",
  },
  {
    id: "stripe",
    name: "Alexandre Arnault",
    role: "Lead Architect",
    company: "Stripe",
    metric: "99.999% Reliability",
    quote: "Their team integrated seamlessly into our payments infrastructure. They build elegant, modular code that runs flawlessly under peak transaction loads.",
    avatar: "/images/avatars/avatar-stripe.webp",
    brandColor: "rgba(99, 91, 255, 0.5)",
  },
  {
    id: "figma",
    name: "Diana Prince",
    role: "Design Lead",
    company: "Figma",
    metric: "100% Design Fidelity",
    quote: "Their design-to-code execution is flawless. What usually takes other agencies months, Krado shipped in weeks — without compromising a single pixel.",
    avatar: "/images/avatars/avatar-figma.webp",
    brandColor: "rgba(242, 78, 30, 0.5)",
  },
  {
    id: "linear",
    name: "Dr. Evelyn Chen",
    role: "Head of AI",
    company: "Linear",
    metric: "12x Inference Speed",
    quote: "Krado delivered an exceptionally clean data visualization system that makes our complex outputs intuitive. The engineering depth of their team is outstanding.",
    avatar: "/images/avatars/avatar-linear.webp",
    brandColor: "rgba(94, 106, 210, 0.5)",
  },
  {
    id: "hashicorp",
    name: "Marcus Vance",
    role: "Chief Information Officer",
    company: "HashiCorp",
    metric: "-42% Cloud Spend",
    quote: "We needed a team that could navigate enterprise compliance while moving at startup speed. Krado achieved the impossible — re-architecting our developer registry within weeks.",
    avatar: "/images/avatars/avatar-hashicorp.webp",
    brandColor: "rgba(255, 255, 255, 0.3)",
  },
  {
    id: "supabase",
    name: "Kenji Sato",
    role: "Director of Eng",
    company: "Supabase",
    metric: "0.2s Real-time Sync",
    quote: "The real-time database interfaces they built for us are phenomenal. They truly understand WebSockets, state synchronization, and reactive UI architecture.",
    avatar: "/images/avatars/avatar-supabase.webp",
    brandColor: "rgba(63, 207, 142, 0.5)",
  },
];

const AUTOPLAY_MS = 7000;
const FADE_MS = 350; // Must match CSS transition duration

/* ════════════════════════════════════════════════════════════
   Component
   ────────────────────────────────────────────────────────────
   Zero-jitter design:
   • No DecodeQuote / scramble (was the #1 jitter source)
   • No GSAP timeline for swaps — single CSS class toggle
   • Only opacity + translateY transitions (GPU-composited)
   • No DOM mutations during animation
   • Autoplay via CSS @keyframes progress bar (no JS interval)
   ════════════════════════════════════════════════════════════ */
export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const activeIndexRef = useRef(0);
  const isExitingRef = useRef(false); // Ref mirror — avoids useCallback dep on state
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

  /* ──────────────────────────────────────────────────────────
     Swap Logic — CSS class toggle (no GSAP timeline)
     ──────────────────────────────────────────────────────────
     1. Add .is-exiting class → CSS fades out (350ms)
     2. After fade completes → update React state
     3. Remove .is-exiting → CSS fades in (350ms)
     Zero DOM mutations during animation. Zero layout shifts.
     ────────────────────────────────────────────────────────── */
  const navigateTo = useCallback((newIndex: number) => {
    // Use ref to check exit state — avoids re-creating this callback on every transition
    if (isExitingRef.current) return;
    if (newIndex === activeIndexRef.current) return;
    if (newIndex < 0 || newIndex >= TESTIMONIALS.length) return;

    if (prefersReducedMotion) {
      setActiveIndex(newIndex);
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(circle, ${TESTIMONIALS[newIndex].brandColor} 0%, transparent 80%)`;
      }
      return;
    }

    // Phase 1: Fade out
    isExitingRef.current = true;
    setIsExiting(true);

    // Phase 2: After CSS transition ends, swap content + fade in
    setTimeout(() => {
      setActiveIndex(newIndex);
      isExitingRef.current = false;
      setIsExiting(false);
      // Update glow color
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(circle, ${TESTIMONIALS[newIndex].brandColor} 0%, transparent 80%)`;
      }
    }, FADE_MS);
  }, [prefersReducedMotion]); // Stable deps — no state dependency

  /* ──────────────────────────────────────────────────────────
     Navigation (resets autoplay)
     ────────────────────────────────────────────────────────── */
  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearTimeout(autoplayRef.current);

    // Restart progress bar animation by removing & re-adding class
    const fill = progressRef.current;
    if (fill) {
      fill.classList.remove("is-running");
      // Force reflow so the browser registers the removal before re-add
      void fill.offsetWidth;
      fill.classList.add("is-running");
    }

    autoplayRef.current = setTimeout(() => {
      const next = (activeIndexRef.current + 1) % TESTIMONIALS.length;
      navigateTo(next);
      resetAutoplay();
    }, AUTOPLAY_MS);
  }, [navigateTo]);

  const handleNext = useCallback(() => {
    const next = (activeIndexRef.current + 1) % TESTIMONIALS.length;
    navigateTo(next);
    resetAutoplay();
  }, [navigateTo, resetAutoplay]);

  const handlePrev = useCallback(() => {
    const prev = activeIndexRef.current === 0
      ? TESTIMONIALS.length - 1
      : activeIndexRef.current - 1;
    navigateTo(prev);
    resetAutoplay();
  }, [navigateTo, resetAutoplay]);

  /* ──────────────────────────────────────────────────────────
     Autoplay — start on mount
     ────────────────────────────────────────────────────────── */
  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [resetAutoplay]);

  /* ──────────────────────────────────────────────────────────
     Swipe — native pointer events, no drag library
     ────────────────────────────────────────────────────────── */
  const swipeRef = useRef<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    swipeRef.current = e.clientX;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (swipeRef.current === null) return;
    const diff = e.clientX - swipeRef.current;
    swipeRef.current = null;
    if (Math.abs(diff) < 60) return;
    if (diff < 0) handleNext(); else handlePrev();
  }, [handleNext, handlePrev]);

  /* ──────────────────────────────────────────────────────────
     Entrance Animation (ScrollTrigger, once: true)
     ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const tag = tagRef.current;
    const content = contentRef.current;
    const bottom = bottomRef.current;
    if (!section || !tag || !content || !bottom) return;

    const triggers: ScrollTrigger[] = [];
    const base = {
      trigger: section,
      toggleActions: "play none none none" as const,
      once: true,
    };

    const t1 = gsap.fromTo(tag,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { ...base, start: "top 85%" } }
    );
    if (t1.scrollTrigger) triggers.push(t1.scrollTrigger);

    const t2 = gsap.fromTo(content,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { ...base, start: "top 80%" } }
    );
    if (t2.scrollTrigger) triggers.push(t2.scrollTrigger);

    const t3 = gsap.fromTo(bottom,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { ...base, start: "top 75%" } }
    );
    if (t3.scrollTrigger) triggers.push(t3.scrollTrigger);

    return () => { triggers.forEach(st => st.kill()); };
  }, [prefersReducedMotion]);

  /* ── Derived ── */
  const t = TESTIMONIALS[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="testimonials-section"
      aria-label="Client Testimonials"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Background */}
      <div className="testimonials-bg" aria-hidden="true">
        <div className="scanline-grid opacity-[0.03]" />
        <div
          ref={glowRef}
          className="testimonials-glow"
          style={{
            background: `radial-gradient(circle, ${t.brandColor} 0%, transparent 80%)`,
          }}
        />
      </div>

      <div className="testimonials-container">
        {/* Section tag */}
        <span ref={tagRef} className="testimonials-tag">
          05 — Client Stories
        </span>

        {/* Quote content — single CSS transition, zero jitter */}
        <div
          ref={contentRef}
          className={`testimonials-content${isExiting ? " is-exiting" : ""}`}
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Quote */}
          <blockquote className="testimonials-quote">
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Accent line */}
          <hr className="testimonials-rule" />

          {/* Person */}
          <div className="testimonials-person">
            <div className="testimonials-avatar">
              <Image
                src={t.avatar}
                alt={t.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="testimonials-person-name">{t.name}</p>
              <p className="testimonials-person-role">
                {t.role}, {t.company}
              </p>
              <span className="testimonials-metric">{t.metric}</span>
            </div>
          </div>
        </div>

        {/* Bottom: progress + controls */}
        <div ref={bottomRef} className="testimonials-bottom">
          {/* Progress bar — pure CSS animation, zero JS */}
          <div className="testimonials-progress-track">
            <div
              ref={progressRef}
              className="testimonials-progress-fill is-running"
              key={activeIndex}
            />
          </div>

          {/* Controls */}
          <div className="testimonials-controls">
            <button
              className="testimonials-arrow"
              onClick={handlePrev}
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="arrow-left" />
            </button>

            <span className="testimonials-counter">
              <span className="testimonials-counter-active">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              {" / "}
              {String(TESTIMONIALS.length).padStart(2, "0")}
            </span>

            <button
              className="testimonials-arrow"
              onClick={handleNext}
              aria-label="Next testimonial"
            >
              <ArrowRight className="arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
