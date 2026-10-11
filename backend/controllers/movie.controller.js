import { fetchFromTMDB, fetchStreamingFree, sendTmdbError } from "../services/tmdb.service.js";
import { FREE_CATEGORIES, getFreeItems, getLocalFreeItem } from "../services/freeMovies.service.js";

const MOVIE_CATEGORIES = ["popular", "top_rated", "upcoming", "now_playing"];

const getPage = (req) => Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 500);
const tagMovies = (results = []) => results.map((item) => ({ ...item, media_type: "movie" }));
// Free films without a TMDB entry use negative local ids (see freeMovies.service.js).
const isLocalId = (id) => Number(id) < 0;

export const getTrendingMovie = async (req, res) => {
  try {
    const data = await fetchFromTMDB("/trending/movie/day", { page: getPage(req) });
    const results = tagMovies(data.results);
    const withBackdrop = results.filter((item) => item.backdrop_path);
    const pool = withBackdrop.length > 0 ? withBackdrop : results;
    const randomMovie = pool[Math.floor(Math.random() * pool.length)] || null;

    res.json({ success: true, content: randomMovie, all: results, page: data.page, totalPages: data.total_pages });
  } catch (error) {
    sendTmdbError(res, error, "getTrendingMovie");
  }
};

export const getMovieTrailers = async (req, res) => {
  const { id } = req.params;
  if (isLocalId(id)) return res.json({ success: true, trailers: [] });
  try {
    const data = await fetchFromTMDB(`/movie/${id}/videos`);
    res.json({ success: true, trailers: data.results });
  } catch (error) {
    sendTmdbError(res, error, "getMovieTrailers");
  }
};

export const getMovieDetails = async (req, res) => {
  const { id } = req.params;
  if (isLocalId(id)) {
    const item = getLocalFreeItem("movie", id);
    if (!item) return res.status(404).json({ success: false, message: "Title not found" });
    return res.json({ success: true, content: item });
  }
  try {
    const data = await fetchFromTMDB(`/movie/${id}`);
    res.status(200).json({ success: true, content: { ...data, media_type: "movie" } });
  } catch (error) {
    sendTmdbError(res, error, "getMovieDetails");
  }
};

export const getSimilarMovies = async (req, res) => {
  const { id } = req.params;
  if (isLocalId(id)) return res.json({ success: true, similar: [] });
  try {
    const data = await fetchFromTMDB(`/movie/${id}/similar`, { page: 1 });
    res.status(200).json({ success: true, similar: tagMovies(data.results) });
  } catch (error) {
    sendTmdbError(res, error, "getSimilarMovies");
  }
};

export const getMovieGenres = async (req, res) => {
  try {
    const data = await fetchFromTMDB("/genre/movie/list");
    res.json({ success: true, genres: data.genres || [] });
  } catch (error) {
    sendTmdbError(res, error, "getMovieGenres");
  }
};

export const getMoviesByGenre = async (req, res) => {
  const genreId = parseInt(req.params.genreId, 10);
  if (!genreId) return res.status(400).json({ success: false, message: "Invalid genre id" });
  try {
    const data = await fetchFromTMDB("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      include_adult: false,
      page: getPage(req),
    });
    res.json({ success: true, content: tagMovies(data.results), page: data.page, totalPages: data.total_pages });
  } catch (error) {
    sendTmdbError(res, error, "getMoviesByGenre");
  }
};

// Films that can be streamed in full from an authorized source:
// feature-length films (shorts = false) or short films (shorts = true).
export const getFreeMovies = (shorts) => async (req, res) => {
  try {
    const items = (await getFreeItems("movie")).filter((item) => item.short === shorts);
    res.json({ success: true, content: items, page: 1, totalPages: 1 });
  } catch (error) {
    sendTmdbError(res, error, "getFreeMovies");
  }
};

// Movies that legitimate services stream for free (with ads): most popular, or newest first.
// Pass a `filter` from FREE_FILTERS to narrow the list, e.g. to Marvel or anime.
export const getStreamingFreeMovies = (newest, filter) => async (req, res) => {
  try {
    const data = await fetchStreamingFree("movie", { newest, filter, page: getPage(req) });
    res.json({ success: true, content: tagMovies(data.results), page: data.page, totalPages: Math.min(data.total_pages, 500) });
  } catch (error) {
    sendTmdbError(res, error, "getStreamingFreeMovies");
  }
};

// Free feature films of one genre row (horror, noir, comedy, ...)
export const getFreeMoviesByCategory = async (req, res) => {
  const { category } = req.params;
  if (!FREE_CATEGORIES.includes(category)) {
    return res.status(404).json({ success: false, message: `Unknown free category "${category}"` });
  }
  try {
    const items = (await getFreeItems("movie")).filter((item) => item.category === category && !item.short);
    res.json({ success: true, content: items, page: 1, totalPages: 1 });
  } catch (error) {
    sendTmdbError(res, error, "getFreeMoviesByCategory");
  }
};

export const getMoviesByCategory = async (req, res) => {
  const { category } = req.params;
  if (!MOVIE_CATEGORIES.includes(category)) {
    return res.status(404).json({ success: false, message: `Unknown movie category "${category}"` });
  }
  try {
    const data = await fetchFromTMDB(`/movie/${category}`, { page: getPage(req) });
    res.status(200).json({ success: true, content: tagMovies(data.results), page: data.page, totalPages: data.total_pages });
  } catch (error) {
    sendTmdbError(res, error, "getMoviesByCategory");
  }
};
