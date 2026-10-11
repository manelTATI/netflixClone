import { fetchFromTMDB, fetchStreamingFree, sendTmdbError } from "../services/tmdb.service.js";
import { getFreeItems, getLocalFreeItem } from "../services/freeMovies.service.js";

const TV_CATEGORIES = ["popular", "top_rated", "on_the_air", "airing_today"];

const getPage = (req) => Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 500);
const tagTv = (results = []) => results.map((item) => ({ ...item, media_type: "tv" }));
// Free series without a TMDB entry use negative local ids (see freeMovies.service.js).
const isLocalId = (id) => Number(id) < 0;

export const getTrendingTv = async (req, res) => {
  try {
    const data = await fetchFromTMDB("/trending/tv/day", { page: getPage(req) });
    const results = tagTv(data.results);
    const randomTv = results[Math.floor(Math.random() * results.length)] || null;

    res.json({ success: true, content: randomTv, all: results, page: data.page, totalPages: data.total_pages });
  } catch (error) {
    sendTmdbError(res, error, "getTrendingTv");
  }
};

export const getTvTrailers = async (req, res) => {
  const { id } = req.params;
  if (isLocalId(id)) return res.json({ success: true, trailers: [] });
  try {
    const data = await fetchFromTMDB(`/tv/${id}/videos`);
    res.json({ success: true, trailers: data.results });
  } catch (error) {
    sendTmdbError(res, error, "getTvTrailers");
  }
};

export const getTvDetails = async (req, res) => {
  const { id } = req.params;
  if (isLocalId(id)) {
    const item = getLocalFreeItem("tv", id);
    if (!item) return res.status(404).json({ success: false, message: "Title not found" });
    return res.json({ success: true, content: item });
  }
  try {
    const data = await fetchFromTMDB(`/tv/${id}`);
    res.status(200).json({ success: true, content: { ...data, media_type: "tv" } });
  } catch (error) {
    sendTmdbError(res, error, "getTvDetails");
  }
};

export const getSimilarTvs = async (req, res) => {
  const { id } = req.params;
  if (isLocalId(id)) return res.json({ success: true, similar: [] });
  try {
    const data = await fetchFromTMDB(`/tv/${id}/similar`, { page: 1 });
    res.status(200).json({ success: true, similar: tagTv(data.results) });
  } catch (error) {
    sendTmdbError(res, error, "getSimilarTvs");
  }
};

// Series with episodes that can be streamed in full from an authorized source.
export const getFreeSeries = async (req, res) => {
  try {
    const items = await getFreeItems("tv");
    res.json({ success: true, content: items, page: 1, totalPages: 1 });
  } catch (error) {
    sendTmdbError(res, error, "getFreeSeries");
  }
};

// Series that legitimate services stream for free (with ads): most popular, or newest first.
export const getStreamingFreeSeries = (newest, filter) => async (req, res) => {
  try {
    const data = await fetchStreamingFree("tv", { newest, filter, page: getPage(req) });
    res.json({ success: true, content: tagTv(data.results), page: data.page, totalPages: Math.min(data.total_pages, 500) });
  } catch (error) {
    sendTmdbError(res, error, "getStreamingFreeSeries");
  }
};

export const getTvsByCategory = async (req, res) => {
  const { category } = req.params;
  if (!TV_CATEGORIES.includes(category)) {
    return res.status(404).json({ success: false, message: `Unknown TV category "${category}"` });
  }
  try {
    const data = await fetchFromTMDB(`/tv/${category}`, { page: getPage(req) });
    res.status(200).json({ success: true, content: tagTv(data.results), page: data.page, totalPages: data.total_pages });
  } catch (error) {
    sendTmdbError(res, error, "getTvsByCategory");
  }
};
