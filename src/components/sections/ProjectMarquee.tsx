"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface Project {
  name: string;
  category: string;
  year: string;
  image: string;
}

const PROJECTS: Project[] = [
  // ROW 1
  { name: "Space Voyage", category: "Web3 Platform", year: "2024", image: "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif" },
  { name: "CodeNest", category: "Dev Tools", year: "2024", image: "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif" },
  { name: "Vex Ventures", category: "Venture Capital", year: "2024", image: "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif" },
  { name: "Stellar AI v2", category: "Generative AI", year: "2024", image: "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif" },
  { name: "ASME Engineering", category: "Enterprise Web", year: "2023", image: "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif" },
  // ROW 2
  { name: "DesignPro", category: "Creative Agency", year: "2023", image: "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif" },
  { name: "Stellar AI", category: "MLops Dashboard", year: "2023", image: "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif" },
  { name: "XPortfolio", category: "Creator Portfolio", year: "2024", image: "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif" },
  { name: "Orbit Web3", category: "DeFi Protocol", year: "2024", image: "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif" },
  { name: "Nexora Cloud", category: "Cloud Security", year: "2024", image: "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif" },
];

const ROW_ONE = PROJECTS.slice(0, 5);
const ROW_TWO = PROJECTS.slice(5);

function MarqueeTile({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Use direct DOM mutation for mouse spotlight — avoids React state update on every mousemove
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--tile-mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--tile-mouse-y", `${e.clientY - rect.top}px`);
  };

  // Derive local MP4 path — GIFs decode on CPU, MP4 decodes on GPU
  const filename = project.image.split('/').pop()?.replace('.gif', '.mp4');
  const videoSrc = `/videos/${filename}`;

  return (
    <div
      ref={cardRef}
      className="project-marquee-card group relative h-[190px] w-[296px] shrink-0 overflow-hidden sm:h-[220px] sm:w-[340px] lg:h-[270px] lg:w-[420px]"
      onMouseMove={handleMouseMove}
    >
      {/* Decorative gradient mask overlays */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#07090f]/50 via-transparent to-white/4" />
      
      {/* Hover info overlay */}
      <div className="project-marquee-overlay">
        <h4 className="project-marquee-title">{project.name}</h4>
        <div className="project-marquee-meta">
          <span className="project-marquee-badge">{project.category}</span>
          <span className="project-marquee-year">{project.year}</span>
        </div>
      </div>

      <video
        src={videoSrc}
        loop
        muted
        playsInline
        preload="none"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
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

  // Master observer for all videos
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const videos = el.querySelectorAll("video");
        if (entry.isIntersecting) {
          videos.forEach((v) => v.play().catch(() => {}));
        } else {
          videos.forEach((v) => v.pause());
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
