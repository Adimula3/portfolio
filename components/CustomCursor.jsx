"use client";

// SOURCE: ghuynguyen.md — CUSTOM CURSOR section
// 240×240px circle, mix-blend-mode: difference
// GSAP ticker lerp at 0.12 — smooth lag behind mouse

import { useEffect } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    document.addEventListener("mousemove", onMouseMove);

    // GSAP ticker lerp — factor 0.12 (from ghuynguyen.md cursor section)
    const tickerFn = () => {
      cursorX += (targetX - cursorX) * 0.12;
      cursorY += (targetY - cursorY) * 0.12;
      gsap.set(".smooth-cursor", { x: cursorX, y: cursorY });
    };

    gsap.ticker.add(tickerFn);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(tickerFn);
    };
  }, []);

  return <div className="smooth-cursor" aria-hidden="true" />;
}
