"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

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

function MarqueeTile({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Direct DOM mutation for mouse spotlight — zero re-renders
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--tile-mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--tile-mouse-y", `${e.clientY - rect.top}px`);
  };

  // Hover-to-play — set src + play only for THIS card (max 1 GPU decoder)
  const handleMouseEnter = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.src = videoSrc;
    vid.play().catch(() => {});
  };

  // Pause + fully release — removes src to free all browser resources
  const handleMouseLeave = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.pause();
    vid.removeAttribute("src");
    vid.load();
  };

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
      {/* ── Layer 1: WebP poster + Ken Burns — always visible, feels alive ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt={project.name}
        className="absolute inset-0 h-full w-full object-cover project-marquee-ken-burns"
        loading="lazy"
        decoding="async"
      />

      {/* ── Layer 2: MP4 video — no src at idle, set only on hover (zero overhead) ── */}
      <video
        ref={videoRef}
        poster={posterSrc}
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
}

function MarqueeRow({
  projects,
  x,
}: {
  projects: Project[];
  x: MotionValue<number>;
}) {
  const repeated = [...projects];

  return (
    <motion.div className="flex gap-4 will-change-transform" style={{ x }}>
      {repeated.map((project, index) => (
        <MarqueeTile
          key={`${project.name}-${index}`}
          project={project}
        />
      ))}
    </motion.div>
  );
}

export function ProjectMarquee() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rowOneX = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-220, 420]);
  const rowTwoX = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [220, -420]);


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
        <MarqueeRow projects={ROW_ONE} x={rowOneX} />
        <MarqueeRow projects={ROW_TWO} x={rowTwoX} />
      </div>
    </div>
  );
}
