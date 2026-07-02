"use client";

import { useState } from "react";
import PageLoader from "./PageLoader";
import Navbar    from "./Navbar";
import Landing   from "./Landing";
import WorksCollection from "./WorksCollection";
import Footer    from "./Footer";

export default function App() {
  // Content is always rendered (so it's in the server HTML for SEO and paints
  // immediately). The loader sits on top as an overlay and lifts when the intro
  // finishes; `introDone` then triggers the landing's entrance reveal.
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <Navbar />
      <main>
        <Landing introDone={introDone} />
        <WorksCollection />
      </main>
      <Footer />

      {!introDone && (
        <PageLoader onComplete={() => setIntroDone(true)} />
      )}
    </>
  );
}
