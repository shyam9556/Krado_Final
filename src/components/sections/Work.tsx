"use client";

import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/* No longer using decodeLetters per user request */


/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */
interface Project {
  id: string; index: string; name: string;
  description: string; tags: string[];
  image: string; imageAlt: string; year: string; category: string;
  url?: string;
  imageTall?: string;
  videoTour?: boolean;
  videoUrl?: string;
  mockupType?: "laptop" | "desktop";
}

const PROJECTS: Project[] = [
  { id: "highlight", index: "01", name: "HIGHLIGHT RENEWABLE",
    description: "Innovative Renewable Energy Solutions for a Greener Tomorrow. Harness the power of Wind, Solar, and Storage.",
    tags: ["Next.js", "React", "Node.js", "MongoDB", "AWS"],
    image: "/highlight-real.webp", imageTall: "/highlight-tall-v2.webp", videoTour: true, mockupType: "laptop", imageAlt: "Highlight Renewable energy website", year: "2024", category: "Cleantech Platform", url: "https://highlightrenewable.com" },
  { id: "orbit", index: "02", name: "ORBIT",
    description: "Mobile-first commerce experience with real-time inventory intelligence.",
    tags: ["Next.js", "TypeScript", "Stripe", "Prisma", "Vercel"],
    image: "/work-02.webp", imageAlt: "Orbit ecommerce mobile app", year: "2024", category: "E-Commerce" },
  { id: "jivraj", index: "03", name: "JIVRAJ CAPITAL",
    description: "Premium investment capital and wealth management dashboard.",
    tags: ["React", "TypeScript", "Python", "Docker", "PostgreSQL"],
    image: "/jivraj-tall.webp", videoUrl: "/JivrajCapital.mp4", videoTour: true, mockupType: "desktop", imageAlt: "Jivraj Capital financial dashboard", year: "2024", category: "Finance & Investment", url: "https://jivrajcapital.com" },
  { id: "hrpl", index: "04", name: "HRPL PRO",
    description: "Data-rich enterprise-scale full ERP system and operations dashboard.",
    tags: ["Vue.js", "Django", "GraphQL", "Redis", "Kubernetes"],
    image: "/work-hrpl.webp", videoUrl: "/HRPL.mp4", videoTour: true, mockupType: "desktop", imageAlt: "HRPL Pro enterprise ERP system", year: "2023", category: "Enterprise ERP" },
];

const TOTAL_PANELS = PROJECTS.length + 1; // 4 projects + 1 closing

/* Simple Icons slug map — used for tag tooltips + floating icons */
const TECH_ICONS: Record<string, string> = {
  "React":      "react",
  "Node.js":    "nodedotjs",
  "PostgreSQL": "postgresql",
  "Redis":      "redis",
  "AWS":        "https://unpkg.com/simple-icons@v11/icons/amazonaws.svg",
  "Firebase":   "firebase",
  "Next.js":    "nextdotjs",
  "TypeScript": "typescript",
  "Stripe":     "stripe",
  "Prisma":     "prisma",
  "Vercel":     "vercel",
  "Vue.js":     "vuedotjs",
  "Python":     "python",
  "Django":     "django",
  "WebSockets": "socketdotio",
  "Docker":     "docker",
  "PyTorch":    "pytorch",
  "GraphQL":    "graphql",
  "Kubernetes": "kubernetes",
  "MongoDB":    "mongodb",
  "Express":    "express",
};

/* Positions for 3 floating icons per panel */
const FLOAT_SLOTS = [
  { top: "18%",  left: "68%", size: 52, dur: 4.2,  delay: 0    },
  { top: "60%",  left: "78%", size: 38, dur: 5.8,  delay: 1.4  },
  { top: "75%",  left: "58%", size: 32, dur: 3.6,  delay: 0.8  },
];


/* ════════════════════════════════════════════════════════════
   FLOATING TECH ICONS — drift in the dark background
   ════════════════════════════════════════════════════════════ */
function FloatingTechIcons({ tags }: { tags: string[] }) {
  return (
    <div className="work-floating-icons" aria-hidden="true">
      {tags.slice(0, 3).map((tag, i) => {
        const mapped = TECH_ICONS[tag] ?? tag.toLowerCase().replace(/[^a-z0-9]/g, "");
        const maskUrl = mapped.startsWith("http") ? mapped : `https://cdn.simpleicons.org/${mapped}`;
        const slot = FLOAT_SLOTS[i];
        return (
          <div
            key={tag}
            className="work-float-icon" /* GSAP animates this (mouse parallax) */
            data-fi={i}
            style={{
              top: slot.top,
              left: slot.left,
            } as React.CSSProperties}
          >
            <div 
              className="work-float-icon-inner" /* CSS keyframe animates this (up/down) */
              style={{
                "--fi-dur":   `${slot.dur}s`,
                "--fi-delay": `${slot.delay}s`,
              } as React.CSSProperties}
            >
              {/* fallback if mask fails */}
              <div
                className="absolute inset-0 bg-white"
                style={{ 
                  maskImage: `url(${maskUrl})`, 
                  WebkitMaskImage: `url(${maskUrl})` 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PANEL MESH & GLOW BACKGROUND — 3D perspective grid + mouse spotlight
   ════════════════════════════════════════════════════════════ */
function PanelMeshBg() {
  return (
    <>
      <div className="work-panel-mesh" aria-hidden="true" />
      <div className="work-panel-glow" aria-hidden="true" />
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   LAPTOP MOCKUP (FOR VIDEO TOURS)
   ════════════════════════════════════════════════════════════ */
function LaptopMockup({ tallImage, shortImage, videoUrl, isVideo, priority }: { tallImage?: string, shortImage: string, videoUrl?: string, isVideo?: boolean, priority?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      },
      { rootMargin: "100px" }
    );
    observer.observe(vid);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto drop-shadow-2xl work-panel-image group transition-transform duration-700 hover:scale-[1.02]">
      {/* Laptop Screen / Lid */}
      <div className="relative bg-[#0d0d0f] rounded-t-xl md:rounded-t-3xl rounded-b-sm p-1.5 md:p-3 lg:p-4 border border-[#2a2a2d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        {/* Camera Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 md:w-20 h-3 md:h-4 bg-[#0d0d0f] rounded-b-lg z-20 flex justify-center items-center shadow-sm">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#111122] border border-[#222]" />
        </div>
        
        {/* Screen Content */}
        <div className="relative bg-black rounded-[4px] md:rounded-md overflow-hidden aspect-[16/10] w-full work-laptop-screen">
          {videoUrl ? (
            <video ref={videoRef} src={videoUrl} loop muted playsInline preload="metadata" poster={shortImage} className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-500 pointer-events-none" />
          ) : (
            <div className={`w-full absolute inset-x-0 top-0 ${isVideo ? 'animate-website-scroll' : ''}`}>
               <Image src={isVideo ? tallImage! : shortImage} alt="Website Tour" width={1920} height={4000} sizes="(max-width: 1024px) 100vw, 1024px" quality={75} className="w-full h-auto object-cover group-hover:brightness-75 transition-all duration-500" priority={priority} loading={priority ? "eager" : "lazy"} />
            </div>
          )}
          {/* Glossy Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        </div>
      </div>
      
      {/* Laptop Base / Keyboard deck edge */}
      <div className="relative h-2 md:h-4 bg-gradient-to-b from-[#a4a4a8] to-[#5d5d61] rounded-b-[10px] md:rounded-b-2xl rounded-t-sm -mx-1 md:-mx-4 shadow-2xl flex justify-center border-t border-[#c4c4c8]">
         {/* Trackpad notch */}
         <div className="w-1/5 h-[2px] md:h-1.5 bg-[#8b8b8f] rounded-b-md mx-auto shadow-inner" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DESKTOP MONITOR MOCKUP (FOR DASHBOARDS)
   ════════════════════════════════════════════════════════════ */
function DesktopMonitorMockup({ videoUrl, shortImage, priority }: { videoUrl?: string, shortImage?: string, priority?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      },
      { rootMargin: "100px" }
    );
    observer.observe(vid);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto drop-shadow-2xl work-panel-image group transition-transform duration-700 hover:scale-[1.02] flex flex-col items-center mt-2 md:mt-4">
      {/* Monitor Display / Frame */}
      <div className="relative bg-[#0d0d0f] rounded-xl md:rounded-2xl p-1.5 md:p-3 lg:p-4 border border-[#2a2a2d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_25px_50px_rgba(0,0,0,0.5)] w-full z-10">
        {/* Screen Content */}
        <div className="relative bg-black rounded-[4px] md:rounded-lg overflow-hidden aspect-[16/9] w-full">
          {videoUrl ? (
            <video ref={videoRef} src={videoUrl} loop muted playsInline preload="metadata" poster={shortImage} className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-500 pointer-events-none" />
          ) : (
            <Image src={shortImage!} alt="Dashboard Tour" fill sizes="(max-width: 1024px) 100vw, 1024px" quality={75} className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-500" priority={priority} />
          )}
          {/* Subtle Screen Bezel Inner Shadow */}
          <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] pointer-events-none" />
          {/* Glossy Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        </div>
      </div>
      
      {/* Monitor Stand */}
      <div className="relative w-16 md:w-24 h-6 md:h-10 bg-gradient-to-b from-[#1a1a1d] to-[#0a0a0c] -mt-1 z-0 flex flex-col items-center justify-end shadow-xl border-x border-[#222]">
         {/* Stand Base */}
         <div className="absolute -bottom-2 md:-bottom-3 w-32 md:w-48 h-2 md:h-3 bg-gradient-to-t from-[#2a2a2d] to-[#1a1a1d] rounded-t-xl md:rounded-t-2xl shadow-2xl border-t border-[#3a3a3d]" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MOBILE CARD
   ════════════════════════════════════════════════════════════ */
function MobileProjectCard({ project, idx }: { project: Project; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(el, { opacity: 1 }); return; }
    gsap.fromTo(el, { opacity: 0, y: 60 }, {
      opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
    });
    const tags = el.querySelectorAll(".work-tag-chip");
    if (tags.length) gsap.fromTo(tags, { opacity: 0, x: -8 }, {
      opacity: 1, x: 0, stagger: 0.07, duration: 0.4, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none none" },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="work-mobile-card" style={{ opacity: 0 }} aria-label={`Project ${project.name}`}>
      <span className="work-mobile-ghost-index" aria-hidden="true">{project.index}</span>
      
      {project.url ? (
        <a href={project.url} target="_blank" rel="noopener noreferrer" className="work-mobile-image-wrap block group relative overflow-visible">
          
          {/* Simulated Video Tour Indicator */}
          {project.videoTour && (
            <div className="absolute -top-3 -left-2 z-20 flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-white/90 text-[9px] font-mono uppercase tracking-widest font-semibold mt-[1px]">Live</span>
            </div>
          )}

          {project.videoTour ? (
            project.mockupType === "desktop" ? (
               <DesktopMonitorMockup videoUrl={project.videoUrl} shortImage={project.image} />
            ) : (
               <LaptopMockup isVideo={project.videoTour} tallImage={project.imageTall} shortImage={project.image} videoUrl={project.videoUrl} />
            )
          ) : (
            <>
              <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" quality={75} className="work-mobile-image group-hover:scale-105 group-hover:brightness-75 transition-all duration-700" priority={idx === 0} />
              <div className="work-mobile-image-overlay pointer-events-none" />
            </>
          )}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
            <span className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs uppercase tracking-wider rounded-full flex items-center gap-2">
              Visit Site
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </span>
          </div>
        </a>
      ) : (
        <div className="work-mobile-image-wrap overflow-visible">
          {project.videoTour && (
            <div className="absolute -top-3 -left-2 z-20 flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-white/90 text-[9px] font-mono uppercase tracking-widest font-semibold mt-[1px]">Live Tour</span>
            </div>
          )}
          {project.videoTour ? (
            project.mockupType === "desktop" ? (
               <DesktopMonitorMockup videoUrl={project.videoUrl} shortImage={project.image} />
            ) : (
               <LaptopMockup isVideo={project.videoTour} tallImage={project.imageTall} shortImage={project.image} videoUrl={project.videoUrl} />
            )
          ) : (
            <>
              <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" quality={75} className="work-mobile-image" priority={idx === 0} />
              <div className="work-mobile-image-overlay pointer-events-none" />
            </>
          )}
        </div>
      )}

      <div className="work-mobile-content">
        <div className="work-mobile-meta">
          <span className="work-mobile-category">{project.category}</span>
          <span className="work-mobile-year">{project.year}</span>
        </div>
        <h3 className="work-mobile-name pr-2">{project.name}</h3>
        <p className="work-mobile-desc">{project.description}</p>
        <div className="work-mobile-tags" role="list">
          {project.tags.map(tag => {
            const mapped = TECH_ICONS[tag] ?? tag.toLowerCase().replace(/[^a-z0-9]/g, "");
            const maskUrl = mapped.startsWith("http") ? mapped : `https://cdn.simpleicons.org/${mapped}`;
            return (
              <span key={tag} className="work-tag-chip" role="listitem" title={tag}>
                <span className="work-tag-inner">
                  <span 
                    className="work-tag-icon" 
                    style={{ maskImage: `url(${maskUrl})`, WebkitMaskImage: `url(${maskUrl})` }} 
                  />
                  {tag}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevActiveRef = useRef(-1);

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ════════════════════════════════════════════════════════════
     DESKTOP HORIZONTAL SCROLL
     ════════════════════════════════════════════════════════════ */
  useGSAP(() => {
    if (isMobile) return;
    const section = sectionRef.current;
    const fill = progressFillRef.current;
    if (!section) return;

    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const allPanels = gsap.utils.toArray<HTMLElement>(".work-panel");
    const projectPanels = gsap.utils.toArray<HTMLElement>(".work-project-panel");
    if (!allPanels.length) return;

    const N = allPanels.length; // 5

    /* Core tween: animate ALL panels' xPercent simultaneously.
       At snap point k/(N-1), panel k sits at x=0 (the visible viewport). */
    gsap.to(allPanels, {
      xPercent: -100 * (N - 1),
      ease: "none",
      scrollTrigger: {
        id: "work-pin",
        trigger: section,
        pin: true,
        scrub: 1.5,
        start: "top top",
        end: () => `+=${window.innerWidth * (N - 1)}`,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        snap: {
          snapTo: 1 / (N - 1),
          duration: { min: 0.35, max: 0.65 },
          ease: "power2.inOut",
          delay: 0.05,
        },
        onEnter()  { window.dispatchEvent(new CustomEvent("krado:section", { detail: "work" })); },
        onEnterBack() { window.dispatchEvent(new CustomEvent("krado:section", { detail: "work" })); },
        onLeave()  { window.dispatchEvent(new CustomEvent("krado:section", { detail: "" })); },
        onLeaveBack() { window.dispatchEvent(new CustomEvent("krado:section", { detail: "" })); },
        onUpdate(self) {
          if (fill) gsap.set(fill, { scaleX: self.progress });

          const panelIndex = Math.min(
            Math.round(self.progress * (N - 1)), N - 1
          );

          if (prevActiveRef.current !== panelIndex) {
            setActiveIndex(panelIndex);
            prevActiveRef.current = panelIndex;
            if (panelIndex < projectPanels.length && !noMotion) {
              activateProjectPanel(projectPanels, panelIndex);
            }
          }
        },
      },
    });

    /* Mouse parallax + 3D tilt + floating icons + mesh */
    if (!noMotion) {
      allPanels.forEach(panel => {
        const img        = panel.querySelector<HTMLElement>(".work-panel-image");
        const content    = panel.querySelector<HTMLElement>(".work-panel-content");
        const mesh       = panel.querySelector<HTMLElement>(".work-panel-mesh");
        const floatIcons = panel.querySelectorAll<HTMLElement>(".work-float-icon");
        const bgGlow     = panel.querySelector<HTMLElement>(".work-panel-glow");

        let rafId: number | null = null;
        const onMove = (e: MouseEvent) => {
          if (rafId) return;
          rafId = requestAnimationFrame(() => {
            const rect = panel.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 … +0.5
            const y = (e.clientY - rect.top)  / rect.height - 0.5;

            if (img)     gsap.to(img,     { x: x * -24, y: y * -14, duration: 1.1, ease: "power2.out", overwrite: true });
            if (content) gsap.to(content, { rotateY: x * 5, rotateX: y * -3, duration: 1.1, ease: "power2.out", overwrite: true });
            if (mesh)    gsap.to(mesh,    { rotateX: y * -12, rotateY: x * 14, "--mouse-x": `${e.clientX - rect.left}px`, "--mouse-y": `${e.clientY - rect.top}px`, duration: 1.4, ease: "power2.out", overwrite: true });
            if (bgGlow)  gsap.to(bgGlow,  { x: x * 400, y: y * 400, duration: 2, ease: "power2.out", overwrite: true });

            floatIcons.forEach((icon, i) => {
              const factor = (i + 1) * 35; // Much stronger parallax shift
              gsap.to(icon, { x: x * factor, y: y * factor * 0.8, duration: 1.5 + i * 0.2, ease: "power2.out", overwrite: true });
            });
            rafId = null;
          });
        };

        const onLeave = () => {
          if (img)     gsap.to(img,     { x: 0, y: 0, duration: 1.2, ease: "power3.out", overwrite: "auto" });
          if (content) gsap.to(content, { rotateY: 0, rotateX: 0, duration: 1.2, ease: "power3.out", overwrite: "auto" });
          if (mesh)    gsap.to(mesh,    { rotateX: 0, rotateY: 0, "--mouse-x": `50%`, "--mouse-y": `50%`, duration: 1.4, ease: "power3.out", overwrite: "auto" });
          if (bgGlow)  gsap.to(bgGlow,  { x: 0, y: 0, duration: 1.8, ease: "power3.out", overwrite: "auto" });
          floatIcons.forEach(icon => gsap.to(icon, { x: 0, y: 0, duration: 1.5, ease: "power3.out", overwrite: "auto" }));
        };

        panel.addEventListener("mousemove", onMove);
        panel.addEventListener("mouseleave", onLeave);
      });
    }

    /* Initial visual state */
    if (!noMotion) {
      projectPanels.forEach((panel, i) => {
        const img = panel.querySelector<HTMLElement>(".work-panel-image");
        const tags = panel.querySelectorAll<HTMLElement>(".work-tag-chip");
        const name = panel.querySelector<HTMLElement>(".work-panel-name");
        const desc = panel.querySelector<HTMLElement>(".work-panel-desc");
        const rule = panel.querySelector<HTMLElement>(".work-panel-rule");
        const meta = panel.querySelector<HTMLElement>(".work-panel-meta");

        if (i === 0) {
          if (img) gsap.set(img, { scale: 1, filter: "saturate(1) brightness(1)" });
          if (tags.length) gsap.set(tags, { color: "#FF5500", borderColor: "rgba(255,85,0,0.55)", background: "rgba(255,85,0,0.08)", opacity: 1, y: 0 });
          if (rule) gsap.set(rule, { scaleX: 1, opacity: 1 });
          if (meta) gsap.set(meta, { opacity: 1, y: 0 });
          if (desc) gsap.set(desc, { opacity: 1, y: 0 });
          // Decode letters on first load (after a tick to let React render spans)
          if (name) {
            gsap.set(name, { opacity: 1 });
          }
        } else {
          if (img) gsap.set(img, { scale: 0.92, filter: "saturate(0.15) brightness(0.45)" });
          if (tags.length) gsap.set(tags, { color: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.07)", background: "transparent", opacity: 1, y: 0 });
          if (name) gsap.set(name, { opacity: 0.3 });
          if (desc) gsap.set(desc, { opacity: 0.2, y: 0 });
          if (rule) gsap.set(rule, { scaleX: 0, opacity: 0 });
          if (meta) gsap.set(meta, { opacity: 0.35, y: 0 });
        }
      });
      prevActiveRef.current = 0;
    }
  }, { scope: sectionRef, dependencies: [isMobile] });

  return (
    <section ref={sectionRef} className="work-section" id="work" aria-label="Selected Work Gallery">

      {/* Section tag (top-left) */}
      <div className="work-section-label" aria-hidden="true">
        <span className="work-section-tag">04 — SELECTED WORK</span>
      </div>

      {/* ══════════════ DESKTOP ══════════════ */}
      {!isMobile && (
        <>
          {/* Clipping overflow wrapper */}
          <div className="work-track-overflow">
            <div className="work-track">
              {PROJECTS.map((project, idx) => (
                <DesktopPanel key={project.id} project={project} isActive={activeIndex === idx} />
              ))}
              <ClosingPanel isActive={activeIndex === PROJECTS.length} />
            </div>
          </div>

          {/* Progress line (bottom edge) */}
          <div
            className="work-progress-track"
            role="progressbar"
            aria-label="Gallery progress"
            aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={Math.round((activeIndex / (TOTAL_PANELS - 1)) * 100)}
          >
            <div ref={progressFillRef} className="work-progress-fill"
              style={{ transformOrigin: "left center", transform: "scaleX(0)" }} />
          </div>

          {/* Vertical dot-rail (left side) — FIX: moved away from bottom-centre
              to avoid conflict with cursor and progress bar */}
          <nav className="work-dot-rail" aria-label="Panel navigation">
            {Array.from({ length: TOTAL_PANELS }).map((_, i) => (
              <button
                key={i}
                className={`work-dot-btn${activeIndex === i ? " active" : ""}`}
                aria-label={i < PROJECTS.length ? `Project ${PROJECTS[i].name}` : "More work"}
                aria-current={activeIndex === i ? "true" : undefined}
                tabIndex={0}
              >
                <span className="work-dot-inner" />
              </button>
            ))}
          </nav>

          {/* Chapter counter (bottom-right) */}
          <div className="work-chapter-counter" aria-hidden="true">
            <span className="work-chapter-current">{String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="work-chapter-sep" />
            <span className="work-chapter-total">{String(TOTAL_PANELS).padStart(2, "0")}</span>
          </div>
        </>
      )}

      {/* ══════════════ MOBILE ══════════════ */}
      {isMobile && (
        <div className="work-mobile-stack">
          <div className="work-mobile-header">
            <span className="work-section-tag" style={{ display: "block", marginBottom: "0.75rem" }}>
              04 — SELECTED WORK
            </span>
            <h2 className="work-mobile-section-title">SELECTED WORK</h2>
          </div>
          {PROJECTS.map((project, idx) => (
            <MobileProjectCard key={project.id} project={project} idx={idx} />
          ))}
          <MobileClosingCard />
        </div>
      )}
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   PANEL ACTIVATION
   ════════════════════════════════════════════════════════════ */
function activateProjectPanel(panels: HTMLElement[], activeIdx: number) {
  panels.forEach((panel, i) => {
    const img = panel.querySelector<HTMLElement>(".work-panel-image");
    const tags = panel.querySelectorAll<HTMLElement>(".work-tag-chip");
    const nameEl = panel.querySelector<HTMLElement>(".work-panel-name");
    const descEl = panel.querySelector<HTMLElement>(".work-panel-desc");
    const ruleEl = panel.querySelector<HTMLElement>(".work-panel-rule");
    const metaEl = panel.querySelector<HTMLElement>(".work-panel-meta");

    if (i === activeIdx) {
      if (img) gsap.to(img, { scale: 1, filter: "saturate(1) brightness(1)", duration: 0.8, ease: "power2.out", overwrite: "auto" });
      if (ruleEl) gsap.fromTo(ruleEl, { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      if (metaEl) gsap.fromTo(metaEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      if (nameEl) {
        gsap.fromTo(nameEl, { opacity: 0.2 }, { opacity: 1, duration: 0.15, overwrite: "auto" });
      }
      if (descEl) gsap.fromTo(descEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.12, ease: "power3.out", overwrite: "auto" });
      if (tags.length) gsap.fromTo(tags,
        { opacity: 0, y: 10, color: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.07)", background: "transparent" },
        { opacity: 1, y: 0, color: "#FF5500", borderColor: "rgba(255,85,0,0.55)", background: "rgba(255,85,0,0.08)", stagger: 0.07, duration: 0.45, ease: "power2.out", delay: 0.2, overwrite: "auto", clearProps: "transform" }
      );
    } else {
      if (img) gsap.to(img, { scale: 0.92, filter: "saturate(0.15) brightness(0.45)", duration: 0.65, ease: "power2.inOut", overwrite: "auto" });
      if (tags.length) gsap.to(tags, { color: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.07)", background: "transparent", duration: 0.35, overwrite: "auto", clearProps: "transform" });
      if (nameEl) gsap.to(nameEl, { opacity: 0.3, duration: 0.4, overwrite: "auto" });
      if (descEl) gsap.to(descEl, { opacity: 0.2, duration: 0.35, overwrite: "auto" });
      if (metaEl) gsap.to(metaEl, { opacity: 0.35, duration: 0.35, overwrite: "auto" });
      if (ruleEl) gsap.to(ruleEl, { scaleX: 0, opacity: 0, duration: 0.35, overwrite: "auto" });
    }
  });
}

/* ════════════════════════════════════════════════════════════
   DESKTOP PANEL — with 3D letter-hover on name + tag pop
   ════════════════════════════════════════════════════════════ */
function DesktopPanel({ project, isActive }: { project: Project; isActive: boolean }) {
  return (
    <article
      className={`work-panel work-project-panel${isActive ? " is-active" : ""}`}
      aria-label={`Project: ${project.name}`}
    >
      {/* 3D perspective grid mesh — behind everything */}
      <PanelMeshBg />

      {/* Floating tech stack icons drift in the dark background (outside image) */}
      <FloatingTechIcons tags={project.tags} />

      <span className="work-ghost-index" aria-hidden="true">{project.index}</span>

      {/* Image side */}
      {project.url ? (
        <a href={project.url} target="_blank" rel="noopener noreferrer" className="work-panel-image-wrap block group cursor-pointer relative overflow-visible flex items-center">
          
          {/* Simulated Video Tour Indicator */}
          {project.videoTour && (
            <div className="absolute top-0 left-0 z-20 flex items-center gap-2.5 px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-white/90 text-[10px] font-mono uppercase tracking-widest font-semibold mt-[1px]">Live Tour</span>
            </div>
          )}

          {project.videoTour ? (
            project.mockupType === "desktop" ? (
               <DesktopMonitorMockup videoUrl={project.videoUrl} shortImage={project.image} />
            ) : (
               <LaptopMockup isVideo={project.videoTour} tallImage={project.imageTall} shortImage={project.image} videoUrl={project.videoUrl} priority={project.index === "01"} />
            )
          ) : (
            <>
              <Image src={project.image} alt={project.imageAlt} fill sizes="55vw" quality={75}
                className="work-panel-image group-hover:scale-105 group-hover:brightness-50 transition-all duration-700" priority={project.index === "01"} />
              <div className="work-panel-image-fade pointer-events-none" />
              <div className="work-panel-grain pointer-events-none" aria-hidden="true" />
            </>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none">
            <span className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-mono uppercase tracking-widest text-sm rounded-full shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              Visit Live Site
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </div>
        </a>
      ) : (
        <div className="work-panel-image-wrap flex items-center overflow-visible">
          {project.videoTour && (
            <div className="absolute top-0 left-0 z-20 flex items-center gap-2.5 px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-white/90 text-[10px] font-mono uppercase tracking-widest font-semibold mt-[1px]">Live Tour</span>
            </div>
          )}
          {project.videoTour ? (
            project.mockupType === "desktop" ? (
               <DesktopMonitorMockup videoUrl={project.videoUrl} shortImage={project.image} />
            ) : (
               <LaptopMockup isVideo={project.videoTour} tallImage={project.imageTall} shortImage={project.image} videoUrl={project.videoUrl} priority={project.index === "01"} />
            )
          ) : (
            <>
              <Image src={project.image} alt={project.imageAlt} fill sizes="55vw" quality={75}
                className="work-panel-image" priority={project.index === "01"} />
              <div className="work-panel-image-fade pointer-events-none" />
              <div className="work-panel-grain pointer-events-none" aria-hidden="true" />
            </>
          )}
        </div>
      )}

      {/* Content side */}
      <div className="work-panel-content">
        <div className="work-panel-meta">
          <span className="work-panel-category">{project.category}</span>
          <span className="work-panel-dot" aria-hidden="true">·</span>
          <span className="work-panel-year">{project.year}</span>
        </div>
        <span className="work-panel-index-label" aria-hidden="true">— {project.index}</span>

        {/* Letter-split name for decode + 3D hover */}
        <h2 className="work-panel-name work-panel-name--split pr-4">
          {project.name.split("").map((char, i) => {
            if (char === " ") return <br key={i} />;
            return (
              <span key={i} className="work-name-letter"
                style={{ "--i": i } as React.CSSProperties}>
                {char}
              </span>
            );
          })}
          <span className="sr-only">{project.name}</span>
        </h2>

        <div className="work-panel-rule" aria-hidden="true" />
        <p className="work-panel-desc">{project.description}</p>

        {/* Tech tags — icon tooltip on hover */}
        <div className="work-panel-tags" role="list">
          {project.tags.map((tag, i) => {
            const mapped = TECH_ICONS[tag] ?? tag.toLowerCase().replace(/[^a-z0-9]/g, "");
            const maskUrl = mapped.startsWith("http") ? mapped : `https://cdn.simpleicons.org/${mapped}`;
            return (
              <span
                key={tag}
                className="work-tag-chip work-tag-chip--3d"
                role="listitem"
                title={tag} /* Native tooltip fallback */
                style={{ "--ti": i } as React.CSSProperties}
              >
                {/* Tooltip — appears above chip on hover with just the name */}
                <span className="work-tag-tooltip" aria-hidden="true">
                  <span>{tag}</span>
                </span>
                <span className="work-tag-inner">
                  {/* The icon itself, using mask-image so it inherits GSAP's color transition */}
                  <span 
                    className="work-tag-icon" 
                    style={{ 
                      maskImage: `url(${maskUrl})`, 
                      WebkitMaskImage: `url(${maskUrl})` 
                    }} 
                  />
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════
   CLOSING PANEL
   ════════════════════════════════════════════════════════════ */
function ClosingPanel({ isActive }: { isActive: boolean }) {
  return (
    <article
      className={`work-panel work-closing-panel${isActive ? " is-active" : ""}`}
      aria-label="Contact us for full case studies"
    >
      <div className="work-closing-rings" aria-hidden="true">
        <div className="work-closing-ring ring-1" />
        <div className="work-closing-ring ring-2" />
        <div className="work-closing-ring ring-3" />
      </div>
      <div className="work-closing-content">
        <p className="work-closing-eyebrow">WANT TO SEE THE FULL CASE STUDY?</p>
        <h2 className="work-closing-headline">MORE<br />WORK<br />ON REQUEST.</h2>
        <a href="#contact" className="work-closing-link" aria-label="Go to contact section">
          <span className="work-closing-link-inner">
            <span>Let&apos;s Talk</span>
            <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════════
   MOBILE CLOSING CARD
   ════════════════════════════════════════════════════════════ */
function MobileClosingCard() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(el, { opacity: 1 }); return; }
    gsap.fromTo(el, { opacity: 0, y: 60 }, {
      opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
    });
  }, { scope: ref });
  return (
    <div ref={ref} className="work-mobile-closing" style={{ opacity: 0 }}>
      <p className="work-closing-eyebrow">WANT TO SEE THE FULL CASE STUDY?</p>
      <h3 className="work-mobile-closing-headline">MORE WORK ON REQUEST.</h3>
      <a href="#contact" className="work-closing-link">
        <span className="work-closing-link-inner">
          <span>Let&apos;s Talk</span>
          <span aria-hidden="true">→</span>
        </span>
      </a>
    </div>
  );
}
