"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import styles from "@/app/about/about.module.css";

const ABOUT_SCENE_VIDEO = "/videos/about-scene-01.mp4";
const ABOUT_SCENE_POSTER = "/video-posters/about-scene-01.jpg";

export default function AboutTransition({ onComplete }) {
  const carveRef  = useRef(null);
  const cardRef   = useRef(null);
  const intoRef   = useRef(null);
  const memoryRef = useRef(null);
  const expandRef = useRef(null);
  const cardVideoRef = useRef(null);
  const expandVideoRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(CustomEase);
    // Same "hop" ease as victorfuruya.com card→fullscreen reveal
    CustomEase.create("hop", "0.9, 0, 0.1, 1");

    const carve  = carveRef.current;
    const card   = cardRef.current;
    const into   = intoRef.current;
    const memory = memoryRef.current;
    const expand = expandRef.current;
    if (!carve || !card || !into || !memory || !expand) return;

    [cardVideoRef.current, expandVideoRef.current].forEach((video) => {
      if (!video) return;
      video.pause();
      video.currentTime = 0.01;
    });

    // Initial states
    gsap.set(carve,  { opacity: 0, y: 14 });
    gsap.set(memory, { opacity: 0, y: 14 });
    gsap.set(into,   { opacity: 0 });
    // Card: collapsed to bottom edge (clip-path wipe upward on reveal)
    gsap.set(card,   { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" });
    // Expand overlay adopts the card's exact bounds before growing to avoid a crop jump.
    gsap.set(expand, {
      opacity: 0,
      left: "50%",
      top: "50%",
      right: "auto",
      bottom: "auto",
      width: 1,
      height: 1,
    });

    const tl = gsap.timeline();

    // 1. "Behind" — fast upward reveal
    tl.to(carve, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" })
    // 2. Card wipes upward from bottom
      .to(card, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.65, ease: "power3.inOut",
        }, "-=0.15")
    // 3. "the" fades in on the card
      .to(into, { opacity: 1, duration: 0.22, ease: "power2.out" }, "-=0.3")
    // 4. "Screen" — same fast reveal
      .to(memory, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, "-=0.2")
    // 5. Pause — let composition read, then snap overlay to card bounds
      .add(() => {
          const r  = cardRef.current.getBoundingClientRect();
          gsap.set(expand, {
            opacity: 1,
            left: r.left,
            top: r.top,
            right: "auto",
            bottom: "auto",
            width: r.width,
            height: r.height,
          });
          gsap.set(card, { opacity: 0 });
        }, "+=0.5")
    // 6. Three things fire at the same moment:
    //    a) Overlay expands card → full screen
    //    b) "Behind" slides right toward center and fades out
    //    c) "Screen" slides left toward center and fades out
      .to(expand, {
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          duration: 1.4,
          ease: "hop",
          onComplete,
        })
      .to(carve, {
          x: "22vw",
          opacity: 0,
          duration: 1.1,
          ease: "power3.in",
        }, "<")
      .to(memory, {
          x: "-22vw",
          opacity: 0,
          duration: 1.1,
          ease: "power3.in",
        }, "<");

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div className={styles.carveWrapper}>

      {/* ── Composition row: "Behind" | card | "Screen" ── */}
      <div className={styles.carveContent}>

        <div className={styles.carveSideLeft}>
          <p ref={carveRef} className={styles.carveText}>Behind</p>
        </div>

        {/* Centre card — video replaces the previous dark placeholder */}
        <div ref={cardRef} className={styles.carveCard}>
          <video
            ref={cardVideoRef}
            className={styles.carveVideo}
            src={ABOUT_SCENE_VIDEO}
            poster={ABOUT_SCENE_POSTER}
            muted
            playsInline
            preload="metadata"
          />
          <div className={styles.carveVideoShade} aria-hidden="true" />
          <p ref={intoRef} className={styles.carveInto}>the</p>
        </div>

        <div className={styles.carveSideRight}>
          <p ref={memoryRef} className={styles.carveText}>Screen</p>
        </div>

      </div>

      {/* Full-screen dark overlay — expands from card bounds */}
      <div ref={expandRef} className={styles.carveExpand} aria-hidden="true">
        <video
          ref={expandVideoRef}
          className={styles.carveVideo}
          src={ABOUT_SCENE_VIDEO}
          poster={ABOUT_SCENE_POSTER}
          muted
          playsInline
          preload="metadata"
        />
        <div className={styles.carveExpandShade} />
      </div>

    </div>
  );
}
