"use client";

import { useState } from "react";
import PageLoader from "./PageLoader";
import Navbar    from "./Navbar";
import Landing   from "./Landing";
import WorksCollection from "./WorksCollection";

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <>
      {!ready && (
        <PageLoader onComplete={() => setReady(true)} />
      )}

      <Navbar />
      <main>
        <Landing />
        <WorksCollection />
      </main>
    </>
  );
}
