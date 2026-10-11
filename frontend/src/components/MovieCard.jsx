import React, { useState } from "react";
import { Play, Plus, Check, ChevronDown, ThumbsUp, Star } from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";
import { SmartImage } from "./SmartImage";
import { posterUrl } from "../lib/images";
import { formatRating, getTitle, getYear } from "../lib/media";

const roundButton = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "rgba(42, 42, 42, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const MovieCard = ({ item, onPlay, onOpenDetails, isLarge = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  if (!item) return null;

  const title = getTitle(item);
  const year = getYear(item);
  const rating = formatRating(item.vote_average);
  const isSaved = isInWatchlist(item.id);

  // Large cards are portrait posters; regular cards are landscape and prefer the backdrop.
  // The w500 size is plenty for a card, for posters and backdrops alike.
  const poster = posterUrl(item.poster_path);
  const backdrop = posterUrl(item.backdrop_path);

  return (
    <div
      className={`movie-card ${isLarge ? "movie-card--large" : ""} ${isHovered ? "is-hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SmartImage
        src={isLarge ? poster : backdrop}
        fallbackSrc={isLarge ? backdrop : poster}
        alt={title}
        onClick={() => onOpenDetails(item)}
      />

      {item.free && (
        <span className="badge badge--free movie-card__badge">
          {item.media_type === "tv" ? "Free episodes" : item.short ? "Free short film" : "Free full movie"}
        </span>
      )}

      {/* Hover Information Overlay */}
      {isHovered && (
        <div className="animate-fade-in movie-card__overlay">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                aria-label={`Watch ${title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(item);
                }}
                style={{ ...roundButton, backgroundColor: "#ffffff", border: "none", color: "#000" }}
              >
                <Play size={14} fill="#000" />
              </button>

              <button
                aria-label={isSaved ? "Remove from My List" : "Add to My List"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(item);
                }}
                style={roundButton}
              >
                {isSaved ? <Check size={14} /> : <Plus size={14} />}
              </button>

              <button
                aria-label="Like"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked((prev) => !prev);
                }}
                style={{
                  ...roundButton,
                  border: isLiked ? "1px solid #46d369" : roundButton.border,
                  color: isLiked ? "#46d369" : "#ffffff",
                }}
              >
                <ThumbsUp size={13} fill={isLiked ? "#46d369" : "none"} />
              </button>
            </div>

            <button
              aria-label={`More info about ${title}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(item);
              }}
              style={roundButton}
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
            {rating && (
              <span style={{ color: "#46d369", fontWeight: "700", display: "flex", alignItems: "center", gap: "3px" }}>
                <Star size={11} fill="#46d369" /> {rating}
              </span>
            )}
            {year && <span style={{ color: "#aaa" }}>{year}</span>}
          </div>

          <div className="movie-card__title">{title}</div>
        </div>
      )}
    </div>
  );
};
