import React, { useState } from "react";
import { ArrowLeft, ExternalLink, Film, Info, Play, Plus, Check, VideoOff } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useWatchlist } from "../context/WatchlistContext";
import { StatusMessage } from "./StatusMessage";
import { backdropUrl, posterUrl, tmdbImage } from "../lib/images";
import { formatDate, formatRating, formatRuntime, getReleaseDate, getTitle } from "../lib/media";

const ProviderGroup = ({ label, providers }) => {
  if (!providers || providers.length === 0) return null;
  return (
    <div className="provider-group">
      <span className="provider-group__label">{label}</span>
      {providers.map((provider) => (
        <span key={provider.name} className="provider-chip">
          {provider.logo_path && <img src={tmdbImage(provider.logo_path, "w92")} alt="" />}
          {provider.name}
        </span>
      ))}
    </div>
  );
};

const EpisodeList = ({ episodes, currentIndex, onSelect }) => {
  const seasons = [...new Set(episodes.map((episode) => episode.season))];
  return (
    <section className="watch-section">
      <h2>Episodes ({episodes.length})</h2>
      {seasons.map((season) => (
        <div key={season} className="episode-season">
          {seasons.length > 1 && <h3>Season {season}</h3>}
          <div className="episode-grid">
            {episodes.map((episode, index) =>
              episode.season !== season ? null : (
                <button
                  key={`${episode.season}-${episode.episode}`}
                  className={`episode-button ${index === currentIndex ? "is-active" : ""}`}
                  aria-current={index === currentIndex}
                  onClick={() => onSelect(index)}
                >
                  <span className="episode-button__number">
                    {index === currentIndex ? <Play size={12} fill="currentColor" /> : episode.episode}
                  </span>
                  <span className="episode-button__title">{episode.title}</span>
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

/**
 * Player page. The backend decides what may be played (see /api/watch):
 *   - an authorized full-length film or full episodes of a series (HTML5 player
 *     with standard controls), and/or
 *   - the official trailer (YouTube embed), clearly labelled as a trailer.
 * If neither exists the page says so instead of pretending to play something.
 */
export const WatchPage = ({ type, id, onBack, onOpenDetails }) => {
  const { data, loading, error, reload } = useApi(`/api/watch/${type}/${id}`);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [preferTrailer, setPreferTrailer] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [episodeIndex, setEpisodeIndex] = useState(0);

  if (loading) {
    return (
      <div className="watch-page">
        <div className="skeleton" style={{ height: 28, width: 260, marginBottom: 20 }} />
        <div className="player-frame skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch-page">
        <button className="link-button watch-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to browse
        </button>
        <StatusMessage title="This title couldn't be loaded" message={error} actionLabel="Try again" onAction={reload} />
      </div>
    );
  }

  const { content, fullMovie, series, sourceUnavailable, trailer, providers } = data;
  const title = getTitle(content);
  const rating = formatRating(content.vote_average);
  const releaseDate = formatDate(getReleaseDate(content));
  const isSaved = isInWatchlist(content.id);
  // Only free options are shown (free or free with ads); paid rent/buy/subscription ones are left out
  const freeProviders = providers?.free || [];
  const hasFree = freeProviders.length > 0;
  const notFreeNote = providers?.region
    ? ` No legal service offers it for free in ${providers.region} right now.`
    : " No legal service offers it for free right now.";

  // What we are allowed to play in full: one film, or the episodes of a series
  const episodes = series?.episodes || [];
  const episode = episodes[episodeIndex];
  const fullSource = fullMovie || (episode ? { ...series, url: episode.url } : null);
  const mode = fullSource && !(preferTrailer && trailer) ? "full" : trailer ? "trailer" : "none";
  const kind = type === "tv" ? "series" : "movie";

  const selectEpisode = (index) => {
    setVideoFailed(false);
    setPreferTrailer(false);
    setEpisodeIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="watch-page">
      <button className="link-button watch-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to browse
      </button>

      <div className="watch-heading">
        <h1>{title}</h1>
        {mode === "full" && <span className="badge badge--free">{series ? "Full episodes" : fullMovie.short ? "Full short film" : "Full movie"}</span>}
        {mode === "full" && fullMovie?.runtimeMinutes && (
          <span className="watch-runtime">{formatRuntime(fullMovie.runtimeMinutes)}</span>
        )}
        {mode === "trailer" && <span className="badge badge--trailer">Trailer only</span>}
      </div>

      {mode === "full" && episode && (
        <p className="watch-episode">
          Season {episode.season}, Episode {episode.episode}: <strong>{episode.title}</strong>
        </p>
      )}

      <div className="player-frame">
        {mode === "full" && !videoFailed && (
          <video
            key={fullSource.url}
            src={fullSource.url}
            poster={backdropUrl(content.backdrop_path) || undefined}
            controls
            playsInline
            preload="metadata"
            autoPlay
            onError={() => setVideoFailed(true)}
            // Continue with the next episode when one finishes
            onEnded={() => episodeIndex < episodes.length - 1 && selectEpisode(episodeIndex + 1)}
          />
        )}

        {mode === "full" && videoFailed && (
          <StatusMessage
            icon={<VideoOff size={40} />}
            title="The video couldn't be played here"
            message={`The stream from ${fullSource.provider} didn't load. It may be temporarily unavailable, or your browser can't play this file.`}
            actionLabel="Try again"
            onAction={() => setVideoFailed(false)}
          />
        )}

        {mode === "trailer" && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailer.key}?rel=0&modestbranding=1`}
            title={`${title} - trailer`}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}

        {mode === "none" && (
          <StatusMessage
            icon={<Film size={40} />}
            title="No video available for this title"
            message="There is no authorized full-length stream or official trailer for this title here."
          />
        )}
      </div>

      {/* What exactly is playing, and where it comes from */}
      <div className="watch-notice">
        {mode === "full" && (
          <p>
            You're watching {series ? "a" : "the"}{" "}
            <strong>complete {series ? "episode" : fullMovie.short ? "short film" : "film"}</strong>
            {fullMovie?.runtimeMinutes ? ` (${formatRuntime(fullMovie.runtimeMinutes)})` : ""}, streamed from
            the{" "}
            <a href={fullSource.pageUrl} target="_blank" rel="noreferrer">
              {fullSource.provider} <ExternalLink size={12} />
            </a>
            . Licence: {fullSource.license}.
            {series?.partial && " Only the episodes that are free to stream are listed, not the whole series."}
          </p>
        )}
        {sourceUnavailable && (
          <p>
            <strong>This {kind} is free to watch here</strong>, but the Internet Archive, which hosts the video, isn't
            responding right now. This is usually temporary. Please try again in a few minutes.
          </p>
        )}
        {sourceUnavailable && (
          <button className="btn btn--primary" onClick={reload}>
            Try again
          </button>
        )}
        {mode === "trailer" && !fullSource && !sourceUnavailable && (
          <p>
            <strong>This is the official trailer, not the full {kind}.</strong> This site only streams titles that are in
            the public domain or openly licensed, and this one isn't.
            {hasFree
              ? ` You can watch it free (with ads) on ${freeProviders.map((provider) => provider.name).join(", ")}.`
              : notFreeNote}
          </p>
        )}
        {mode === "none" && !sourceUnavailable && (
          <p>
            This site only streams titles that are in the public domain or openly licensed.
            {hasFree ? " The services below offer this title for free." : notFreeNote}
          </p>
        )}

        {/* Not playable here, but a legitimate service streams the full title for free */}
        {!fullSource && !sourceUnavailable && hasFree && providers.link && (
          <a className="btn btn--primary" href={providers.link} target="_blank" rel="noreferrer">
            <Play size={16} fill="currentColor" /> Watch the full {kind} free on {freeProviders[0].name}
            <ExternalLink size={14} />
          </a>
        )}

        {fullSource && trailer && (
          <button className="btn btn--glass" onClick={() => setPreferTrailer((prev) => !prev)}>
            {mode === "full" ? "Watch the trailer instead" : `Back to the full ${series ? "episodes" : "movie"}`}
          </button>
        )}
      </div>

      {episodes.length > 0 && <EpisodeList episodes={episodes} currentIndex={episodeIndex} onSelect={selectEpisode} />}

      {hasFree && (
        <section className="watch-section">
          <h2>Watch free, with ads ({providers.region})</h2>
          <ProviderGroup label="Free" providers={freeProviders} />
          <p className="watch-section__footnote">
            {providers.link && (
              <a href={providers.link} target="_blank" rel="noreferrer">
                Open the free options <ExternalLink size={12} />
              </a>
            )}{" "}
            Availability data provided by JustWatch.
          </p>
        </section>
      )}

      <section className="watch-section watch-about">
        {posterUrl(content.poster_path) && <img src={posterUrl(content.poster_path)} alt="" className="watch-about__poster" />}
        <div>
          <p className="watch-about__meta">
            {[releaseDate, rating && `★ ${rating}`, (content.genres || []).map((genre) => genre.name).join(", ")]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
          <p className="watch-about__overview">{content.overview || "No overview available for this title."}</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn btn--glass" onClick={() => onOpenDetails(content)}>
              <Info size={16} /> More info
            </button>
            <button className="btn btn--glass" onClick={() => toggleWatchlist(content)}>
              {isSaved ? <Check size={16} /> : <Plus size={16} />} {isSaved ? "In My List" : "Add to My List"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
