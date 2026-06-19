"use client";

// SOURCE: erichuguenin.md — HERO SECTION
//
// 100vh, white background, left-aligned, pure typography.
// Four-step GSAP entrance timeline fires on mount (after PageLoader onComplete):
//   1. Hero name    — fade + translateY up, 1.2s, CustomEase "main"
//   2. Tagline lines — staggered per-line fade + slide, 0.8s, stagger 0.15s
//   3. "Available"  — fade in, 0.5s
//   4. Scroll hint  — fade in, then bouncing arrow loops indefinitely

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const EMAIL_LINK = "mailto:Kolawoleolayinka16@gmail.com";

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(CustomEase, ScrollTrigger);

    // Exact ease from erichuguenin.md
    CustomEase.create("main",   "0.6, 0.01, 0.05, 1");
    CustomEase.create("gentle", "0.38, 0.005, 0.215, 1");

    const section = sectionRef.current;
    if (!section) return;

    const name       = section.querySelector(".hero__name");
    const tagLines   = section.querySelectorAll(".hero__tagline-line");
    const available  = section.querySelector(".available-hero");
    const scrollHint = section.querySelector(".scroll-hint");
    const arrow      = section.querySelector(".scroll-hint__arrow");

    // ── Entrance timeline ──────────────────────────────────────────
    const tl = gsap.timeline();

    // 1. Name: fade + slide up from y:50, 1.2s, ease "main"
    tl.from(name, {
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: "main",
    });

    // 2. Tagline lines: staggered per-line, overlaps h1 by 0.8s
    tl.from(tagLines, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      ease: "main",
    }, "-=0.8");

    // 3. "Available" link: fade in, 0.5s
    tl.from(available, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "-=0.4");

    // 4. Scroll hint: fade in, then start arrow bounce loop
    tl.from(scrollHint, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "-=0.2");

    tl.add(() => {
      if (!arrow) return;
      gsap.to(arrow, {
        y: 8,
        duration: 0.8,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    // ── Lenis smooth scroll ────────────────────────────────────────
    // erichuguenin.md: duration 1.2, smoothWheel, lerp-style ease
    const lenis = new Lenis({
      duration:        1.2,
      easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel:     true,
      wheelMultiplier: 1,
      touchMultiplier: 0.9,
      syncTouch:       true,
    });

    let rafId;
    function lenisRaf(time) {
      lenis.raf(time);
      ScrollTrigger.update();
      rafId = requestAnimationFrame(lenisRaf);
    }
    rafId = requestAnimationFrame(lenisRaf);

    return () => {
      tl.kill();
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero" id="home">
      {/* Main content block — name + tagline + CTA */}
      <div className="hero__content">
        {/* Headline — largest typographic element */}
        <h1 className="hero__name">Your Name</h1>

        {/* Tagline — three lines, animated in per-line */}
        <p className="hero__tagline">
          <span className="hero__tagline-line">Creative Front-End Developer</span>
          <span className="hero__tagline-line">Building unique digital experiences</span>
          <span className="hero__tagline-line">one pixel at a time</span>
        </p>

        {/* "Available" CTA — doubled text enables CSS hover slide */}
        <a
          href={EMAIL_LINK}
          className="available-link available-hero"
          aria-label="Available for work — send an email"
        >
          <span className="available-link__top">Available</span>
          <span className="available-link__bottom">Available</span>
        </a>
      </div>

      {/* Scroll hint — bottom left, fades in last then arrow bounces */}
      <div className="scroll-hint" aria-hidden="true">
        <span className="scroll-hint__label">Click to scroll</span>
        <span className="scroll-hint__arrow">↓</span>
      </div>
    </section>
  );
}
