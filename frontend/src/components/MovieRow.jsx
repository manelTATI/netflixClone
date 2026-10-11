import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { RowSkeleton } from "./Skeletons";
import { StatusMessage } from "./StatusMessage";
import { useApi } from "../hooks/useApi";
import { extractList } from "../lib/media";

const RowTitle = ({ title, onExplore }) => (
  <h2 className="row-title">
    {title}
    {onExplore && (
      <button className="row-title__explore" onClick={onExplore}>
        Explore All &gt;
      </button>
    )}
  </h2>
);

export const MovieRow = ({ title, items = [], onPlay, onOpenDetails, onExplore, isLarge = false }) => {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const updateArrows = () => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  // Only show the arrows when the row actually overflows
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const handleScroll = (direction) => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="row">
      <RowTitle title={title} onExplore={onExplore} />

      <div style={{ position: "relative" }}>
        {showLeftArrow && (
          <button className="row-arrow row-arrow--left" aria-label="Scroll left" onClick={() => handleScroll("left")}>
            <ChevronLeft size={30} />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={updateArrows}
          className={`row-scroller hide-scrollbar ${isLarge ? "row-scroller--large" : ""}`}
        >
          {items.map((item) => (
            <MovieCard
              key={`${item.media_type || "item"}-${item.id}`}
              item={item}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              isLarge={isLarge}
            />
          ))}
        </div>

        {showRightArrow && (
          <button className="row-arrow row-arrow--right" aria-label="Scroll right" onClick={() => handleScroll("right")}>
            <ChevronRight size={30} />
          </button>
        )}
      </div>
    </section>
  );
};

/** A row that loads its own titles from an API endpoint, with skeleton and error states. */
export const CatalogRow = ({ title, url, ...rowProps }) => {
  const { data, loading, error, reload } = useApi(url);

  if (loading) {
    return (
      <section className="row">
        <RowTitle title={title} />
        <RowSkeleton isLarge={rowProps.isLarge} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="row">
        <RowTitle title={title} />
        <StatusMessage compact title={`Couldn't load "${title}"`} message={error} actionLabel="Retry" onAction={reload} />
      </section>
    );
  }

  return <MovieRow title={title} items={extractList(data)} {...rowProps} />;
};
