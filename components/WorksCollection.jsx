"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./animationUtils";

const works = [
  {
    number: "01",
    title: "Helpers Academic",
    type: "Academic / Coaching / Support",
    year: "2026",
    summary:
      "A live academic support platform where students get an instant quote, browse subject-specialist services, and move from brief to delivery through a clear, guided flow.",
    media: "/videos/helpers.mp4",
    link: "https://helpers-academic.vercel.app/",
    tags: ["Instant quote", "Service flow", "Responsive UI"],
  },
  {
    number: "02",
    title: "Charity Website",
    type: "Mission / Donation / Trust",
    year: "2025",
    summary:
      "A public-facing site structure for explaining impact, guiding people through the mission, and making support feel simple.",
    media: "/videos/cut_02.mp4",
    tags: ["Story pages", "Donation CTA", "Content system"],
  },
  {
    number: "03",
    title: "Travel Website",
    type: "Destination / Booking / Editorial",
    year: "2025",
    summary:
      "A visual travel experience for exploring places, scanning packages, and building desire before the external click.",
    media: "/videos/cut_03.mp4",
    tags: ["Destination cards", "Search UI", "Editorial flow"],
  },
  {
    number: "04",
    title: "Shoe Website",
    type: "Fashion / Drop / Product",
    year: "2024",
    summary:
      "A launch-style product page built around drop energy, confident product framing, and fast detail discovery.",
    media: "/videos/cut_04.mp4",
    tags: ["Product reveal", "Motion", "Drop page"],
  },
  {
    number: "05",
    title: "Creative Build",
    type: "Experiment / Prototype / Interface",
    year: "2024",
    summary:
      "A looser frontend prototype for testing layout ideas, interaction moments, and expressive portfolio mechanics.",
    media: "/videos/cut_05.mp4",
    tags: ["Prototype", "Interaction", "Frontend"],
  },
];

// Videos are not loaded or played up front. An IntersectionObserver starts a
// clip only when its card scrolls into view (and pauses it when it leaves), so
// the five cards never download/decode at once and compete with first paint.
function WorkMedia({ work }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduced = prefersReducedMotion();

    const load = () => {
      if (video.preload !== "auto") {
        video.preload = "auto";
        video.load();
      }
    };

    // No IntersectionObserver support → just load + play so nothing is missing.
    if (typeof IntersectionObserver === "undefined") {
      load();
      if (!reduced) video.play().catch(() => {});
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            load();
            // Reduced motion: load the first frame but don't autoplay the loop.
            if (!reduced) video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25, rootMargin: "200px 0px" }
    );

    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className="work-card__media"
      src={work.media}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}

export default function WorksCollection() {
  const rows = Array.from({ length: Math.ceil(works.length / 2) }, (_, rowIndex) =>
    works.slice(rowIndex * 2, rowIndex * 2 + 2)
  );

  return (
    <section className="works-collection" aria-label="Recent work">
      <div className="works-collection__grid">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="work-card-row">
            {row.map((work, index) => {
              const workIndex = rowIndex * 2 + index;

              return (
                <article key={work.title} className="work-card">
                  <WorkMedia work={work} />
                  <div className="work-card__shade" />
                  <div className="work-card__blur" />

                  {workIndex === 0 && <span className="work-card__badge">New</span>}

                  <div className="work-card__content">
                    <div className="work-card__content-inner">
                      <div className="work-card__top">
                        <div>
                          <p className="work-card__meta">
                            {work.number} / {work.year}
                          </p>
                          <h3 className="work-card__title">{work.title}</h3>
                        </div>

                        <a
                          href={work.link || "#"}
                          className="work-card__arrow"
                          aria-label={`Open ${work.title}`}
                          {...(work.link
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          <span aria-hidden="true">↗</span>
                        </a>
                      </div>

                      <div className="work-card__details">
                        <p className="work-card__type">{work.type}</p>
                        <p className="work-card__summary">{work.summary}</p>
                        <div className="work-card__tags" aria-label={`${work.title} tags`}>
                          {work.tags.map((tag) => (
                            <span key={tag} className="work-card__tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
