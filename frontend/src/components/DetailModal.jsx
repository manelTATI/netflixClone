import React, { useEffect } from "react";
import { X, Play, Plus, Check, Star } from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";
import { useApi } from "../hooks/useApi";
import { SmartImage } from "./SmartImage";
import { backdropUrl, posterUrl } from "../lib/images";
import { extractList, formatDate, formatRating, formatRuntime, getMediaType, getReleaseDate, getTitle } from "../lib/media";

export const DetailModal = ({ item, isOpen, onClose, onPlay, onSelect }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const mediaType = getMediaType(item);
  const apiBase = `/api/${mediaType === "tv" ? "tv" : "movies"}`;
  const isActive = Boolean(isOpen && item);

  // The list item already has the basics; the details call adds genres, runtime, etc.
  const details = useApi(isActive ? `${apiBase}/details/${item.id}` : null);
  const similar = useApi(isActive ? `${apiBase}/similar/${item.id}` : null);

  // Close on Escape and stop the page behind the modal from scrolling
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isActive, onClose]);

  if (!isActive) return null;

  const full = { ...item, ...(details.data?.content || {}) };
  const title = getTitle(full);
  const rating = formatRating(full.vote_average);
  const releaseDate = formatDate(getReleaseDate(full));
  const runtime = formatRuntime(full.runtime || full.episode_run_time?.[0]);
  const genres = (full.genres || []).map((genre) => genre.name);
  const similarItems = extractList(similar.data).slice(0, 6);
  const isSaved = isInWatchlist(item.id);

  const facts = [
    ["Release date", releaseDate],
    ["Rating", rating && `${rating} / 10${full.vote_count ? ` (${full.vote_count.toLocaleString()} votes)` : ""}`],
    ["Genres", genres.join(", ")],
    ["Runtime", runtime],
    ["Seasons", full.number_of_seasons],
  ].filter(([, value]) => value);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-up modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Backdrop Banner Header */}
        <div className="modal__banner">
          <SmartImage
            src={backdropUrl(full.backdrop_path)}
            fallbackSrc={posterUrl(full.poster_path)}
            alt={title}
            eager
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(to top, var(--netflix-card) 5%, rgba(24, 24, 24, 0.4) 40%, rgba(0, 0, 0, 0.6) 100%)",
            }}
          />
          <div className="modal__banner-content">
            <h2 className="modal__title">{title}</h2>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <button className="btn btn--light" onClick={() => onPlay(item)}>
                <Play size={18} fill="#000" />
                Watch
              </button>

              <button
                className="btn-round"
                onClick={() => toggleWatchlist(item)}
                aria-label={isSaved ? "Remove from My List" : "Add to My List"}
                title={isSaved ? "Remove from My List" : "Add to My List"}
              >
                {isSaved ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Details Content Body */}
        <div className="modal__body">
          <div className="modal__columns">
            <div>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                {rating && (
                  <span style={{ color: "#46d369", fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Star size={15} fill="#46d369" /> {rating}
                  </span>
                )}
                {getReleaseDate(full) && (
                  <span style={{ color: "var(--netflix-gray)" }}>{getReleaseDate(full).substring(0, 4)}</span>
                )}
                {runtime && <span style={{ color: "var(--netflix-gray)" }}>{runtime}</span>}
                <span style={{ fontSize: "13px", color: "#bbb" }}>{mediaType === "tv" ? "TV Series" : "Movie"}</span>
                {full.free && (
                  <span className="badge badge--free">
                    {mediaType === "tv" ? "Free episodes" : full.short ? "Free short film" : "Free full movie"}
</span>
                )}
              </div>

              {full.tagline && (
                <p style={{ fontStyle: "italic", color: "var(--netflix-light-gray)", marginBottom: "10px" }}>{full.tagline}</p>
              )}

              <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#e5e5e5", marginBottom: "20px" }}>
                {full.overview || "No overview available for this title."}
              </p>
            </div>

            <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {details.loading && (
                <>
                  <div className="skeleton" style={{ height: 14, width: "90%" }} />
                  <div className="skeleton" style={{ height: 14, width: "70%" }} />
                  <div className="skeleton" style={{ height: 14, width: "80%" }} />
                </>
              )}
              {facts.map(([label, value]) => (
                <div key={label}>
                  <span style={{ color: "var(--netflix-gray)" }}>{label}: </span>
                  <span style={{ color: "#fff" }}>{value}</span>
                </div>
              ))}
              {details.error && (
                <div style={{ color: "#ff8a80" }}>
                  Couldn't load full details. {details.error}{" "}
                  <button className="link-button" onClick={details.reload}>
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* More Like This (Similar Items) */}
          {similarItems.length > 0 && (
            <div style={{ marginTop: "36px", borderTop: "1px solid #333", paddingTop: "24px" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
                More Like This
              </h3>
              <div className="similar-grid">
                {similarItems.map((sim) => (
                  <button key={sim.id} className="similar-card" onClick={() => onSelect(sim)}>
                    <div style={{ height: "105px" }}>
                      <SmartImage
                        src={posterUrl(sim.backdrop_path)}
                        fallbackSrc={posterUrl(sim.poster_path)}
                        alt={getTitle(sim)}
                      />
                    </div>
                    <div style={{ padding: "10px" }}>
                      <div className="movie-card__title">{getTitle(sim)}</div>
                      {formatRating(sim.vote_average) && (
                        <div style={{ fontSize: "11px", color: "#46d369", marginTop: "4px" }}>
                          ★ {formatRating(sim.vote_average)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
