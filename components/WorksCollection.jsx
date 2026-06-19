"use client";

const works = [
  {
    number: "01",
    title: "E-Commerce Store",
    type: "Shopping / Product / Checkout",
    year: "2026",
    summary:
      "A storefront concept for browsing products, comparing details, and moving toward checkout with a clear buying rhythm.",
    media: "/videos/cut_01.mp4",
    tags: ["Product grid", "Cart flow", "Responsive UI"],
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

function WorkMedia({ work }) {
  return (
    <video
      className="work-card__media"
      src={work.media}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
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
                          href="#"
                          className="work-card__arrow"
                          aria-label={`Open ${work.title}`}
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
