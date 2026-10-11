import React, { useCallback, useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { MovieRow, CatalogRow } from "./components/MovieRow";
import { DetailModal } from "./components/DetailModal";
import { AuthModal } from "./components/AuthModal";
import { MyListPage } from "./components/MyListPage";
import { SearchResults } from "./components/SearchResults";
import { WatchPage } from "./components/WatchPage";
import { BrowsePage } from "./components/BrowsePage";
import { HeroSkeleton } from "./components/Skeletons";
import { StatusMessage } from "./components/StatusMessage";
import { Footer } from "./components/Footer";
import { useWatchlist } from "./context/WatchlistContext";
import { useApi } from "./hooks/useApi";
import { navigate, useHashRoute } from "./hooks/useHashRoute";
import { getMediaType } from "./lib/media";

// Free feature films that play in full on this site, grouped by kind
const FREE_GENRE_ROWS = [
  { title: "Free Movies: Horror & Sci-Fi", path: "movies/free/horror", isLarge: true },
  { title: "Free Movies: Crime & Film Noir", path: "movies/free/noir", isLarge: true },
  { title: "Free Movies: Comedy, Drama & Family", path: "movies/free/comedy", isLarge: true },
  { title: "Free Movies: Westerns & Adventure", path: "movies/free/western", isLarge: true },
  { title: "Free Movies: Silent Classics", path: "movies/free/silent", isLarge: true },
  { title: "Free Movies: Modern Independent", path: "movies/free/modern", isLarge: true },
];

// Rows shown on each tab. `path` is both the API path (/api/<path>) and the
// "Explore All" page address (#/browse/<path>).
const ROWS = {
  home: [
    { title: "Trending Now", path: "movies/trending" },
    { title: "Watch Free: Full Movies", path: "movies/free", isLarge: true },
    ...FREE_GENRE_ROWS,
    { title: "Watch Free: Series", path: "tv/free", isLarge: true },
    { title: "Watch Free: Short Films (3-15 min)", path: "movies/free-shorts" },
    // Free on other legitimate services (Tubi, Pluto TV, ...); these open on that service
    { title: "Free Anime Series", path: "tv/anime-free", isLarge: true },
    { title: "New Free Anime Series", path: "tv/anime-free-new" },
    { title: "Free Anime Movies", path: "movies/anime-free" },
    { title: "Marvel Movies Free With Ads Elsewhere", path: "movies/marvel-free" },
    { title: "Marvel Series Free With Ads Elsewhere", path: "tv/marvel-free" },
    { title: "New Movies Free With Ads Elsewhere", path: "movies/streaming-free-new" },
    { title: "Popular Movies Free With Ads Elsewhere", path: "movies/streaming-free" },
    { title: "Series Free With Ads Elsewhere", path: "tv/streaming-free" },
    { title: "Popular Movies", path: "movies/popular" },
    { title: "Top Rated Movies", path: "movies/top_rated" },
    { title: "Trending Series", path: "tv/trending", isLarge: true },
  ],
  movies: [
    { title: "Blockbuster Movies", path: "movies/trending" },
    { title: "Top Rated Movies", path: "movies/top_rated", isLarge: true },
    { title: "Popular Right Now", path: "movies/popular" },
    { title: "In Theaters", path: "movies/now_playing" },
    { title: "Coming Soon", path: "movies/upcoming" },
    { title: "Watch Free: Full Movies", path: "movies/free", isLarge: true },
    ...FREE_GENRE_ROWS,
    { title: "Watch Free: Short Films (3-15 min)", path: "movies/free-shorts" },
    { title: "New Movies Free With Ads Elsewhere", path: "movies/streaming-free-new" },
    { title: "Popular Movies Free With Ads Elsewhere", path: "movies/streaming-free" },
  ],
  tv: [
    { title: "Watch Free: Series", path: "tv/free", isLarge: true },
    { title: "Free Anime Series", path: "tv/anime-free", isLarge: true },
    { title: "New Free Anime Series", path: "tv/anime-free-new" },
    { title: "New Series Free With Ads Elsewhere", path: "tv/streaming-free-new" },
    { title: "Popular Series Free With Ads Elsewhere", path: "tv/streaming-free" },
    { title: "Trending TV Series", path: "tv/trending" },
    { title: "Top Rated Series", path: "tv/top_rated" },
    { title: "Popular Series", path: "tv/popular" },
  ],
  popular: [
    { title: "Trending Movies", path: "movies/trending" },
    { title: "Trending Series", path: "tv/trending" },
    { title: "Top Rated Movies", path: "movies/top_rated", isLarge: true },
  ],
};

// How many genre rows to show per tab (the Movies tab shows every genre)
const GENRE_ROW_LIMIT = { home: 6, movies: Infinity };

const BROWSE_PATH = /^(movies|tv)\/(trending|popular|top_rated|upcoming|now_playing|on_the_air|airing_today|free|free\/[a-z]+|free-shorts|marvel-free|anime-free|anime-free-new|streaming-free|streaming-free-new|genre\/\d+)$/;

export function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const route = useHashRoute();
  const { watchlist } = useWatchlist();

  const health = useApi("/api/health");
  const trending = useApi("/api/movies/trending");
  const genres = useApi("/api/movies/genres");

  const heroItem = trending.data?.content;
  const genreList = genres.data?.genres || [];

  const closeDetails = useCallback(() => setSelectedItem(null), []);

  const handlePlay = (item) => {
    setSelectedItem(null);
    navigate(`/watch/${getMediaType(item)}/${item.id}`);
  };

  // Tabs and search live on the home route, so leave the player/browse page first
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate("/");
  };
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query) navigate("/");
  };
  const goHome = () => navigate("/");

  const rowHandlers = { onPlay: handlePlay, onOpenDetails: setSelectedItem };

  const renderRow = ({ title, path, isLarge }) => (
    <CatalogRow
      key={path}
      title={title}
      url={`/api/${path}`}
      isLarge={isLarge}
      onExplore={() => navigate(`/browse/${path}?title=${encodeURIComponent(title)}`)}
      {...rowHandlers}
    />
  );

  const renderPage = () => {
    const [section, ...rest] = route.segments;

    if (section === "watch" && rest.length === 2) {
      const [type, id] = rest;
      return <WatchPage key={`${type}-${id}`} type={type} id={id} onBack={goHome} onOpenDetails={setSelectedItem} />;
    }

    if (section === "browse" && BROWSE_PATH.test(rest.join("/"))) {
      return (
        <BrowsePage
          title={route.query.get("title") || "Browse"}
          url={`/api/${rest.join("/")}`}
          onBack={goHome}
          {...rowHandlers}
        />
      );
    }

    if (section) {
      return (
        <div className="page">
          <StatusMessage
            title="Page not found"
            message="That page doesn't exist."
            actionLabel="Back to home"
            onAction={goHome}
          />
        </div>
      );
    }

    if (searchQuery) return <SearchResults query={searchQuery} {...rowHandlers} />;

    if (activeTab === "my-list") {
      return <MyListPage {...rowHandlers} onExploreHome={() => setActiveTab("home")} />;
    }

    const genreRows = genreList.slice(0, GENRE_ROW_LIMIT[activeTab] || 0);

    return (
      <main>
        {/* Featured title */}
        {trending.loading && <HeroSkeleton />}
        {heroItem && <HeroBanner item={heroItem} {...rowHandlers} />}
        {trending.error && (
          <div className="page" style={{ minHeight: "auto", paddingBottom: 0 }}>
            <StatusMessage
              title="The catalog couldn't be loaded"
              message={trending.error}
              actionLabel="Try again"
              onAction={() => window.location.reload()}
            />
          </div>
        )}

        {/* Rows overlap the bottom gradient of the hero */}
        <div className={`rows ${heroItem || trending.loading ? "rows--overlap" : ""}`}>
          {watchlist.length > 0 && <MovieRow title="My List" items={watchlist} {...rowHandlers} />}

          {/* If the catalog itself is unreachable, the single error above is enough */}
          {!trending.error && (ROWS[activeTab] || ROWS.home).map(renderRow)}

          {!trending.error &&
            genreRows.map((genre) => renderRow({ title: `${genre.name} Movies`, path: `movies/genre/${genre.id}` }))}
        </div>
      </main>
    );
  };

  return (
    <div style={{ backgroundColor: "var(--netflix-black)", minHeight: "100vh", position: "relative" }}>
      {/* Navigation Header */}
      <Navbar
        activeTab={route.segments.length === 0 ? activeTab : null}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {health.data?.catalog === "demo" && (
        <div className="demo-banner" role="note">
          <strong>Demo catalog.</strong> No TMDB API key is configured, so only a small sample of titles is shown. Add{" "}
          <code>TMDB_API_KEY</code> to <code>backend/.env</code> and restart the backend to load the full catalog.
        </div>
      )}

      {renderPage()}

      <Footer />

      {/* Pop-up Modals */}
      <DetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={closeDetails}
        onPlay={handlePlay}
        onSelect={setSelectedItem}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
export default App;
