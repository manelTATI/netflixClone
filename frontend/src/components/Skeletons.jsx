import React from "react";

/** Placeholder for a carousel row while its titles load. */
export const RowSkeleton = ({ isLarge = false, count = 8 }) => (
  <div
    className={`row-scroller hide-scrollbar ${isLarge ? "row-scroller--large" : ""}`}
    style={{ overflow: "hidden" }}
    aria-hidden="true"
  >
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={`movie-card skeleton ${isLarge ? "movie-card--large" : ""}`} />
    ))}
  </div>
);

/** Placeholder for a grid page (search, explore all). */
export const GridSkeleton = ({ count = 12 }) => (
  <div className="card-grid" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="movie-card skeleton" />
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="hero" aria-hidden="true">
    <div className="hero__content">
      <div className="skeleton" style={{ height: 48, width: "70%" }} />
      <div className="skeleton" style={{ height: 16, width: "40%" }} />
      <div className="skeleton" style={{ height: 60, width: "100%" }} />
      <div className="skeleton" style={{ height: 44, width: 240 }} />
    </div>
  </div>
);
