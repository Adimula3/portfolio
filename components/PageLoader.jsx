"use client";

import { useEffect, useRef } from "react";
import styles from "./PageLoader.module.css";
import { prefersReducedMotion, prefetchAnimationEngine } from "./animationUtils";

// 7 vivid colors, then a scaled preview of the real landing hero.
const COLORS = [
  "#FF3B3B",
  "#FF8C00",
  "#FFE600",
  "#00C853",
  "#00B0FF",
  "#AA00FF",
  "#FF006E",
];

// Timing breakdown (all under 2 s):
//   Panels 0-6 wipe:  7 × 200 ms = 1 400 ms
//   Panel 7 (hero):   starts 1 400 ms, ends 1 580 ms
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
    const sx = window.innerWidth / 300;
    const sy = window.innerHeight / 400;
    card.style.setProperty("--sx", sx);
    card.style.setProperty("--sy", sy);
    card.style.setProperty("--preview-sx", 1 / sx);
    card.style.setProperty("--preview-sy", 1 / sy);

    // After the hero-image wipe finishes, expand to full screen.
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
        <div
          className={`${styles.panel} ${styles.heroPanel}`}
          style={{ animationDelay: `${COLORS.length * 200}ms` }}
        >
          <div className={styles.heroPreview} aria-hidden="true">
            <div className="landing__content">
              <div className="landing__left">
                <h1 className="landing__first">YINKA</h1>
                <p className="landing__tagline">
                  <span className="landing__tag-line">CREATIVE FRONT-END DEVELOPER</span>
                  <span className="landing__tag-line">BUILDING UNIQUE DIGITAL EXPERIENCES</span>
                  <span className="landing__tag-line">ONE PIXEL AT A TIME</span>
                </p>
              </div>

              <div className="landing__right">
                <div className="landing__right-group">
                  <h1 className="landing__last">KOLAWOLE</h1>
                  <div className="landing__right-info">
                    <span className="available-pill">
                      AVAILABLE
                      <span className="available-pill__dot" />
                    </span>
                    <nav className="landing__nav">
                      <span className="roll-link">About</span>
                      <span className="roll-link">Email</span>
                      <span className="roll-link">in</span>
                      <span className="roll-link">Meta</span>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
