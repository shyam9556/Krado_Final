"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  logo: string;
  metric: string;
  quote: string;
  avatar: string;
  story: string;
  brandColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "vercel",
    name: "Sarah Jenkins",
    role: "VP of Product",
    company: "Vercel",
    logo: "vercel",
    metric: "+180% Page Performance",
    quote: "Krado didn't just deliver a beautiful codebase; they completely re-engineered our core dashboard layout. The level of craft and performance obsession they bring is unmatched in the industry.",
    avatar: "/images/avatars/avatar-vercel.webp",
    story: "Vercel's developer dashboard requires extreme responsiveness. Krado worked directly with our React Server Components architecture to slash initial bundle sizes and eliminate layout shifts.",
    brandColor: "rgba(255, 255, 255, 0.4)",
  },
  {
    id: "stripe",
    name: "Alexandre Arnault",
    role: "Lead Architect",
    company: "Stripe",
    logo: "stripe",
    metric: "99.999% Reliability",
    quote: "Their team integrated seamlessly into our payments infrastructure. They don't write hacks; they build elegant, modular code that runs flawlessly under peak transaction loads.",
    avatar: "/images/avatars/avatar-stripe.webp",
    story: "For our checkout APIs, zero-downtime integration is critical. Krado rebuilt our merchant configuration portal with rigorous unit testing, type-safe API boundaries, and a scalable Next.js design system.",
    brandColor: "rgba(99, 91, 255, 0.5)",
  },
  {
    id: "figma",
    name: "Diana Prince",
    role: "Design Lead",
    company: "Figma",
    logo: "figma",
    metric: "100% Design Fidelity",
    quote: "Their design-to-code execution is flawless. What usually takes other agencies months, Krado shipped in weeks, without compromising a single pixel of our design system.",
    avatar: "/images/avatars/avatar-figma.webp",
    story: "Figma is a high-growth collaboration startup. Krado converted our vector layouts into a responsive, animated dashboard with complete Tailwind configuration.",
    brandColor: "rgba(242, 78, 30, 0.5)",
  },
  {
    id: "linear",
    name: "Dr. Evelyn Chen",
    role: "Head of AI",
    company: "Linear",
    logo: "linear",
    metric: "12x Inference Speed",
    quote: "Krado delivered an exceptionally clean, responsive data visualization system that makes our complex neural network outputs intuitive. The engineering depth of their team is outstanding.",
    avatar: "/images/avatars/avatar-linear.webp",
    story: "Linear's search interfaces process massive volumes of contextual embeddings. Krado designed a custom canvas-based network graph visualizer that handles 10,000+ data nodes in real-time.",
    brandColor: "rgba(94, 106, 210, 0.5)",
  },
  {
    id: "hashicorp",
    name: "Marcus Vance",
    role: "Chief Information Officer",
    company: "HashiCorp",
    logo: "hashicorp",
    metric: "-42% Cloud Spend",
    quote: "We needed a team that could navigate enterprise compliance while moving at startup speed. Krado achieved the impossible: re-architecting our developer registry within weeks.",
    avatar: "/images/avatars/avatar-hashicorp.webp",
    story: "Our cloud registry is utilized by millions of developers daily. Krado implemented optimized CDN caching policies, serverless edge routing, and a modern TypeScript SDK.",
    brandColor: "rgba(255, 255, 255, 0.3)",
  },
  {
    id: "supabase",
    name: "Kenji Sato",
    role: "Director of Eng",
    company: "Supabase",
    logo: "supabase",
    metric: "0.2s Real-time Sync",
    quote: "The real-time database interfaces they built for us are phenomenal. They truly understand WebSockets, state synchronization, and reactive UI architecture.",
    avatar: "/images/avatars/avatar-supabase.webp",
    story: "Supabase needed a sleek database management console. Krado developed a dynamic React dashboard using Postgres notifications.",
    brandColor: "rgba(63, 207, 142, 0.5)",
  },
];

/* ════════════════════════════════════════════════════════════
   Scramble Text Decoder Component
   ════════════════════════════════════════════════════════════ */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

function DecodeQuote({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return text[index];
            }
            if (letter === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iterations >= text.length) {
        clearInterval(interval);
        isAnimating.current = false;
        setDisplayText(text); // Ensure it's perfectly set
      }

      iterations += 1; // Speed of decode
    }, 20);

    return () => clearInterval(interval);
  }, [text]);

  return <span className="testimonials-quote-decode">{displayText}</span>;
}

/* ════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════ */
export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonial = TESTIMONIALS[activeIndex];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 8000); // Swipe every 8 seconds
    
    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? TESTIMONIALS.length - 1 : current - 1));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -100 && activeIndex < TESTIMONIALS.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (swipe > 100 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <section
      id="testimonials"
      className="testimonials-section-3d dark relative overflow-hidden py-24 md:py-32"
      aria-label="Client Testimonials 3D Slider"
    >
      {/* Dynamic Background Glow - Hidden on mobile for extreme performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {!isMobile && (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`glow-${activeIndex}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-[100px] md:blur-[140px]"
              style={{
                background: `radial-gradient(circle, ${activeTestimonial.brandColor} 0%, transparent 60%)`,
                opacity: 0.15
              }}
            />
          </AnimatePresence>
        )}
        <div className="scanline-grid opacity-10" />
      </div>

      <div className="section-container relative z-10 flex flex-col items-center">
        
        {/* Header & Main Quote Display */}
        <div className="flex flex-col items-center text-center w-full max-w-5xl mx-auto">
          <span className="testimonials-tag mb-8 md:mb-12 inline-block px-4 py-1.5 rounded-full border border-border/50 text-xs font-mono text-muted-foreground uppercase tracking-widest bg-background/50 backdrop-blur-md">
            05 — Success Stories
          </span>
          
          <div className="relative min-h-[180px] md:min-h-[220px] w-full flex items-center justify-center mb-8">
            <Quote className="absolute -top-6 -left-2 md:-top-10 md:-left-8 w-12 h-12 md:w-20 md:h-20 text-accent-primary opacity-10" />
            <h2 className="font-heading text-xl md:text-3xl lg:text-4xl font-medium tracking-tight leading-[1.3] md:leading-[1.4] text-text-primary">
              &ldquo;<DecodeQuote text={activeTestimonial.quote} />&rdquo;
            </h2>
          </div>
        </div>

        {/* 3D Coverflow Slider */}
        <div 
          className="w-full mt-8 md:mt-12 h-[380px] relative perspective-[1200px] flex items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          <div className="relative w-full max-w-6xl h-full flex items-center justify-center transform-style-3d">
            {TESTIMONIALS.map((testimonial, idx) => {
              let offset = idx - activeIndex;
              const half = Math.floor(TESTIMONIALS.length / 2);
              if (offset > half) offset -= TESTIMONIALS.length;
              if (offset < -half) offset += TESTIMONIALS.length;

              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);
              const sign = Math.sign(offset);

              // 3D Math Variables
              const xTranslation = isMobile ? 65 : 180;
              const x = offset * xTranslation;
              const rotateY = sign * -28; // Turn inward
              const scale = Math.max(1 - absOffset * 0.15, 0.5);
              const z = -absOffset * 150;
              const opacity = Math.max(1 - absOffset * 0.4, 0);
              const zIndex = TESTIMONIALS.length - absOffset;

              // Do not render cards that are too far away
              if (absOffset > 2) return null;

              return (
                <motion.div
                  key={testimonial.id}
                  className="absolute cursor-pointer select-none will-change-transform"
                  style={{ zIndex }}
                  initial={false}
                  animate={{
                    x,
                    rotateY,
                    scale,
                    z,
                    opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    mass: 0.8,
                  }}
                  onClick={() => setActiveIndex(idx)}
                  drag={isCenter ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={isCenter ? handleDragEnd : undefined}
                >
                  <div className={`
                    relative border border-white/10 rounded-2xl p-6 md:p-8 
                    w-[280px] md:w-[380px] h-[320px] md:h-[340px] flex flex-col justify-between overflow-hidden
                    transition-shadow duration-500
                    ${isMobile ? 'bg-[#0b0c10]' : 'bg-[#0b0c10]/80 backdrop-blur-xl'}
                    ${isCenter ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] border-white/20' : 'shadow-none'}
                  `}>
                    {/* Inner Top Accent Glow - Hidden on mobile to save GPU frame rate */}
                    {!isMobile && (
                      <div 
                        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full blur-[60px] pointer-events-none opacity-50"
                        style={{ background: testimonial.brandColor }}
                      />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://cdn.simpleicons.org/${testimonial.logo}/ffffff`}
                          alt={`${testimonial.company} Logo`}
                          className="w-8 h-8 md:w-10 md:h-10 filter invert dark:invert-0 drop-shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <span className="font-heading font-bold text-xl md:text-2xl text-white tracking-wide">
                          {testimonial.company}
                        </span>
                      </div>
                      
                      <div className="inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-xs md:text-sm font-mono text-accent-primary font-medium tracking-wide shadow-sm">
                        {testimonial.metric}
                      </div>
                    </div>

                    <div className="relative z-10 pt-4 mt-auto border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/10">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm md:text-base">
                            {testimonial.name}
                          </h4>
                          <p className="text-white/60 text-xs md:text-sm">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-8 md:mt-12 relative z-20">
          <button
            onClick={handlePrev}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/10 transition-all group"
            aria-label="Previous Testimonial"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleNext}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/10 transition-all group"
            aria-label="Next Testimonial"
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
