"use client";

import { useEffect, useRef } from "react";
import styles from "./PageLoader.module.css";
import { prefersReducedMotion, prefetchAnimationEngine } from "./animationUtils";

// 7 vivid colors + final black
const COLORS = [
  "#FF3B3B",
  "#FF8C00",
  "#FFE600",
  "#00C853",
  "#00B0FF",
  "#AA00FF",
  "#FF006E",
  "#050505",
];

// Timing breakdown (all under 2 s):
//   Panels 0-6 wipe:  7 × 200 ms = 1 400 ms
//   Panel 7 (black):  starts 1 400 ms, ends 1 580 ms
//   Expansion:        starts 1 580 ms, ends 1 980 ms

export default function PageLoader({ onComplete }) {
  const wrapperRef = useRef(null);
  const cardRef    = useRef(null);

  useEffect(() => {
    const card    = cardRef.current;
    const wrapper = wrapperRef.current;
    if (!card || !wrapper) return;

    // Reduced motion: skip the colour wipe entirely, hand off almost at once.
    if (prefersReducedMotion()) {
      const t = setTimeout(() => onComplete && onComplete(), 250);
      return () => clearTimeout(t);
    }

    // Warm the animation-engine chunk while the loader plays, so the landing's
    // entrance fires instantly the moment we hand off.
    prefetchAnimationEngine();

    // Scale factors so the card covers 100vw × 100vh exactly
    card.style.setProperty("--sx", window.innerWidth  / 300);
    card.style.setProperty("--sy", window.innerHeight / 400);

    // After black wipe finishes → expand to full screen
    const t1 = setTimeout(() => card.classList.add(styles.expanding), 1580);

    // Hand off after the expansion finishes — but also wait for fonts so the
    // landing text can't reflow the instant it appears. fonts.ready usually
    // resolves long before 1990ms, so this only adds time in the worst case.
    let t2;
    const handoff = () => {
      const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
      fontsReady.finally(() => onComplete && onComplete());
    };
    t2 = setTimeout(handoff, 1990);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={cardRef} className={styles.card}>
        {COLORS.map((color, i) => (
          <div
            key={i}
            className={styles.panel}
            style={{
              backgroundColor: color,
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
