import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PagedGrid } from "./BrowsePage";

export const SearchResults = ({ query, onPlay, onOpenDetails }) => {
  // Wait until typing pauses before hitting the API
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
        <Search size={22} color="var(--netflix-red)" style={{ flexShrink: 0 }} />
        <h1 className="page__title" style={{ marginBottom: 0 }}>
          Search results for: <span style={{ color: "var(--netflix-light-gray)" }}>"{query}"</span>
        </h1>
      </div>

      <PagedGrid
        url={debouncedQuery ? `/api/search/multi/${encodeURIComponent(debouncedQuery)}` : null}
        onPlay={onPlay}
        onOpenDetails={onOpenDetails}
        emptyTitle={debouncedQuery ? `No titles found matching "${debouncedQuery}"` : "Type a title to search"}
        emptyMessage={debouncedQuery ? "Try different keywords or check the spelling." : undefined}
      />
    </div>
  );
};
