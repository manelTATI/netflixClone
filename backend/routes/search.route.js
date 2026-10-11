import express from "express";
import {
  getSearchHistory,
  removeItemFromSearchHistory,
  searchMovie,
  searchMulti,
  searchPerson,
  searchTv,
} from "../controllers/search.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/person/:query", searchPerson);
router.get("/movie/:query", searchMovie);
router.get("/tv/:query", searchTv);
router.get("/multi/:query", searchMulti);

router.get("/history", protectRoute, getSearchHistory);
router.delete("/history/:id", protectRoute, removeItemFromSearchHistory);

export default router;
