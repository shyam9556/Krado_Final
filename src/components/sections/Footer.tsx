"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Send, Check } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import { useLenis } from "@/components/layout/smooth-scroll-provider";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const lenis = useLenis();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer id="footer" className="footer-section dark" aria-label="Krado Footer">
      {/* Background glow structures */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="scanline-grid opacity-[0.02] absolute inset-0" />
        <div 
          className="absolute right-[-10rem] bottom-[-10rem] h-[500px] w-[500px] rounded-full opacity-[0.04] dark:opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)",
            filter: "blur(90px)"
          }}
        />
      </div>

      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Logo & Newsletter */}
          <div className="footer-brand-zone">
            <div className="footer-logo-title">
              KRADO<span>.</span>
            </div>
            <p className="footer-brand-desc">
              We design and engineer digital platforms that scale with your ambitions. No templates, no compromise.
            </p>
            <div className="footer-newsletter-wrap">
              <span className="footer-newsletter-label">Subscribe to our newsletter</span>
              <form onSubmit={handleSubscribe} className="footer-newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="footer-newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed}
                  required
                />
                <button
                  type="submit"
                  className={`footer-subscribe-btn flex items-center justify-center min-w-[50px] ${subscribed ? "!bg-green-500 !text-white" : ""}`}
                  aria-label="Subscribe"
                >
                  {subscribed ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
              <AnimatePresence>
                {subscribed && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-500 font-mono mt-1"
                  >
                    Successfully subscribed!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Links Column 1: Services */}
          <div className="footer-links-col">
            <span className="footer-col-title">Services</span>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#services">Custom Engineering</a></li>
              <li className="footer-link-item"><a href="#services">UI/UX Interface Design</a></li>
              <li className="footer-link-item"><a href="#services">Cloud Architecture</a></li>
              <li className="footer-link-item"><a href="#services">AI Embeddings Integration</a></li>
            </ul>
          </div>

          {/* Links Column 2: Company */}
          <div className="footer-links-col">
            <span className="footer-col-title">Company</span>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#work">Selected Work</a></li>
              <li className="footer-link-item"><a href="#about">About & Manifesto</a></li>
              <li className="footer-link-item"><a href="#about">Philosophy</a></li>
              <li className="footer-link-item"><a href="#contact">Careers</a></li>
            </ul>
          </div>

          {/* Links Column 3: Resources */}
          <div className="footer-links-col">
            <span className="footer-col-title">Resources</span>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#testimonials">Client Success Stories</a></li>
              <li className="footer-link-item"><a href="#contact">Developer Docs</a></li>
              <li className="footer-link-item"><a href="#contact">System Status</a></li>
              <li className="footer-link-item"><a href="#contact">Contact Support</a></li>
            </ul>
          </div>

        </div>

        {/* Footer Brand Logo (matches Navbar style) */}
        <div className="flex justify-center w-full mt-24 mb-12">
          <div 
            className="group relative flex items-center gap-3 md:gap-5 cursor-pointer"
            onClick={scrollToTop}
          >
            <span className="w-1.5 md:w-2.5 h-8 md:h-16 bg-accent-primary transform scale-y-50 origin-bottom transition-transform duration-300 group-hover:scale-y-100" />
            <span className="text-4xl md:text-7xl font-bold tracking-[0.2em] text-foreground font-mono transition-colors duration-300 group-hover:text-accent-primary">
              KRADO
            </span>
          </div>
        </div>

        {/* Footer Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Krado Inc. All rights reserved. Crafting leverage worldwide.
          </div>

          <div className="footer-socials">
            <Magnetic strength={0.35}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="GitHub Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
            </Magnetic>
            
            <Magnetic strength={0.35}>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </Magnetic>

            <Magnetic strength={0.35}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Twitter Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </Magnetic>

            <Magnetic strength={0.3}>
              <button
                onClick={scrollToTop}
                className="footer-back-to-top"
                aria-label="Scroll back to top"
              >
                <span>Back to Top</span>
                <ArrowUp className="w-4 h-4 footer-back-to-top-arrow" />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </footer>
  );
}
