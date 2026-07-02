"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import styles from "@/app/about/about.module.css";
import { onPageReady, prefersReducedMotion } from "./animationUtils";

const ABOUT_SCENE_VIDEO = "/videos/about-scene-01.mp4";
const FOCUS_SKETCH_VIDEO = "/videos/focus-sketch-cut03.mp4";
const CLOSING_VIDEO = "/videos/about-cut-05.mp4";
const EMAIL_LINK = "mailto:Kolawoleolayinka16@gmail.com";
const LINKEDIN_LINK = "https://www.linkedin.com/in/olayinka-kolawole-84189a188/";
const META_LINK = "https://wa.me/2349064819280";

const skills = [
  "Front-End Development",
  "Back-End Development",
  "API Integration",
  "Database Management",
  "Responsive Web Design",
  "Technical Writing",
  "AI Prompt Engineering",
];

const closingStatements = [
  "From idea to production.",
  "Built end to end.",
  "Reach out",
];

const closingNavLinks = [
  ["About", "/about"],
  ["Email", EMAIL_LINK],
  ["LinkedIn", LINKEDIN_LINK],
  ["WhatsApp", META_LINK],
];

function ClosingRollLink({ href, label, active }) {
  const isExternal = href.startsWith("https://");

  return (
    <a
      href={href}
      className={`roll-link ${styles.closingLink}${active ? ` ${styles.closingLinkActive}` : ""}`}
      aria-label={label}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span aria-hidden="true">
        {Array.from(label).map((char, i) => (
          <span
            key={i}
            className="roll-letter"
            data-letter={char}
            style={{ transitionDelay: `${i * 0.015}s` }}
          >
            {char}
          </span>
        ))}
      </span>
    </a>
  );
}

function splitIntoLines(paraEl) {
  const origChildren = Array.from(paraEl.childNodes);
  const units = [];

  origChildren.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      child.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        units.push(span);
      });
    } else {
      units.push(child);
    }
  });

  paraEl.innerHTML = "";
  units.forEach((u) => paraEl.appendChild(u));

  const groups = [];
  let curGroup = [];
  let curTop = null;

  units.forEach((u) => {
    const top = Math.round(u.getBoundingClientRect().top);
    if (curTop === null) curTop = top;
    if (Math.abs(top - curTop) > 20) {
      groups.push(curGroup);
      curGroup = [u];
      curTop = top;
    } else {
      curGroup.push(u);
    }
  });
  if (curGroup.length) groups.push(curGroup);

  paraEl.innerHTML = "";
  const lineData = [];

  groups.forEach((group) => {
    const lineWrap = document.createElement("div");
    lineWrap.style.cssText = "position:relative;";
    group.forEach((u) => lineWrap.appendChild(u));

    const curtain = document.createElement("div");
    curtain.style.cssText =
      "position:absolute;inset:0;background:#050505;transform:scaleX(0);transform-origin:left;z-index:2;pointer-events:none;filter:url(#brush-rough);";

    lineWrap.appendChild(curtain);
    paraEl.appendChild(lineWrap);
    lineData.push({ lineWrap, curtain });
  });

  return lineData;
}

export default function AboutContent() {
  const heroImageRef    = useRef(null);
  const heroVideoRef    = useRef(null);
  const p1SectionRef    = useRef(null);
  const parallaxTextRef = useRef(null);
  const p2SectionRef    = useRef(null);
  const makeItRef        = useRef(null); // wrapper div (gets opacity + x)
  const matterRef        = useRef(null); // wrapper div (gets opacity + x)
  const makeItCurtainRef = useRef(null); // curtain overlay for "Sketch it"
  const matterCurtainRef = useRef(null); // curtain overlay for "Into Systems"
  const p5ContainerRef   = useRef(null);
  const focusSketchLayerRef = useRef(null);
  const focusSketchVideoRef = useRef(null);
  const p5LabelRef       = useRef(null);
  const skillRefs       = useRef([]);
  const para1Ref        = useRef(null);
  const para2Ref        = useRef(null);
  const closingSectionRef = useRef(null);
  const closingPinRef = useRef(null);
  const closingVideoRef = useRef(null);
  const closingStatementRefs = useRef([]);
  const closingNavRef = useRef(null);

  useEffect(() => {
    const prevBg = document.body.style.background;
    document.body.style.background = "#050505";

    const reduced = prefersReducedMotion();
    let cancelled = false;
    let cleanup = () => {};

    // Boot the scroll/animation system after window.load so it never blocks
    // first paint. On client-side navigation load has already fired, so this
    // runs on the next frame.
    const stopReady = onPageReady(() => {
      if (cancelled) return;
      cleanup = init();
    });

    return () => {
      cancelled = true;
      stopReady();
      cleanup();
      document.body.style.background = prevBg;
    };

    function init() {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Reduced motion: skip Lenis smooth-scroll inertia and use native scroll.
    // ScrollTrigger drives the reveals off native scroll just the same.
    const lenis = reduced
      ? null
      : new Lenis({
          duration:        1.2,
          easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel:     true,
          wheelMultiplier: 1,
          touchMultiplier: 0.9,
          syncTouch:       true,
        });

    const lenisTickFn = (time) => lenis.raf(time * 1000);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(lenisTickFn);
      gsap.ticker.lagSmoothing(0);
    }

    const heroVideo = heroVideoRef.current;
    const focusSketchLayer = focusSketchLayerRef.current;
    const focusSketchVideo = focusSketchVideoRef.current;
    const closingSection = closingSectionRef.current;
    const closingPin = closingPinRef.current;
    const closingVideo = closingVideoRef.current;
    const closingNav = closingNavRef.current;
    let heroVideoMotion;
    let focusSketchTrigger;
    let focusSketchRaf;
    let focusSketchTargetTime = 0.01;
    let closingTimeline;
    let closingVideoTrigger;
    let closingVideoRaf;
    let closingVideoTargetTime = 0.01;
    let closingSplits = [];
    let pauseHeroVideoTimeout;

    const wireHeroVideoMotion = () => {
      if (!heroVideo || !p1SectionRef.current || !p2SectionRef.current) return;

      heroVideo.pause();
      heroVideo.currentTime = 0.01;
      heroVideo.loop = true;
      heroVideoMotion?.kill();

      const pauseAfterScroll = () => {
        clearTimeout(pauseHeroVideoTimeout);
        pauseHeroVideoTimeout = window.setTimeout(() => {
          heroVideo.pause();
        }, 120);
      };

      heroVideoMotion = ScrollTrigger.create({
        trigger: p1SectionRef.current,
        start: "top top",
        endTrigger: p2SectionRef.current,
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = Math.abs(self.getVelocity ? self.getVelocity() : 0);
          heroVideo.playbackRate = gsap.utils.clamp(0.85, 2.2, velocity / 900);

          if (heroVideo.paused) {
            heroVideo.play().catch(() => {});
          }

          pauseAfterScroll();
        },
        onLeave: () => heroVideo.pause(),
        onLeaveBack: () => heroVideo.pause(),
      });
    };

    // Reduced motion: leave the hero on its first frame (no scroll-driven play).
    if (heroVideo && !reduced) {
      if (heroVideo.readyState >= 1) {
        wireHeroVideoMotion();
      } else {
        heroVideo.addEventListener("loadedmetadata", wireHeroVideoMotion, { once: true });
      }
    }

    const wireFocusSketchScrub = () => {
      if (!focusSketchLayer || !focusSketchVideo || !p5ContainerRef.current) return;

      focusSketchTrigger?.kill();
      if (focusSketchRaf) cancelAnimationFrame(focusSketchRaf);

      focusSketchVideo.pause();
      focusSketchVideo.currentTime = 0.01;
      gsap.set(focusSketchLayer, { opacity: 0 });

      const safeDuration = Math.max((focusSketchVideo.duration || 1) - 0.04, 0.01);
      const seekFocusSketch = () => {
        focusSketchVideo.currentTime = focusSketchTargetTime;
        focusSketchRaf = null;
      };

      focusSketchTrigger = ScrollTrigger.create({
        trigger: p5ContainerRef.current,
        start: "top 88%",
        end: "bottom top",
        onUpdate: (self) => {
          focusSketchTargetTime = 0.01 + self.progress * safeDuration;

          if (!focusSketchRaf) {
            focusSketchRaf = requestAnimationFrame(seekFocusSketch);
          }

          const fadeIn = gsap.utils.clamp(0, 1, self.progress / 0.18);
          const fadeOut = gsap.utils.clamp(0, 1, (1 - self.progress) / 0.22);
          const easedOpacity = 0.3 * Math.min(fadeIn, fadeOut);

          gsap.set(focusSketchLayer, {
            opacity: easedOpacity,
          });
        },
        onLeave: () => gsap.set(focusSketchLayer, { opacity: 0 }),
        onLeaveBack: () => gsap.set(focusSketchLayer, { opacity: 0 }),
      });
    };

    if (focusSketchVideo) {
      if (focusSketchVideo.readyState >= 1) {
        wireFocusSketchScrub();
      } else {
        focusSketchVideo.addEventListener("loadedmetadata", wireFocusSketchScrub, { once: true });
      }
    }

    const wireClosingSequence = () => {
      if (!closingSection || !closingPin || !closingVideo || !closingNav) return;

      closingTimeline?.kill();
      closingVideoTrigger?.kill();
      if (closingVideoRaf) cancelAnimationFrame(closingVideoRaf);
      closingSplits.forEach((split) => split.revert());
      closingSplits = [];

      closingVideo.pause();
      closingVideo.currentTime = 0.01;

      gsap.set(closingPin, { autoAlpha: 0 });
      gsap.set(closingVideo, {
        opacity: 0,
        scale: 1.08,
        filter: "blur(12px) saturate(0.9)",
      });
      const statementData = closingStatementRefs.current
        .filter(Boolean)
        .map((statement) => {
          const text = statement.querySelector("h2");
          const split = SplitText.create(text, {
            type: "words, chars",
            charsClass: styles.closingChar,
            wordsClass: styles.closingWord,
          });
          closingSplits.push(split);
          return { statement, split };
        });

      gsap.set(closingStatementRefs.current, { opacity: 0 });
      statementData.forEach(({ split }) => {
        // Gentle rise-in: kept subtle so the words stay legible while moving.
        gsap.set(split.chars, {
          autoAlpha: 0,
          yPercent: 100,
          rotationX: -40,
          scale: 0.94,
          filter: "blur(6px)",
          transformOrigin: "50% 70%",
        });
      });
      gsap.set(closingNav, { opacity: 0, y: -18, pointerEvents: "none" });

      closingTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: closingSection,
          start: "top 88%",
          end: "bottom bottom",
          scrub: 0.85,
        },
      });

      closingTimeline
        .to(closingPin, {
          autoAlpha: 1,
          duration: 0.12,
          ease: "power2.out",
        }, 0)
        .to(closingVideo, {
          opacity: 0.68,
          scale: 1.035,
          filter: "blur(0px) saturate(0.92)",
          duration: 0.22,
          ease: "power2.out",
        }, 0)
        .to(
          closingVideo,
          { opacity: 0.5, scale: 1, duration: 0.82, ease: "none" },
          0.2
        );

      statementData.forEach(({ statement, split }, index) => {
        // Each statement owns ~0.26 of the scrubbed timeline: quick rise-in,
        // a LONG readable hold, then a quick exit. The last statement
        // ("Reach out") never exits — it stays as the closing CTA with the nav.
        const start = 0.18 + index * 0.26;
        const isLast = index === statementData.length - 1;
        const centerOut = {
          each: 0.002,
          from: "center",
          ease: "power2.out",
        };
        const edgesOut = {
          each: 0.002,
          from: "edges",
          ease: "power2.in",
        };

        closingTimeline
          .set(statement, { opacity: 1 }, start)
          .to(
            split.chars,
            {
              autoAlpha: 1,
              yPercent: 0,
              rotationX: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.06,
              stagger: centerOut,
              ease: "expo.out",
            },
            start
          );

        if (!isLast) {
          closingTimeline
            .to(
              split.chars,
              {
                autoAlpha: 0,
                yPercent: -80,
                rotationX: 36,
                scale: 1.04,
                filter: "blur(6px)",
                duration: 0.05,
                stagger: edgesOut,
                ease: "power3.in",
              },
              start + 0.18
            )
            .set(statement, { opacity: 0 }, start + 0.25);
        }
      });

      closingTimeline.to(
        closingNav,
        {
          opacity: 1,
          y: 0,
          pointerEvents: "auto",
          duration: 0.18,
          ease: "power2.out",
        },
        0.93
      );

      const safeDuration = Math.max((closingVideo.duration || 1) - 0.04, 0.01);
      const seekClosingVideo = () => {
        closingVideo.currentTime = closingVideoTargetTime;
        closingVideoRaf = null;
      };

      closingVideoTrigger = ScrollTrigger.create({
        trigger: closingSection,
        start: "top 88%",
        end: "bottom bottom",
        scrub: 0.45,
        onUpdate: (self) => {
          closingVideoTargetTime = 0.01 + self.progress * safeDuration;

          if (!closingVideoRaf) {
            closingVideoRaf = requestAnimationFrame(seekClosingVideo);
          }
        },
      });
    };

    if (closingVideo) {
      if (closingVideo.readyState >= 1) {
        wireClosingSequence();
      } else {
        closingVideo.addEventListener("loadedmetadata", wireClosingSequence, { once: true });
      }
    }

    // ── Phase 1: parallax text at 1.8× scroll speed ─────────
    // p1Section is 60vh. Natural scroll = 60vh.
    // GSAP adds -48vh extra → total visual movement = 1.8 × 60vh.
    // Text exits viewport at ~50vh, so Phase 2 starts almost immediately after.
    gsap.to(parallaxTextRef.current, {
      y: "-48vh",
      ease: "none",
      scrollTrigger: {
        trigger: p1SectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // ── Phase 2-4: iris-close via clip-path + text converge ──
    //
    // The hero background (position: fixed, full viewport) has its
    // clip-path inset() shrunk on all 4 sides as the user scrolls.
    // Body background is #000, so everything OUTSIDE the shrinking
    // clip window reads as solid black — covering from all 4 edges.
    //
    // Left/right close faster (reach 50% at p=0.65).
    // Top/bottom close slower (reach 50% at p=0.80).
    // At p=1 → inset(50% 50% 50% 50%) = fully covered.

    ScrollTrigger.create({
      trigger: p2SectionRef.current,
      start: "top top",
      end: "bottom top",
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;

        const lr = Math.min(p / 0.65, 1) * 50;   // left/right inset %
        const tb = Math.min(p / 0.80, 1) * 50;   // top/bottom inset %

        gsap.set(heroImageRef.current, {
          clipPath: `inset(${tb.toFixed(2)}% ${lr.toFixed(2)}% ${tb.toFixed(2)}% ${lr.toFixed(2)}%)`,
        });

        // "Sketch it" / "Into Systems" sit in the black side bands revealed by the
        // shrinking video, then meet at center when the video is fully closed.
        // No opacity fade on exit — the curtain wipe handles that (see below).
        const textOpacity = p >= 0.12 ? 1 : 0;
        const sideEdge = 100 - lr;

        gsap.set(makeItRef.current, {
          opacity: textOpacity,
          x: 0,
          right: `${sideEdge.toFixed(2)}%`,
        });
        gsap.set(matterRef.current, {
          opacity: textOpacity,
          x: 0,
          left: `${sideEdge.toFixed(2)}%`,
        });
      },
    });

    // ── Curtain wipe over "Sketch it" / "Into Systems" ───────
    // Fires the moment p5Container's top edge enters the viewport.
    // A #000 rectangle sweeps left→right over each word, very fast,
    // while Phase 5 texts are simultaneously beginning to rise in.
    // Scrolling back up resets the curtains so the texts re-appear.
    ScrollTrigger.create({
      trigger: p5ContainerRef.current,
      start: "top 100%", // p5Container just enters the viewport bottom
      onEnter: () => {
        gsap.to([makeItCurtainRef.current, matterCurtainRef.current], {
          scaleX: 1,
          duration: 0.35,
          ease: "power3.in",
          stagger: 0.05,
        });
      },
      onLeaveBack: () => {
        gsap.to([makeItCurtainRef.current, matterCurtainRef.current], {
          scaleX: 0,
          duration: 0.25,
          ease: "power3.out",
          stagger: 0,
        });
      },
    });

    // ── Phase 5: sequential reveal + focus spotlight ─────────
    // Each skill rises into view on scroll. The item entering the focus zone
    // turns white; all previously revealed items dim to #939393.
    // Scrolling back up reverses: the item re-entering focus from above turns
    // white and the one that just left the focus zone dims again.

    const revealedSet = new Set();

    function setActiveSkill(index) {
      skillRefs.current.forEach((el, i) => {
        if (!el || !revealedSet.has(i)) return;
        gsap.to(el, {
          color: i === index ? "#f5f2ea" : "#9a9a9a",
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    }

    // Label reveal (no spotlight logic needed — it's a static label)
    gsap.set(p5LabelRef.current, { y: "100%" });
    ScrollTrigger.create({
      trigger: p5LabelRef.current,
      start: "top 85%",
      onEnter: () =>
        gsap.to(p5LabelRef.current, { y: "0%", duration: 0.7, ease: "power3.out" }),
    });

    // Skill items — trigger on the wrapper div (overflow:hidden), not the h1,
    // because the h1 starts translated 100% down outside its clip boundary.
    skillRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { y: "100%" }); // color starts as #939393 from CSS

      const wrapper = el.parentElement; // .p5ItemWrap

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top 75%",

        // Scrolling DOWN into this item — reveal it and make it active
        onEnter: () => {
          if (!revealedSet.has(i)) {
            revealedSet.add(i);
            gsap.to(el, { y: "0%", duration: 0.9, ease: "power3.out" });
          }
          setActiveSkill(i);
        },

        // Scrolling UP back into this item — it regains focus
        onEnterBack: () => setActiveSkill(i),

        // Scrolling UP past this item — give focus back to the one above
        onLeaveBack: () => {
          if (i > 0) setActiveSkill(i - 1);
          else setActiveSkill(-1); // above all items: dim everything
        },
      });
    });

    let mounted = true;

    document.fonts.ready.then(() => {
      if (!mounted) return;
      const rawLines = [
        ...splitIntoLines(para1Ref.current),
        ...splitIntoLines(para2Ref.current),
      ];
      ScrollTrigger.refresh();

      // naturalTop = where the line's top sits at scroll=0 with no GSAP transform.
      // rect.top at any scrollY = naturalTop - 1.8*scrollY (text moves at 1.8× speed).
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const lineData = rawLines.map(({ lineWrap, curtain }) => ({
        curtain,
        naturalTop: lineWrap.getBoundingClientRect().top + 1.8 * sy,
      }));

      // Per-line scrubbed curtain: wipe fires when line reaches 10% from top,
      // completes as the line exits the top edge. Reverses on scroll-back automatically.
      lineData.forEach(({ curtain, naturalTop }) => {
        const sStart = (naturalTop - 0.1 * vh) / 1.8; // scroll px where line hits 10% mark
        const sEnd   = naturalTop / 1.8;               // scroll px where line exits top
        if (sEnd <= 0) return;
        gsap.to(curtain, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: p1SectionRef.current,
            start: `top+=${Math.max(0, sStart).toFixed(0)}px top`,
            end:   `top+=${Math.min(0.6 * vh, sEnd).toFixed(0)}px top`,
            scrub: true,
          },
        });
      });
    });

    return () => {
      mounted = false;
      clearTimeout(pauseHeroVideoTimeout);
      if (focusSketchRaf) cancelAnimationFrame(focusSketchRaf);
      if (closingVideoRaf) cancelAnimationFrame(closingVideoRaf);
      closingSplits.forEach((split) => split.revert());
      heroVideo?.removeEventListener("loadedmetadata", wireHeroVideoMotion);
      focusSketchVideo?.removeEventListener("loadedmetadata", wireFocusSketchScrub);
      closingVideo?.removeEventListener("loadedmetadata", wireClosingSequence);
      heroVideoMotion?.kill();
      focusSketchTrigger?.kill();
      closingTimeline?.kill();
      closingVideoTrigger?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (lenis) {
        gsap.ticker.remove(lenisTickFn);
        lenis.destroy();
      }
    };
    } // end init
  }, []);

  return (
    <>
      {/* SVG filter — rough brush-paint edges on the parallax-text curtains */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <defs>
          <filter id="brush-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="4" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Fixed hero bg — clip-path iris-closes during Phase 2-4 */}
      <div ref={heroImageRef} className={styles.heroImage} aria-hidden="true">
        <video
          ref={heroVideoRef}
          className={styles.aboutHeroVideo}
          src={ABOUT_SCENE_VIDEO}
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className={styles.aboutHeroVideoShade} />
      </div>

      {/* ── Phase 1: Parallax about text ───────────────────── */}
      <section ref={p1SectionRef} className={styles.p1Section}>
        <div ref={parallaxTextRef} className={styles.p1Content}>
          <div className={`${styles.aboutCol} ${styles.aboutColLeft}`} />
          <div className={`${styles.aboutCol} ${styles.aboutColRight}`}>
            <div className={styles.infoBlock}>
              <div ref={para1Ref} className={styles.aboutDescription}>
                <span className={styles.labelWhoAmI}>Who am I.</span>
                Based in Lagos, focused on Full-Stack Development and building
                digital products. With experience in React, Node.js, and modern
                web technologies, I craft responsive and high-performing web
                applications. Currently working independently, partnering with
                founders and startups to bring their ideas to life.
              </div>
            </div>
            <div className={`${styles.infoBlock} ${styles.infoBlockBridge}`}>
              <div ref={para2Ref} className={styles.aboutDescription}>
                <span className={styles.labelAbout}>What drives me.</span>
                Clean code, sharp interfaces, and meaningful user experiences.
                I embed myself in every project's purpose and the people behind
                it, translating ideas into products that perform and feel right.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Phase 2-4: scroll spacer — drives the iris close ── */}
      <div ref={p2SectionRef} className={styles.p2Section} aria-hidden="true" />

      {/* "Sketch it" — wrapper is fixed; curtain sweeps left→right on exit */}
      <div ref={makeItRef} className={styles.makeItWrapper} aria-hidden="true">
        <p className={styles.makeItText}>Sketch it</p>
        <div ref={makeItCurtainRef} className={styles.textCurtain} />
      </div>

      {/* "Into Systems" — same pattern */}
      <div ref={matterRef} className={styles.matterWrapper} aria-hidden="true">
        <p className={styles.matterText}>Into Systems</p>
        <div ref={matterCurtainRef} className={styles.textCurtain} />
      </div>

      {/* ── Phase 5: sequential text reveal ── */}
      <div ref={p5ContainerRef} className={styles.p5Container}>
        <div ref={focusSketchLayerRef} className={styles.focusSketchLayer} aria-hidden="true">
          <video
            ref={focusSketchVideoRef}
            className={styles.focusSketchVideo}
            src={FOCUS_SKETCH_VIDEO}
            muted
            playsInline
            preload="metadata"
          />
          <div className={styles.focusSketchShade} />
        </div>
        <div className={styles.p5LabelWrap}>
          <p ref={p5LabelRef} className={styles.p5Label}>Areas of Focus</p>
        </div>
        {skills.map((skill, i) => (
          <div key={skill} className={styles.p5ItemWrap}>
            <h1
              ref={(el) => { skillRefs.current[i] = el; }}
              className={styles.skillTitle}
            >
              {skill}
            </h1>
          </div>
        ))}
      </div>

      <section ref={closingSectionRef} className={styles.closingSection}>
        <div ref={closingPinRef} className={styles.closingPin}>
          <video
            ref={closingVideoRef}
            className={styles.closingVideo}
            src={CLOSING_VIDEO}
            muted
            playsInline
            preload="metadata"
          />
          <div className={styles.closingShade} />

          <div className={styles.closingStatements}>
            {closingStatements.map((statement, index) => (
              <div
                key={statement}
                ref={(el) => { closingStatementRefs.current[index] = el; }}
                className={styles.closingStatement}
              >
                <h2 className={styles.closingStatementText}>{statement}</h2>
              </div>
            ))}
          </div>

          <header ref={closingNavRef} className={styles.closingNav}>
            <nav className={styles.closingNavInner} aria-label="Closing navigation">
              <a href="/" className={styles.closingLogo}>YINKA.KLW</a>
              <div className={styles.closingLinks}>
                {closingNavLinks.map(([label, href]) => (
                  <ClosingRollLink
                    key={label}
                    label={label}
                    href={href}
                    active={label === "About"}
                  />
                ))}
              </div>
            </nav>
          </header>
        </div>
      </section>
    </>
  );
}
