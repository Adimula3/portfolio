"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import WorksIntro from "./WorksIntro";
import { prefersReducedMotion } from "./animationUtils";

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

export default function Landing({ introDone }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    // The intro loader now overlays real (server-rendered) content instead of
    // gating it. We wait for the loader to hand off before running the entrance
    // so the staggered reveal still plays as the loader lifts.
    if (!introDone) return;

    const el = wrapperRef.current;
    if (!el) return;

    // The hero itself is revealed synchronously by the `landing--revealed`
    // class (CSS), in the same React commit that unmounts the loader — the
    // loader's final frame and the real page are pixel-identical, so there is
    // no entrance animation to run. This effect only wires scroll behaviour.
    const reduced = prefersReducedMotion();
    let cancelled = false;
    let cleanup = () => {};

    // Reduced motion: content is visible via CSS, native scroll, no engine.
    if (reduced) return;

    (async () => {
      let gsap, CustomEase, ScrollTrigger, Lenis;
      try {
        const mods = await Promise.all([
          import("gsap"),
          import("gsap/CustomEase"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);
        gsap = mods[0].default;
        CustomEase = mods[1].CustomEase;
        ScrollTrigger = mods[2].ScrollTrigger;
        Lenis = mods[3].default;
      } catch {
        return; // content is already visible; page degrades to native scroll
      }
      if (cancelled) return;

      gsap.registerPlugin(CustomEase, ScrollTrigger);
      CustomEase.create("main", "0.6, 0.01, 0.05, 1");

      const firstName   = el.querySelector(".landing__first");
      const lastName    = el.querySelector(".landing__last");
      const tagLinesArr = Array.from(el.querySelectorAll(".landing__tag-line"));
      const pill        = el.querySelector(".available-pill");
      const navLinksArr = Array.from(el.querySelectorAll(".roll-link"));
      const worksIntro  = el.querySelector(".works-intro");
      const navBar      = document.querySelector(".site-header");

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

      // ── Works-intro backdrop: hide once the collection ends ────────
      // The intro text is a fixed overlay that shows through the transparent
      // works section (intended). But past the last card it would bleed into
      // the gap before the footer — fade it out there, back in on scroll-up.
      // NOTE: never use overwrite here — it would kill the scrubbed timeline's
      // own opacity tween on this element. We only ever kill our own fade.
      let introFade;
      const fadeIntroTo = (opacity) => {
        if (!worksIntro) return;
        introFade?.kill();
        introFade = gsap.to(worksIntro, { opacity, duration: 0.35, ease: "power2.out" });
      };
      const worksEl = document.querySelector(".works-collection");
      const introOutST = worksEl
        ? ScrollTrigger.create({
            trigger: worksEl,
            start: "bottom 112%",
            onEnter: () => fadeIntroTo(0),
            // Guard: on instant jumps to the top (scroll restoration, "back to
            // top"), the landing scrub already owns the intro's opacity — a
            // late fade-in here would win the race and cover the hero.
            onLeaveBack: () => {
              if (window.scrollY > 400) fadeIntroTo(1);
            },
          })
        : null;

      cleanup = () => {
        scrollTl.kill();
        navST.kill();
        introOutST?.kill();
        introFade?.kill();
        gsap.ticker.remove(lenisTickerFn);
        lenis.destroy();
        if (worksIntro) gsap.set(worksIntro, { clearProps: "all" });
        if (navBar) gsap.set(navBar, { clearProps: "all" });
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [introDone]);

  return (
    <div
      ref={wrapperRef}
      className={`landing${introDone ? " landing--revealed" : ""}`}
    >

      <div className="landing__content">

        {/* ── Left column: YINKA + tagline ── */}
        <div className="landing__left">
          <h1 className="landing__first">YINKA</h1>
          <p className="landing__tagline">
            <span className="landing__tag-line">FULL-STACK DEVELOPER</span>
            <span className="landing__tag-line">FROM INTERFACES TO APIS &amp; DATABASES</span>
            <span className="landing__tag-line">BUILDING DIGITAL PRODUCTS END TO END</span>
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
                <RollLink href={LINKEDIN_LINK} target="_blank">LinkedIn</RollLink>
                <RollLink href={META_LINK} target="_blank">WhatsApp</RollLink>
              </nav>
            </div>
          </div>
        </div>

      </div>

      <WorksIntro />
    </div>
  );
}
