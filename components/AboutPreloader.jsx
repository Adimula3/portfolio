"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "@/app/about/about.module.css";

export default function AboutPreloader({ onComplete }) {
  const wrapperRef  = useRef(null);
  const counterRef  = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const wrapper  = wrapperRef.current;
    const counterEl = counterRef.current;
    const progressEl = progressRef.current;
    if (!wrapper || !counterEl || !progressEl) return;

    const obj = { value: 0 };
    const tl  = gsap.timeline();

    // Counter 0→100 and progress bar scaleX in sync
    tl.to(obj, {
        value: 100,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => {
          counterEl.textContent = Math.floor(obj.value) + "%";
        },
      })
      .to(progressEl, {
        scaleX: 1,
        duration: 1.5,
        ease: "power3.inOut",
      }, "<")
      // Brief pause at 100%, then fade out
      .to(wrapper, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete,
      }, "+=0.15");

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div ref={wrapperRef} className={styles.aboutPreloader}>
      <div className={styles.preloaderCounter}>
        <h1 ref={counterRef}>0%</h1>
      </div>
      <div className={styles.preloaderProgressBar}>
        <div ref={progressRef} className={styles.preloaderProgress} />
      </div>
    </div>
  );
}
