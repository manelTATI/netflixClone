# 🎬 Netflix Clone

A full-stack movie and series site built with **React (Vite)**, **Node.js/Express** and **MongoDB**.

## ✨ Features
- Browse trending, popular and top-rated movies and series, with genre rows and search.
- Details for every title: overview, release date, rating, genres and similar titles.
- Player page for free public-domain and Creative Commons films and series, with an episode picker.
- Official trailers for everything else.
- Sign-in and a personal watchlist ("My List").
- Responsive layout for desktop, tablet and mobile.

## 🛠️ Running locally
1. Install dependencies in both folders:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. In `backend`, copy `.env.example` to `.env` and fill in your own values.
3. Start the two dev servers, each in its own terminal:
   ```bash
   cd backend && npm run dev
   ```
   ```bash
   cd frontend && npm run dev
   ```
4. Open http://localhost:5173.

## Credits
Movie data and images are provided by [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not
endorsed or certified by TMDB. Full-length films and series are streamed from the
[Internet Archive](https://archive.org/).
