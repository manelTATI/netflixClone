import express from "express";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlist.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getWatchlist);
router.post("/", addToWatchlist);
router.delete("/:id", removeFromWatchlist);

export default router;
