import React from "react";
import { ArrowLeft, Film } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { GridSkeleton } from "./Skeletons";
import { StatusMessage } from "./StatusMessage";
import { usePagedList } from "../hooks/usePagedList";

/** Grid of titles with "Load more". Used by "Explore All" pages and by search. */
export const PagedGrid = ({ url, onPlay, onOpenDetails, emptyTitle, emptyMessage }) => {
  const { items, loading, error, hasMore, loadMore, retry } = usePagedList(url);

  if (items.length === 0) {
    if (loading) return <GridSkeleton />;
    if (error) return <StatusMessage title="Something went wrong" message={error} actionLabel="Try again" onAction={retry} />;
    return <StatusMessage icon={<Film size={40} />} title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <>
      <div className="card-grid">
        {items.map((item) => (
          <MovieCard key={`${item.media_type}-${item.id}`} item={item} onPlay={onPlay} onOpenDetails={onOpenDetails} />
        ))}
      </div>

      <div className="load-more">
        {error && <p style={{ color: "#ff8a80", marginBottom: "12px" }}>{error}</p>}
        {(hasMore || error) && (
          <button className="btn btn--glass btn--lg" onClick={error ? retry : loadMore} disabled={loading}>
            {loading ? "Loading..." : error ? "Try again" : "Load more"}
          </button>
        )}
      </div>
    </>
  );
};

export const BrowsePage = ({ title, url, onBack, onPlay, onOpenDetails }) => (
  <div className="page">
    <button className="link-button watch-back" onClick={onBack}>
      <ArrowLeft size={18} /> Back to browse
    </button>
    <h1 className="page__title">{title}</h1>
    <PagedGrid
      url={url}
      onPlay={onPlay}
      onOpenDetails={onOpenDetails}
      emptyTitle="Nothing here yet"
      emptyMessage="There are no titles in this category right now."
    />
  </div>
);
