"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

// Replace these with your real portfolio images when ready
const SLIDE_SRCS = [
  "/images/Hero/1.webp",
  "/images/Hero/2.webp",
  "/images/Hero/3.webp",
  "/images/Hero/4.webp",
];

export default function Preloader({ onDone }) {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    const fill = fillRef.current;
    if (!wrap || !card || !fill) return;

    gsap.registerPlugin(CustomEase);
    // Fast rush-in, slow settle — right feel for clip-path reveals
    CustomEase.create("reveal", "0.77, 0, 0.175, 1");

    const slides = Array.from(card.querySelectorAll(".pl__slide"));

    // clip-path: inset(100% 0 0 0) = clipped entirely from the top edge
    // Animating toward inset(0) reveals the element growing from bottom upward
    gsap.set(slides, { clipPath: "inset(100% 0% 0% 0%)" });

    const tl = gsap.timeline();

    // Each slide bursts in from the bottom, tightly staggered
    slides.forEach((slide, i) => {
      tl.to(
        slide,
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "reveal" },
        i * 0.35
      );
    });

    // After all slides: black fill expands from card position to full viewport
    tl.call(() => {
      const rect = card.getBoundingClientRect();
      const iT   = rect.top;
      const iR   = window.innerWidth  - rect.right;
      const iB   = window.innerHeight - rect.bottom;
      const iL   = rect.left;

      fill.style.display = "block";

      // Start fill exactly at the card's bounding box (rounded corners to match card)
      gsap.set(fill, {
        clipPath: `inset(${iT}px ${iR}px ${iB}px ${iL}px round 4px)`,
      });

      // Expand to cover the entire viewport
      gsap.to(fill, {
        clipPath: "inset(0px 0px 0px 0px round 0px)",
        duration: 0.55,
        ease: "power3.inOut",
        onComplete: () => {
          // Fill and body are both #000 — removing them is seamless
          wrap.style.display = "none";
          fill.style.display = "none";
          if (onDone) onDone();
        },
      });
    });

    return () => { tl.kill(); };
  }, [onDone]);

  return (
    <>
      {/* Fixed overlay — card with stacked image slides */}
      <div ref={wrapRef} className="pl">
        <div ref={cardRef} className="pl__card">
          {SLIDE_SRCS.map((src, i) => (
            <div key={i} className="pl__slide">
              <img
                src={src}
                alt=""
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          ))}

          {/* Black final slide — base for the full-screen expand */}
          <div className="pl__slide pl__slide--black" />
        </div>
      </div>

      {/* Full-screen black fill — clips from card rect then expands to viewport */}
      <div ref={fillRef} className="pl__fill" />
    </>
  );
}
