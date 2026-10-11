import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movie.route.js";
import tvRoutes from "./routes/tv.route.js";
import searchRoutes from "./routes/search.route.js";
import watchlistRoutes from "./routes/watchlist.route.js";
import watchRoutes from "./routes/watch.route.js";
import { isTmdbConfigured } from "./services/tmdb.service.js";

// 1. Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Initialize Express application
const app = express();

// 3. Security & Utility Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
        // Full-length public-domain films are streamed from the Internet Archive
        mediaSrc: ["'self'", "https://archive.org", "https://*.archive.org"],
      },
    },
    crossOriginEmbedderPolicy: false,
    // YouTube refuses to play embedded trailers ("Error 153") when no referrer is sent,
    // which is helmet's default. This sends only the site's origin, never the full URL.
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

app.use(
  cors({
    origin: true,
    credentials: true, // Allow cookies across origins
  })
);
app.use(express.json());
app.use(cookieParser());

// 4. API Endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    // "live" = real TMDB data, "demo" = built-in sample catalog (no TMDB_API_KEY set)
    catalog: isTmdbConfigured() ? "live" : "demo",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/tv", tvRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/watch", watchRoutes);

// Unknown API routes get a JSON 404 instead of falling through to the frontend
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// In production, serve the frontend build
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDist));
  // Express 5 needs a named wildcard here ("*" alone throws at startup)
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Netflix Clone API is running in development mode!");
  });
}

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ success: false, message: "Something went wrong on the server!" });
});

// 6. Port and MongoDB URI configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/netflix_clone";

// 7. Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  if (!isTmdbConfigured()) {
    console.log("⚠️ TMDB_API_KEY is not set: serving the small built-in demo catalog. See backend/.env.example");
  }
});

// 8. Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" Connected to MongoDB successfully!");
  })
  .catch((error) => {
    console.log("⚠️ MongoDB connection error:", error.message);
    console.log("👉 Note: If you use MongoDB Atlas (cloud), paste your connection string into backend/.env");
  });
