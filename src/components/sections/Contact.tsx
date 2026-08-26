"use client";

import "@/styles/contact.css";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";

const SERVICES = [
  "Web Development",
  "UI/UX Design",
  "Mobile Apps",
  "AI & Automation",
  "Cloud & DevOps",
  "Consulting",
] as const;

const TIMELINES = [
  "Immediate (< 1 month)",
  "1 - 3 Months",
  "3 - 6 Months",
  "Flexible / Other",
] as const;

export function Contact() {
  // Form states
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTimeline, setSelectedTimeline] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Honeypot field — invisible to humans, bots fill it automatically
  const [honeypot, setHoneypot] = useState("");



  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          message,
          services: selectedServices.join(", "),
          timeline: selectedTimeline,
          website: honeypot, // Honeypot — should be empty for real users
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        // Reset form fields
        setName("");
        setEmail("");
        setCompany("");
        setMessage("");
        setSelectedServices([]);
        setSelectedTimeline("");
        setHoneypot("");
        // Clear success message after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setErrorMessage(
          data.message || "Something went wrong. Please try again."
        );
      }
    } catch {
      setErrorMessage(
        "Could not connect to the server. Please email us directly at hello@krado.co"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section" aria-label="Start Your Project">
      {/* Background radial overlays */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="scanline-grid opacity-[0.02] absolute inset-0" />
        {/* L9/#50: Hardcoded 600x600 orb overflowed 320px viewport (extends to 360px).
            Hidden on xs, visible sm+ with viewport-proportional sizing. */}
        <div
          className="absolute left-[-8rem] sm:left-[-15rem] top-[-6rem] sm:top-[-10rem] h-[min(60vw,600px)] w-[min(60vw,600px)] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,85,0,0.04) 0%, transparent 90%)",
          }}
        />
        <div
          className="absolute right-[-6rem] sm:right-[-10rem] top-1/2 h-[min(50vw,500px)] w-[min(50vw,500px)] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.015) 0%, transparent 88%)",
          }}
        />
      </div>

      <div className="contact-container">
        <div className="contact-grid">
          {/* ═══════ LEFT COLUMN: TYPOGRAPHY & CLOCK ═══════ */}
          <div className="contact-info-panel">
            <span className="contact-tag">06 — Collaboration</span>
            <h2 className="contact-title-display">
              LET’S BUILD
              <br />
              SOMETHING
              <br />
              <span className="text-accent-primary dark:drop-shadow-[0_0_15px_rgba(255,85,0,0.25)]">
                BEYOND
              </span>
            </h2>

            <p className="contact-desc">
              Have an idea that breaks boundaries? We help companies define, design, and develop premium products. Tell us about your project, and let’s make it happen.
            </p>

            <div className="contact-meta-zone">


              {/* Direct email links */}
              <div className="contact-direct-links">
                <span className="contact-direct-label">OR EMAIL US DIRECTLY</span>
                <Magnetic strength={0.15}>
                  <a href="mailto:hello@krado.co" className="contact-email-link group">
                    hello@krado.co
                    <span className="contact-email-arrow">→</span>
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN: PREMIUM FORM ═══════ */}
          <div className="contact-form-panel">
            <form onSubmit={handleSubmit} className="contact-form">
              
              {/* Service Select Selector */}
              <div className="form-group-section">
                <span className="form-group-title">What services do you need?</span>
                <div className="form-services-grid">
                  {SERVICES.map((service) => {
                    const isSelected = selectedServices.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`form-service-chip ${isSelected ? "is-selected" : ""}`}
                      >
                        <span className="form-service-chip__glow" />
                        <span className="relative z-10 flex items-center gap-2">
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent-primary" />}
                          {service}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeline selector */}
              <div className="form-group-section mt-8">
                <span className="form-group-title">What is your target timeline?</span>
                <div className="form-budget-row">
                  {TIMELINES.map((timeline) => {
                    const isSelected = selectedTimeline === timeline;
                    return (
                      <button
                        key={timeline}
                        type="button"
                        onClick={() => setSelectedTimeline(timeline)}
                        className={`form-budget-chip ${isSelected ? "is-selected" : ""}`}
                      >
                        <span className="form-budget-chip__glow" />
                        <span className="relative z-10">{timeline}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Fields */}
              <div className="form-inputs-stack mt-10">
                {/* Name */}
                <div className={`form-input-wrapper ${focusedInput === "name" || name ? "is-active" : ""}`}>
                  <label htmlFor="form-name" className="form-input-label">Your Name *</label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput(null)}
                    className="form-text-input"
                  />
                  <div className="form-input-border-line" />
                </div>

                {/* Email */}
                <div className={`form-input-wrapper ${focusedInput === "email" || email ? "is-active" : ""}`}>
                  <label htmlFor="form-email" className="form-input-label">Email Address *</label>
                  <input
                    id="form-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    className="form-text-input"
                  />
                  <div className="form-input-border-line" />
                </div>

                {/* Company Name */}
                <div className={`form-input-wrapper ${focusedInput === "company" || company ? "is-active" : ""}`}>
                  <label htmlFor="form-company" className="form-input-label">Company Name (Optional)</label>
                  <input
                    id="form-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    onFocus={() => setFocusedInput("company")}
                    onBlur={() => setFocusedInput(null)}
                    className="form-text-input"
                  />
                  <div className="form-input-border-line" />
                </div>

                {/* Message / Description */}
                <div className={`form-input-wrapper is-textarea ${focusedInput === "message" || message ? "is-active" : ""}`}>
                  <label htmlFor="form-message" className="form-input-label">Tell us about your project *</label>
                  <textarea
                    id="form-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => setFocusedInput("message")}
                    onBlur={() => setFocusedInput(null)}
                    className="form-text-area"
                  />
                  <div className="form-input-border-line" />
                </div>
              </div>

              {/* Honeypot field — hidden from humans, traps bots */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                <label htmlFor="form-website">Website</label>
                <input
                  id="form-website"
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Submit panel */}
              <div className="form-submit-row mt-10">
                <Magnetic strength={0.15}>
                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className={`form-submit-btn group ${isSuccess ? "is-success" : ""}`}
                  >
                    <div className="form-submit-btn__sweep" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <div className="form-submit-spinner" />
                          Sending Proposal...
                        </>
                      ) : isSuccess ? (
                        <>
                          <Check className="w-5 h-5" />
                          Proposal Sent!
                        </>
                      ) : (
                        <>
                          Start Project
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </Magnetic>
              </div>

              {/* Dynamic feedback panel */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="form-success-alert mt-4"
                  >
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-mono">
                      Thank you! We have received your project details and will follow up in 24 hours.
                    </span>
                  </motion.div>
                )}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 p-4 mt-4 rounded-lg border border-red-500/20 bg-red-500/5"
                  >
                    <span className="text-sm text-red-500 dark:text-red-400 font-mono flex-1">
                      {errorMessage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setErrorMessage("")}
                      className="text-red-500/60 hover:text-red-500 transition-colors text-xs font-mono"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
