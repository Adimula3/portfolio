"use client";

import { useEffect, useState } from "react";
import AboutTransition from "./AboutTransition";
import AboutContent from "./AboutContent";

export default function AboutPage() {
  // Content is always rendered (server HTML for SEO, instant paint). The
  // carve transition is a fixed opaque overlay (z-index 3000) that plays on
  // top, then lifts — same pattern as the homepage loader.
  const [carving, setCarving] = useState(true);

  // Set dark body bg immediately so there's no white flash at any phase
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#050505";
    return () => { document.body.style.background = prev; };
  }, []);

  // Lock scrolling while the carve plays so the page underneath can't move.
  useEffect(() => {
    if (!carving) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [carving]);

  return (
    <>
      <AboutContent />
      {carving && (
        <AboutTransition onComplete={() => setCarving(false)} />
      )}
    </>
  );
}
