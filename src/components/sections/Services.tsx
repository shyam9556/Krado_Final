"use client";

import "@/styles/services.css";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WireframeCanvas } from "@/components/ui/WireframeCanvas";

import { MonitorSmartphone, Smartphone, CloudCog, PenTool, Bot, type LucideIcon } from "lucide-react";


/* ─── Service data ─── */
interface ServiceItem {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const SERVICES: ServiceItem[] = [
  {
    index: "01",
    title: "Web Development",
    description:
      "High-performance web applications built with modern stacks — from marketing sites to complex SaaS platforms.",
    icon: MonitorSmartphone,
  },
  {
    index: "02",
    title: "Mobile Apps",
    description:
      "Native and cross-platform mobile experiences that ship fast, scale smoothly, and feel premium on every device.",
    icon: Smartphone,
  },
  {
    index: "03",
    title: "Cloud & DevOps",
    description:
      "Infrastructure as code, CI/CD pipelines, and cloud architecture designed for zero-downtime scale.",
    icon: CloudCog,
  },
  {
    index: "04",
    title: "UI/UX Design",
    description:
      "Research-driven interface design that turns complexity into clarity — wireframes to high-fidelity prototypes.",
    icon: PenTool,
  },
  {
    index: "05",
    title: "AI & Automation",
    description:
      "Intelligent systems that automate workflows, surface insights, and augment human decision-making.",
    icon: Bot,
  },
];


function ServiceRow({
  service,
  isLast,
  rowIndex,
}: {
  service: ServiceItem;
  isLast: boolean;
  rowIndex: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // No isActive state — class toggled directly on DOM to avoid re-renders
  // during scroll (ScrollTrigger.onToggle) and mouse events (enter/leave).
  const [isMobile, setIsMobile] = useState(false);

  /* Responsive detection — runs client-side only to avoid SSR hydration mismatch */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* GSAP ScrollTrigger — works properly with Lenis */
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.fromTo(
        el,
        { opacity: 0, y: 50, rotateX: prefersReducedMotion ? 0 : 3 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: prefersReducedMotion ? 0 : 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "top 60%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // Mobile: activate on scroll-into-view — direct DOM, zero re-renders
      if (isMobile) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          end: "bottom 30%",
          onToggle: (self) => {
            el.classList.toggle("is-active", self.isActive);
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [isMobile, prefersReducedMotion]);

  /* Desktop: hover state with 3D tilt — direct DOM, zero re-renders */
  const handleMouseEnter = useCallback(() => {
    if (!isMobile && rowRef.current)
      rowRef.current.classList.add("is-active");
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && rowRef.current) {
      rowRef.current.classList.remove("is-active");
      // Reset tilt directly on DOM — CSS transition handles the smooth ease-out
      rowRef.current.style.transform = "";
    }
  }, [isMobile]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || prefersReducedMotion || !rowRef.current) return;
      const rect = rowRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      // Direct DOM mutation — zero React re-renders, same values as before
      rowRef.current.style.transform =
        `perspective(800px) rotateX(${y * -2}deg) rotateY(${x * 3}deg)`;
    },
    [isMobile, prefersReducedMotion]
  );

  return (
    <div
      ref={rowRef}
      className="services-row"
      data-last={isLast ? "true" : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      // No inline style — transform written by handleMouseMove directly,
      // transition is in services.css (.services-row at 1024px breakpoint)
    >
      {/* Accent sweep line */}
      <span className="services-row__sweep" aria-hidden="true" />

      {/* Oversized stroke index number — layered behind */}
      <span className="services-row__ghost-index" aria-hidden="true">
        {service.index}
      </span>

      {/* Index number */}
      <span className="services-row__index">{service.index}</span>

      {/* Title + description */}
      <div className="services-row__body">
        <h3 className="services-row__title">
          {service.title}
        </h3>
        <p className="services-row__desc">{service.description}</p>
      </div>

      {/* Lucide icon */}
      <span className="services-row__icon" aria-hidden="true">
        <service.icon size={36} strokeWidth={1.25} />
      </span>

      {/* Arrow indicator */}
      <span className="services-row__arrow" aria-hidden="true">
        ↗
      </span>

      {/* Active glow backdrop */}
      <div className="services-row__glow" aria-hidden="true" />
    </div>
  );
}

/* ─── Main section ─── */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /* GSAP scroll-driven parallax for heading */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return;

    const triggers: ScrollTrigger[] = [];

    // Parallax on the heading
    const headingTween = gsap.fromTo(
      heading,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 40%",
          toggleActions: "play none none none",
          once: true,
        },
      }
    );
    if (headingTween.scrollTrigger) triggers.push(headingTween.scrollTrigger);

    // Horizontal rule decoration animation (if it exists)
    const rule = section.querySelector(".services-divider-line");
    if (rule) {
      const ruleTween = gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: rule,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
      if (ruleTween.scrollTrigger) triggers.push(ruleTween.scrollTrigger);
    }

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="services-section"
      aria-label="Services"
    >
      {/* ── Background textures ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="scanline-grid opacity-[0.04]" />

        {/* Ambient glow — bottom right */}
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,85,0,0.025) 0%, transparent 85%)",
          }}
        />

        {/* Ambient glow — top left, faint */}
        <div
          className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,85,0,0.012) 0%, transparent 82%)",
          }}
        />
      </div>

      {/* Canvas 2D wireframe icosahedron — background decoration */}
      <WireframeCanvas />

      {/* ── Vertical decorative label — mirrors Hero's "01" ── */}
      <div className="services-vertical-label" aria-hidden="true">
        02 — Services & Capabilities
      </div>

      <div className="services-container">
        <div ref={headingRef}>
          {/* ── Section tag ── */}
          <span className="services-tag">02 — What We Do</span>

          <h2 className="services-heading">
            Services Built for
            <br />
            <span className="services-heading__accent">Impact</span>
          </h2>
        </div>

        {/* ── Service rows ── */}
        <div className="services-list" role="list">
          {SERVICES.map((service, i) => (
            <ServiceRow
              key={service.index}
              service={service}
              isLast={i === SERVICES.length - 1}
              rowIndex={i}
            />
          ))}
        </div>

        {/* ── Bottom flourish — total count ── */}
        <div className="services-footer">
          <span className="services-footer__count">
            OUR EXPERTISE
          </span>
          <span className="services-footer__line" aria-hidden="true" />
          <span className="services-footer__cta">
            <a href="#contact" className="services-footer__link">
              Discuss your project
              <span className="services-footer__link-arrow">→</span>
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
