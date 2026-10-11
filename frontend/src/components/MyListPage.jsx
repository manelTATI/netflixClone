import React from "react";
import { MovieCard } from "./MovieCard";
import { useWatchlist } from "../context/WatchlistContext";
import { Bookmark, Film } from "lucide-react";

export const MyListPage = ({ onPlay, onOpenDetails, onExploreHome }) => {
  const { watchlist } = useWatchlist();

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <Bookmark size={26} color="var(--netflix-red)" />
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: "700", color: "#ffffff" }}>
          My List
        </h1>
        <span style={{ color: "var(--netflix-gray)", fontSize: "14px" }}>
          ({watchlist.length} {watchlist.length === 1 ? "title" : "titles"})
        </span>
      </div>

      {watchlist.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "80px",
            textAlign: "center",
            color: "var(--netflix-gray)",
          }}
        >
          <Film size={54} style={{ marginBottom: "16px", opacity: 0.4 }} />
          <h3 style={{ color: "#ffffff", fontSize: "20px", marginBottom: "8px" }}>
            You haven't added any titles to your list yet.
          </h3>
          <p style={{ maxWidth: "450px", fontSize: "14px", lineHeight: 1.5, marginBottom: "24px" }}>
            Browse movies and TV shows, then click the plus button on any title to save it here for later.
          </p>
          <button
            onClick={onExploreHome}
            style={{
              backgroundColor: "var(--netflix-red)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "14px",
              padding: "10px 24px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Explore Movies & TV
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {watchlist.map((item) => (
            <MovieCard key={item.id} item={item} onPlay={onPlay} onOpenDetails={onOpenDetails} />
          ))}
        </div>
      )}
    </div>
  );
};
