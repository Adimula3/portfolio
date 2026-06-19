"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WorksIntro from "./WorksIntro";

const EMAIL_LINK = "mailto:Kolawoleolayinka16@gmail.com";
const LINKEDIN_LINK = "https://www.linkedin.com/in/olayinka-kolawole-84189a188/";
const META_LINK = "https://wa.me/2349064819280";

function RollLink({ href, children, target }) {
  const text = String(children);
  return (
    <Link
      href={href}
      className="roll-link"
      aria-label={text}
      {...(target ? { target, rel: "noopener noreferrer" } : {})}
    >
      <span aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <span
            key={i}
            className="roll-letter"
            data-letter={char === " " ? " " : char}
            style={{ transitionDelay: `${i * 0.015}s` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </Link>
  );
}

export default function Landing() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(CustomEase, ScrollTrigger);
    CustomEase.create("main", "0.6, 0.01, 0.05, 1");

    const el = wrapperRef.current;
    if (!el) return;

    const firstName   = el.querySelector(".landing__first");
    const lastName    = el.querySelector(".landing__last");
    const tagLinesArr = Array.from(el.querySelectorAll(".landing__tag-line"));
    const pill        = el.querySelector(".available-pill");
    const navLinksArr = Array.from(el.querySelectorAll(".roll-link"));
    const worksIntro  = el.querySelector(".works-intro");
    const navBar      = document.querySelector(".site-header");

    const animTargets = [firstName, lastName, ...tagLinesArr, pill, ...navLinksArr].filter(Boolean);
    gsap.set(animTargets, { clearProps: "all" });
    if (worksIntro) gsap.set(worksIntro, { opacity: 0 });
    if (navBar) gsap.set(navBar, { opacity: 0, y: -15, pointerEvents: "none" });

    // ── Lenis — created first, synced to ScrollTrigger ─────────────
    const lenis = new Lenis({
      duration:        1.2,
      easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel:     true,
      wheelMultiplier: 1,
      touchMultiplier: 0.9,
      syncTouch:       true,
    });

    // Keep ScrollTrigger in sync with Lenis scroll position
    lenis.on("scroll", ScrollTrigger.update);
    const lenisTickerFn = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisTickerFn);
    gsap.ticker.lagSmoothing(0);

    // ── Entrance animation ──────────────────────────────────────────
    const tl = gsap.timeline();
    tl.fromTo(
        [firstName, lastName].filter(Boolean),
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.06, ease: "main" }
      )
      .fromTo(
        tagLinesArr,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" },
        "-=0.7"
      )
      .fromTo(
        [pill].filter(Boolean),
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(
        navLinksArr,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" },
        "<"
      );

    // ── Scroll-out: scrub directly tied to scroll position ─────────
    // The landing scrolls naturally while elements also animate.
    // scrub:true gives 1-to-1 mapping with no extra lag
    // (Lenis already provides the smooth easing).
    // Timeline proportions:
    //   • names — full range (duration 1):   gone by 250px scroll
    //   • tagline/pill/nav — first half (duration 0.5): gone by 125px
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "+=250",
        scrub: true,
      },
    });

    scrollTl
      .to([firstName, lastName].filter(Boolean),
        { y: -100, opacity: 0, ease: "none", duration: 1 }, 0)
      .to([...tagLinesArr, pill, ...navLinksArr].filter(Boolean),
        { opacity: 0, ease: "none", duration: 0.5 }, 0)
      .to([worksIntro].filter(Boolean),
        { opacity: 1, ease: "none", duration: 0.15 }, 0.35);

    // ── Navbar: appears the moment tagline/info finish fading ──────
    // start: 125 fires when window.scrollY hits 125px — exactly when
    // the fast-fade elements reach opacity 0.
    const navST = ScrollTrigger.create({
      start: 125,
      onEnter: () => {
        if (!navBar) return;
        gsap.to(navBar, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", overwrite: true });
        navBar.style.pointerEvents = "auto";
      },
      onLeaveBack: () => {
        if (!navBar) return;
        gsap.to(navBar, { opacity: 0, y: -15, duration: 0.3, ease: "power2.in", overwrite: true });
        navBar.style.pointerEvents = "none";
      },
    });

    return () => {
      tl.kill();
      scrollTl.kill();
      navST.kill();
      gsap.ticker.remove(lenisTickerFn);
      lenis.destroy();
      gsap.set(animTargets, { clearProps: "all" });
      if (worksIntro) gsap.set(worksIntro, { clearProps: "all" });
      if (navBar) gsap.set(navBar, { clearProps: "all" });
    };
  }, []);

  return (
    <div ref={wrapperRef} className="landing">

      <div className="landing__content">

        {/* ── Left column: YINKA + tagline ── */}
        <div className="landing__left">
          <h1 className="landing__first">YINKA</h1>
          <p className="landing__tagline">
            <span className="landing__tag-line">CREATIVE FRONT-END DEVELOPER</span>
            <span className="landing__tag-line">BUILDING UNIQUE DIGITAL EXPERIENCES</span>
            <span className="landing__tag-line">ONE PIXEL AT A TIME</span>
          </p>
        </div>

        {/* ── Right column: KOLAWOLE + available + nav ── */}
        <div className="landing__right">
          <div className="landing__right-group">
            <h1 className="landing__last">KOLAWOLE</h1>
            <div className="landing__right-info">
              <a
                href={EMAIL_LINK}
                className="available-pill"
                aria-label="Available for work — send an email"
              >
                AVAILABLE
                <span className="available-pill__dot" aria-hidden="true" />
              </a>
              <nav className="landing__nav" aria-label="Main navigation">
                <RollLink href="/about">About</RollLink>
                <RollLink href={EMAIL_LINK}>Email</RollLink>
                <RollLink href={LINKEDIN_LINK} target="_blank">in</RollLink>
                <RollLink href={META_LINK} target="_blank">Meta</RollLink>
              </nav>
            </div>
          </div>
        </div>

      </div>

      <WorksIntro />
    </div>
  );
}
