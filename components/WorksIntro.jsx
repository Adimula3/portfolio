"use client";

export default function WorksIntro() {
  return (
    <section className="works-intro" aria-label="Recent work introduction">
      <div className="works-intro__inner">
        <p className="works-intro__eyebrow">Welcome to the</p>

        <div className="works-intro__composition">
          <h2 className="works-intro__word works-intro__collection">
            Collection
          </h2>

          <span className="works-intro__italic works-intro__of">of</span>
          <span className="works-intro__italic works-intro__my">my</span>

          <h2 className="works-intro__word works-intro__recent">Recent</h2>
          <h2 className="works-intro__word works-intro__work">Work</h2>
        </div>
      </div>
    </section>
  );
}
