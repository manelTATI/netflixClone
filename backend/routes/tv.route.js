import express from "express";
import {
  getFreeSeries,
  getSimilarTvs,
  getStreamingFreeSeries,
  getTrendingTv,
  getTvDetails,
  getTvsByCategory,
  getTvTrailers,
} from "../controllers/tv.controller.js";

import { FREE_FILTERS } from "../services/tmdb.service.js";

const router = express.Router();

router.get("/trending", getTrendingTv);
router.get("/free", getFreeSeries);
router.get("/streaming-free", getStreamingFreeSeries(false));
router.get("/streaming-free-new", getStreamingFreeSeries(true));
router.get("/marvel-free", getStreamingFreeSeries(false, FREE_FILTERS.marvel));
router.get("/anime-free", getStreamingFreeSeries(false, FREE_FILTERS.anime));
router.get("/anime-free-new", getStreamingFreeSeries(true, FREE_FILTERS.anime));
router.get("/trailers/:id", getTvTrailers);
router.get("/details/:id", getTvDetails);
router.get("/similar/:id", getSimilarTvs);
router.get("/:category", getTvsByCategory);

export default router;
