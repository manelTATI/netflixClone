import { fetchFromTMDB, getWatchRegion, isTmdbConfigured, pickTrailer, sendTmdbError } from "../services/tmdb.service.js";
import {
  findFreeTitle,
  getFreeTitleByLocalId,
  getLocalFreeItem,
  resolveArchiveSource,
  resolveSeriesEpisodes,
} from "../services/freeMovies.service.js";

const toProviderList = (providers = []) =>
  providers.map((provider) => ({ name: provider.provider_name, logo_path: provider.logo_path }));

// Where a title can legally be streamed/rented/bought, from TMDB's JustWatch data.
const getWatchProviders = async (type, id, region) => {
  const data = await fetchFromTMDB(`/${type}/${id}/watch/providers`);
  const entry = data.results?.[region];
  if (!entry) return null;
  return {
    region,
    link: entry.link,
    stream: toProviderList(entry.flatrate),
    free: toProviderList([...(entry.free || []), ...(entry.ads || [])]),
    rent: toProviderList(entry.rent),
    buy: toProviderList(entry.buy),
  };
};

/**
 * Everything the player page needs for one title:
 *  - fullMovie: an authorized full-length stream of a film, or null when there is none
 *  - series:    authorized full episodes of a series, or null
 *  - trailer:   the official YouTube trailer, or null
 *  - providers: legitimate services carrying the title, or null
 * Nothing here is ever guessed: a missing source is reported as null.
 */
export const getWatchSources = async (req, res) => {
  const { type, id } = req.params;
  if (type !== "movie" && type !== "tv") {
    return res.status(400).json({ success: false, message: "Type must be movie or tv" });
  }
  const region = /^[A-Za-z]{2}$/.test(req.query.region || "") ? req.query.region.toUpperCase() : getWatchRegion();

  try {
    let details;
    let freeTitle = null;
    let trailer = null;
    let providers = null;

    if (Number(id) < 0) {
      // A free title that has no TMDB entry (catalog running without a TMDB key).
      freeTitle = getFreeTitleByLocalId(type, id);
      details = getLocalFreeItem(type, id);
      if (!freeTitle || !details) return res.status(404).json({ success: false, message: "Title not found" });
    } else {
      details = await fetchFromTMDB(`/${type}/${id}`);
      freeTitle = findFreeTitle(
        type,
        details.title || details.name,
        (details.release_date || details.first_air_date)?.substring(0, 4)
      );
      const [videos, providerResult] = await Promise.allSettled([
        fetchFromTMDB(`/${type}/${id}/videos`),
        isTmdbConfigured() ? getWatchProviders(type, id, region) : null,
      ]);
      if (videos.status === "fulfilled") {
        const video = pickTrailer(videos.value.results);
        trailer = video ? { key: video.key, name: video.name, site: "YouTube" } : null;
      }
      if (providerResult.status === "fulfilled") providers = providerResult.value;
    }

    let fullMovie = null;
    let series = null;
    // True when the title IS free here but its video host couldn't be reached just now
    let sourceUnavailable = false;
    if (freeTitle) {
      try {
        if (type === "movie") {
          fullMovie = await resolveArchiveSource(freeTitle);
        } else {
          const resolved = await resolveSeriesEpisodes(freeTitle);
          series = resolved.episodes.length > 0 ? resolved : null;
        }
      } catch (error) {
        console.warn("Could not resolve Internet Archive source:", error.message);
      }
      sourceUnavailable = !fullMovie && !series;
    }

    res.json({
      success: true,
      content: { ...details, media_type: type },
      fullMovie,
      series,
      sourceUnavailable,
      trailer,
      providers,
    });
  } catch (error) {
    sendTmdbError(res, error, "getWatchSources");
  }
};
