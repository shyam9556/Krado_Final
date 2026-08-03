"use client";

import "@/styles/marquee.css";

import { useRef, useEffect, useCallback, memo } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Project {
  name: string;
  category: string;
  year: string;
  image: string;
}

const PROJECTS: Project[] = [
  // ROW 1
  { name: "Space Voyage", category: "Web3 Platform", year: "2024", image: "hero-space-voyage-preview-eECLH3Yc" },
  { name: "CodeNest", category: "Dev Tools", year: "2024", image: "hero-codenest-preview-Cgppc2qV" },
  { name: "Vex Ventures", category: "Venture Capital", year: "2024", image: "hero-vex-ventures-preview-BczMFIiw" },
  { name: "Stellar AI v2", category: "Generative AI", year: "2024", image: "hero-stellar-ai-v2-preview-DjvxjG3C" },
  { name: "ASME Engineering", category: "Enterprise Web", year: "2023", image: "hero-asme-preview-B_nGDnTP" },
  // ROW 2
  { name: "DesignPro", category: "Creative Agency", year: "2023", image: "hero-designpro-preview-D8c5_een" },
  { name: "Stellar AI", category: "MLops Dashboard", year: "2023", image: "hero-stellar-ai-preview-D3HL6bw1" },
  { name: "XPortfolio", category: "Creator Portfolio", year: "2024", image: "hero-xportfolio-preview-D4A8maiC" },
  { name: "Orbit Web3", category: "DeFi Protocol", year: "2024", image: "hero-orbit-web3-preview-BXt4OttD" },
  { name: "Nexora Cloud", category: "Cloud Security", year: "2024", image: "hero-nexora-preview-cx5HmUgo" },
];

const ROW_ONE = PROJECTS.slice(0, 5);
const ROW_TWO = PROJECTS.slice(5);

/* Shared timestamp — updated by ScrollTrigger onUpdate.
   MarqueeTile reads this to decide if we're actively scrolling.
   Using a module-level variable avoids prop drilling and ref objects. */
let _lastScrollTime = 0;
const SCROLL_IDLE_MS = 150;

function isActivelyScrolling(): boolean {
  return performance.now() - _lastScrollTime < SCROLL_IDLE_MS;
}

const MarqueeTile = memo(function MarqueeTile({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /* rAF gate — limits mousemove style updates to 1 per frame */
  const rafPending = useRef(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafPending.current) return;
    const x = e.clientX;
    const y = e.clientY;
    rafPending.current = true;
    requestAnimationFrame(() => {
      const card = cardRef.current;
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--tile-mouse-x", `${x - rect.left}px`);
        card.style.setProperty("--tile-mouse-y", `${y - rect.top}px`);
      }
      rafPending.current = false;
    });
  }, []);

  // Hover-to-play — blocked during scroll to prevent chain-reaction
  // video teardown+reload as the row slides under the cursor
  const handleMouseEnter = useCallback(() => {
    if (isActivelyScrolling()) return; // Block new video load during scroll
    const vid = videoRef.current;
    if (!vid) return;
    vid.src = videoSrc;
    vid.play().catch(() => {});
  }, []);

  // Pause + conditionally release — during scroll, only pause (cheap).
  // Full teardown (removeAttribute + load) only when NOT scrolling.
  const handleMouseLeave = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.pause(); // Always pause — ~0.1ms, no spike
    if (!isActivelyScrolling()) {
      // Full teardown only when not scrolling
      vid.removeAttribute("src");
      vid.load();
    }
  }, []);

  // Local asset paths — image field is the basename
  const videoSrc  = `/videos/${project.image}.mp4`;
  const posterSrc = `/images/posters/${project.image}.webp`;

  return (
    <div
      ref={cardRef}
      className="project-marquee-card group relative h-[190px] w-[296px] shrink-0 overflow-hidden sm:h-[220px] sm:w-[340px] lg:h-[270px] lg:w-[420px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Layer 1: WebP poster — always visible ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt={project.name}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />

      {/* ── Layer 2: MP4 video — no src at idle, set only on hover (zero overhead) ── */}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
      />

      {/* ── Layer 3: Decorative gradient overlay ── */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#07090f]/50 via-transparent to-white/4" />

      {/* ── Layer 4: Hover info overlay ── */}
      <div className="project-marquee-overlay">
        <h4 className="project-marquee-title">{project.name}</h4>
        <div className="project-marquee-meta">
          <span className="project-marquee-badge">{project.category}</span>
          <span className="project-marquee-year">{project.year}</span>
        </div>
      </div>
    </div>
  );
});

const MarqueeRow = memo(function MarqueeRow({
  projects,
  rowRef,
}: {
  projects: Project[];
  rowRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={rowRef} className="flex gap-4">
      {projects.map((project, index) => (
        <MarqueeTile
          key={`${project.name}-${index}`}
          project={project}
        />
      ))}
    </div>
  );
});

export function ProjectMarquee() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowOneRef = useRef<HTMLDivElement>(null);
  const rowTwoRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /* ── GSAP scroll-driven parallax ── */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const rowOne = rowOneRef.current;
    const rowTwo = rowTwoRef.current;
    if (!section || !rowOne || !rowTwo) return;

    /* Promote rows to GPU compositor layers */
    gsap.set([rowOne, rowTwo], { willChange: "transform" });

    const triggers: ScrollTrigger[] = [];

    // Row 1: slides right as user scrolls down
    const tween1 = gsap.fromTo(
      rowOne,
      { x: -220 },
      {
        x: 420,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          /* Record timestamp on each scroll frame — MarqueeTile
             checks this to decide if we're actively scrolling.
             Zero allocations, zero GC pressure. */
          onUpdate: () => {
            _lastScrollTime = performance.now();
          },
        },
      }
    );
    if (tween1.scrollTrigger) triggers.push(tween1.scrollTrigger);

    // Row 2: slides left as user scrolls down
    const tween2 = gsap.fromTo(
      rowTwo,
      { x: 220 },
      {
        x: -420,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
    if (tween2.scrollTrigger) triggers.push(tween2.scrollTrigger);

    return () => {
      triggers.forEach((st) => st.kill());
      gsap.set([rowOne, rowTwo], { willChange: "auto" });
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={sectionRef}
      id="project-marquee-showcase"
      className="relative overflow-hidden bg-[#07090f] pb-12 pt-24 text-[#d7e2ea] sm:pb-14 sm:pt-28 lg:pb-16 lg:pt-32 w-full"
      aria-label="Project showcase marquee"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="scanline-grid opacity-[0.04]" />
        <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(187,204,215,0.12),transparent_68%)]" />
        <div className="absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(96,110,128,0.14),transparent_70%)]" />
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeRow projects={ROW_ONE} rowRef={rowOneRef} />
        <MarqueeRow projects={ROW_TWO} rowRef={rowTwoRef} />
      </div>
    </div>
  );
}
