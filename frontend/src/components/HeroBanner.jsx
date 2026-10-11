import React from "react";
import { Play, Info, Plus, Check, Star } from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";
import { backdropUrl } from "../lib/images";
import { formatRating, getMediaType, getTitle, getYear } from "../lib/media";

export const HeroBanner = ({ item, onPlay, onOpenDetails }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  if (!item) return null;

  const title = getTitle(item);
  const year = getYear(item);
  const rating = formatRating(item.vote_average);
  const backdrop = backdropUrl(item.backdrop_path);
  const isSaved = isInWatchlist(item.id);

  return (
    <div className="hero" style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}>
      {/* Cinematic Gradient Overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, #141414 10%, rgba(20, 20, 20, 0.4) 50%, rgba(20, 20, 20, 0.8) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(20, 20, 20, 0.95) 15%, rgba(20, 20, 20, 0.6) 45%, rgba(20, 20, 20, 0) 80%)",
        }}
      />

      <div className="hero__content">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              color: "var(--netflix-red)",
              fontWeight: "900",
              fontSize: "14px",
              letterSpacing: "3px",
              fontFamily: "var(--font-heading)",
            }}
          >
            N
          </span>
          <span
            style={{
              color: "#e5e5e5",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
            }}
          >
            {getMediaType(item) === "tv" ? "SERIES" : "FILM"}
          </span>
        </div>

        <h1 className="hero__title">{title}</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
          {rating && (
            <span style={{ color: "#46d369", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
              <Star size={14} fill="#46d369" /> {rating}
            </span>
          )}
          {year && <span style={{ color: "var(--netflix-light-gray)" }}>{year}</span>}
        </div>

        {item.overview && <p className="hero__overview">{item.overview}</p>}

        <div className="hero__actions">
          <button className="btn btn--light btn--lg" onClick={() => onPlay(item)}>
            <Play size={20} fill="#000" />
            Play
          </button>

          <button className="btn btn--glass btn--lg" onClick={() => onOpenDetails(item)}>
            <Info size={20} />
            More Info
          </button>

          <button
            className="btn-round"
            onClick={() => toggleWatchlist(item)}
            title={isSaved ? "Remove from My List" : "Add to My List"}
            aria-label={isSaved ? "Remove from My List" : "Add to My List"}
          >
            {isSaved ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
