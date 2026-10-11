import express from "express";
import {
  getFreeMovies,
  getFreeMoviesByCategory,
  getMovieDetails,
  getMovieGenres,
  getMoviesByCategory,
  getMoviesByGenre,
  getMovieTrailers,
  getSimilarMovies,
  getStreamingFreeMovies,
  getTrendingMovie,
} from "../controllers/movie.controller.js";

import { FREE_FILTERS } from "../services/tmdb.service.js";

const router = express.Router();

router.get("/trending", getTrendingMovie);
router.get("/genres", getMovieGenres);
router.get("/genre/:genreId", getMoviesByGenre);
router.get("/free", getFreeMovies(false));
router.get("/free-shorts", getFreeMovies(true));
router.get("/free/:category", getFreeMoviesByCategory);
router.get("/streaming-free", getStreamingFreeMovies(false));
router.get("/streaming-free-new", getStreamingFreeMovies(true));
router.get("/marvel-free", getStreamingFreeMovies(false, FREE_FILTERS.marvel));
router.get("/anime-free", getStreamingFreeMovies(false, FREE_FILTERS.anime));
router.get("/trailers/:id", getMovieTrailers);
router.get("/details/:id", getMovieDetails);
router.get("/similar/:id", getSimilarMovies);
router.get("/:category", getMoviesByCategory);

export default router;
