"use client";

import { useEffect, useState } from "react";
import AboutTransition from "./AboutTransition";
import AboutContent from "./AboutContent";

export default function AboutPage() {
  const [phase, setPhase] = useState("carve");

  // Set dark body bg immediately so there's no white flash at any phase
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#0f0f0f";
    return () => { document.body.style.background = prev; };
  }, []);

  return (
    <>
      {phase === "carve" && (
        <AboutTransition onComplete={() => setPhase("content")} />
      )}
      {phase === "content" && <AboutContent />}
    </>
  );
}
