import express from "express";
import { getWatchSources } from "../controllers/watch.controller.js";

const router = express.Router();

router.get("/:type/:id", getWatchSources);

export default router;
