"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Magnetic } from "@/components/ui/Magnetic";
import { Code2, Compass, Gem, Rocket, type LucideIcon } from "lucide-react";
import { ProjectMarquee } from "./ProjectMarquee";
import dynamic from "next/dynamic";

// Dynamic import with ssr:false — prevents THREE.js from running during Next.js
// static page prerendering where WebGL / window / requestAnimationFrame don't exist.
const TorusKnotScene = dynamic(
  () => import("@/components/ui/TorusKnotScene").then((m) => ({ default: m.TorusKnotScene })),
  { ssr: false }
);



/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

interface ValueItem {
  icon: LucideIcon;
  title: string;
  description: string;
  span?: "tall" | "wide";
}

const VALUES: ValueItem[] = [
  {
    icon: Code2,
    title: "Engineering Obsession",
    description:
      "Every line of code is written for scale, not just shipping. We architect systems that grow with your ambitions — modular, tested, built to last.",
    span: "tall",
  },
  {
    icon: Compass,
    title: "Design Thinking",
    description:
      "We don't decorate — we solve problems through interfaces that convert and delight.",
  },
  {
    icon: Gem,
    title: "Relentless Craft",
    description:
      "No handoffs, no black boxes. Just transparent, obsessive quality in every pixel and deploy.",
  },
  {
    icon: Rocket,
    title: "Scale-First",
    description:
      "Built for 10x from day one, not patched together later. Infrastructure that doesn't flinch under pressure.",
    span: "wide",
  },
];

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { value: 50, suffix: "+", label: "Projects Shipped" },
  { value: 8, suffix: "+", label: "Years of Craft" },
  { value: 30, suffix: "+", label: "Technologies Mastered" },
  { value: 99, suffix: "%", label: "Client Retention" },
];

const TICKER_ITEMS = [
  "REACT",
  "NEXT.JS",
  "NODE.JS",
  "TYPESCRIPT",
  "AWS",
  "FIGMA",
  "PYTHON",
  "DOCKER",
  "KUBERNETES",
  "GRAPHQL",
  "POSTGRESQL",
  "REDIS",
  "TERRAFORM",
  "GO",
  "SWIFT",
  "FLUTTER",
];

/* ═══════════════════════════════════════════════════════════
   MANIFESTO LINE — Scramble/decode hover + tracking expand
   ═══════════════════════════════════════════════════════════ */

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%&!";

function ManifestoLine({
  text,
  accent,
}: {
  text: string;
  accent: boolean;
}) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iterRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseEnter = useCallback(() => {
    if (prefersReducedMotion) return;
    iterRef.current = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, i) => {
            if (char === " " || char === "'" || char === ".") return char;
            if (i < iterRef.current) return text[i];
            return SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
            ];
          })
          .join("")
      );

      iterRef.current += 1;

      if (iterRef.current >= text.length + 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
      }
    }, 25);
  }, [text, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span
      className={`about-manifesto__line ${
        accent ? "about-manifesto__accent" : ""
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   VALUE CARD — Glass card with 3D tilt, cursor spotlight,
   ghost index, and shimmer sweep
   ═══════════════════════════════════════════════════════════ */

function ValueCard({ value, index }: { value: ValueItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Direct DOM mutation — zero React state, zero re-renders on mousemove
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = y * -10;
      const tiltY = x * 10;
      cardRef.current.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      if (glowRef.current) {
        const gx = ((e.clientX - rect.left) / rect.width) * 100;
        const gy = ((e.clientY - rect.top) / rect.height) * 100;
        glowRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 85, 0, 0.1) 0%, transparent 55%)`;
        glowRef.current.style.opacity = "1";
      }
    },
    [prefersReducedMotion]
  );

  const handleMouseEnter = useCallback(() => {
    if (cardRef.current) cardRef.current.classList.add("is-hovered");
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.classList.remove("is-hovered");
    cardRef.current.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  }, []);

  const Icon = value.icon;
  const ghostIndex = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={cardRef}
      className="about-value-card"
      data-span={value.span || undefined}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ghost index number */}
      <span className="about-value-card__ghost-index" aria-hidden="true">
        {ghostIndex}
      </span>
      <div className="about-value-card__icon-wrap">
        <Icon
          size={28}
          strokeWidth={1.5}
          className="about-value-card__icon"
        />
      </div>
      <div className="about-value-card__content">
        <h3 className="about-value-card__title">{value.title}</h3>
        <p className="about-value-card__desc">{value.description}</p>
      </div>
      <span className="about-value-card__arrow" aria-hidden="true">
        ↗
      </span>
      {/* Cursor-following spotlight — opacity toggled via direct DOM, no React re-render */}
      <div
        ref={glowRef}
        className="about-value-card__glow"
        aria-hidden="true"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED STAT — GSAP counter with overshoot (ref-based flag)
   ═══════════════════════════════════════════════════════════ */

function AnimatedStat({
  stat,
  index,
}: {
  stat: StatItem;
  index: number;
}) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    const numEl = numberRef.current;
    if (!el || !numEl) return;

    if (prefersReducedMotion) {
      numEl.textContent = `${stat.value}${stat.suffix}`;
      return;
    }

    // Safety for hot-reloads — if already animated, show final value
    if (hasAnimatedRef.current) {
      numEl.textContent = `${stat.value}${stat.suffix}`;
      return;
    }

    const counter = { val: 0 };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => {
        hasAnimatedRef.current = true;

        gsap.to(counter, {
          val: stat.value,
          duration: 2,
          delay: index * 0.15,
          ease: "back.out(1.7)",
          onUpdate: () => {
            numEl.textContent = `${Math.round(counter.val)}${stat.suffix}`;
          },
          onComplete: () => {
            numEl.textContent = `${stat.value}${stat.suffix}`;
          },
        });
      },
    });

    return () => {
      st.kill();
    };
  }, [stat, index, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="about-stat">
      <span className="about-stat__accent-dot" aria-hidden="true" />
      <span ref={numberRef} className="about-stat__number">
        {prefersReducedMotion
          ? `${stat.value}${stat.suffix}`
          : `0${stat.suffix}`}
      </span>
      <span className="about-stat__label">{stat.label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MARQUEE TICKER — Infinite horizontal scroll
   ═══════════════════════════════════════════════════════════ */

function MarqueeTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="about-marquee" aria-hidden="true">
      {/* Primary track — left-scrolling */}
      <div className="about-marquee__track">
        {items.map((item, i) => (
          <span key={`a-${i}`} className="about-marquee__item">
            <span className="about-marquee__dot">◆</span>
            {item}
          </span>
        ))}
      </div>
      {/* Secondary track — right-scrolling, offset */}
      <div className="about-marquee__track about-marquee__track--reverse">
        {items.map((item, i) => (
          <span key={`b-${i}`} className="about-marquee__item">
            <span className="about-marquee__dot">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN ABOUT SECTION — Three-Zone Cinematic Layout
   ═══════════════════════════════════════════════════════════ */

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const valuesTagRef = useRef<HTMLSpanElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /* ── Mouse-tilt parallax for manifesto headline ── */
  const springConfig = { damping: 40, stiffness: 120, mass: 0.8 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  const translateX = useTransform(mouseX, [-1, 1], [-12, 12]);
  const translateY = useTransform(mouseY, [-1, 1], [-8, 8]);

  /* ── rAF-throttled section mouse move — prevents spring updates on every scroll tick ── */
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion || !sectionRef.current) return;
      // Cancel any pending frame so we only process the latest position
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const clientX = e.clientX;
      const clientY = e.clientY;
      rafRef.current = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((clientY - rect.top) / rect.height) * 2 - 1;
        mouseX.set(x);
        mouseY.set(y);
        rafRef.current = null;
      });
    },
    [prefersReducedMotion, mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  /* ── GSAP scroll entrance animations ── */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const heading = headingRef.current;
    const manifesto = manifestoRef.current;
    const body = bodyRef.current;
    const values = valuesRef.current;
    const valuesTag = valuesTagRef.current;
    const stats = statsRef.current;
    if (!section || !heading) return;

    // Heading entrance
    gsap.fromTo(
      heading,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    // Manifesto lines — staggered reveal with slight 3D rotation
    if (manifesto) {
      const lines = manifesto.querySelectorAll(".about-manifesto__line");
      gsap.fromTo(
        lines,
        { y: 80, opacity: 0, rotateX: 12 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: manifesto,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Body text entrance
    if (body) {
      gsap.fromTo(
        body,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: body,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Values tag entrance
    if (valuesTag) {
      gsap.fromTo(
        valuesTag,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: valuesTag,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Value cards — staggered domino entrance with tilt
    if (values) {
      const cards = values.querySelectorAll(".about-value-card");
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0, rotateX: 6 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: values,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Stats entrance — staggered
    if (stats) {
      const statEls = stats.querySelectorAll(".about-stat");
      gsap.fromTo(
        statEls,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stats,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Horizontal rule animation
    const rule = section.querySelector(".about-divider-line");
    if (rule) {
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: rule,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    const timer = setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((st) => {
        if (
          st.trigger === section ||
          st.trigger === manifesto ||
          st.trigger === body ||
          st.trigger === stats ||
          st.trigger === rule ||
          st.trigger === values ||
          st.trigger === valuesTag
        ) {
          st.kill();
        }
      });
    };
  }, [prefersReducedMotion]);

  /* ── Manifesto lines ── */
  const manifestoLines = [
    { text: "WE DON'T BUILD", accent: false },
    { text: "TEMPLATES.", accent: false },
    { text: "WE BUILD", accent: false },
    { text: "LEVERAGE.", accent: true },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-section dark"
      aria-label="About Us"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Background textures ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="scanline-grid opacity-[0.04]" />

        <div
          className="about-glow-orb about-glow-orb--top"
          style={{
            background:
              "radial-gradient(circle, rgba(255,85,0,0.06) 0%, transparent 55%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="about-glow-orb about-glow-orb--bottom"
          style={{
            background:
              "radial-gradient(circle, rgba(255,85,0,0.04) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* ── Vertical decorative label — mirrors Hero & Services ── */}
      <div className="about-vertical-label" aria-hidden="true">
        03 — About & Philosophy
      </div>

      <div className="about-container">
        {/* ═══════ ZONE 1: MANIFESTO ═══════ */}
        <div className="about-manifesto-zone">
          {/* Section tag */}
          <div ref={headingRef}>
            <span className="about-tag">03 — Who We Are</span>
          </div>

          {/* Divider line */}
          <div
            className="about-divider-line"
            aria-hidden="true"
            style={{ transformOrigin: "left" }}
          />

          {/* Three.js torus knot — GPU, zero main-thread math, desktop only */}
          {!prefersReducedMotion && <TorusKnotScene />}

          {/* Manifesto headline with mouse parallax + scramble hover */}
          <motion.div
            ref={manifestoRef}
            className="about-manifesto"
            style={{
              x: translateX,
              y: translateY,
            }}
          >
            {manifestoLines.map((line, i) => (
              <ManifestoLine
                key={i}
                text={line.text}
                accent={line.accent}
              />
            ))}
          </motion.div>

          {/* Body text */}
          <div ref={bodyRef} className="about-manifesto-body">
            <p>
              We&apos;re engineers, designers, and product thinkers who embed
              with your team to build software that moves the needle — from
              seed-stage MVPs to enterprise-grade platforms. Every line of code
              ships with one question:{" "}
              <em>does this create leverage?</em>
            </p>
          </div>
        </div>

        {/* ═══════ ZONE 2: VALUES (BENTO GRID) ═══════ */}
        <div className="about-values-zone">
          <span ref={valuesTagRef} className="about-values-tag">
            Our DNA
          </span>
          <div ref={valuesRef} className="about-value-grid">
            {VALUES.map((value, i) => (
              <ValueCard key={value.title} value={value} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ PROJECT SHOWCASE MARQUEE ═══════ */}
      <ProjectMarquee />

      <div className="about-container">
        {/* ═══════ ZONE 3: PROOF ═══════ */}
        <div className="about-proof-zone">
          {/* Stats row */}
          <div ref={statsRef} className="about-stats">
            {STATS.map((stat, i) => (
              <AnimatedStat key={stat.label} stat={stat} index={i} />
            ))}
          </div>

          {/* Marquee ticker */}
          <MarqueeTicker />

          {/* CTA */}
          <div className="about-cta">
            <Magnetic strength={0.25}>
              <a href="#contact" className="about-cta__button group">
                <div className="about-cta__sweep" />
                <span className="about-cta__text">Start Your Project</span>
                <span className="about-cta__arrow">→</span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
