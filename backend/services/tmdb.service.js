import axios from "axios";

// Small demo catalog, served ONLY when TMDB_API_KEY is not set (see isTmdbConfigured).
// Poster/backdrop paths are real TMDB paths for these exact titles.
const MOCK_MOVIES = [
  {
    id: 157336,
    genre_ids: [12, 18, 878],
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    media_type: "movie",
    adult: false,
    trailers: [{ key: "zSWdZVtXT7E", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 27205,
    genre_ids: [28, 878, 12],
    title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\".",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    release_date: "2010-07-15",
    vote_average: 8.4,
    media_type: "movie",
    adult: false,
    trailers: [{ key: "YoHD9XEInc0", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 155,
    genre_ids: [18, 28, 80, 53],
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of allies Lt. Jim Gordon and DA Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    media_type: "movie",
    adult: false,
    trailers: [{ key: "EXeTwQWrcwY", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 603,
    genre_ids: [28, 878],
    title: "The Matrix",
    overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    poster_path: "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
    backdrop_path: "/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg",
    release_date: "1999-03-30",
    vote_average: 8.2,
    media_type: "movie",
    adult: false,
    trailers: [{ key: "vKQi3bBA1y8", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 299534,
    genre_ids: [12, 878, 28],
    title: "Avengers: Endgame",
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions.",
    poster_path: "/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    release_date: "2019-04-24",
    vote_average: 8.3,
    media_type: "movie",
    adult: false,
    trailers: [{ key: "TcMBFSGVi1c", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 550,
    genre_ids: [18, 53],
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town.",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
    media_type: "movie",
    adult: false,
    trailers: [{ key: "qtRKdV9zFKs", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 872585,
    genre_ids: [18, 36],
    title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II, exploring the moral complexity and seismic aftermath.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg",
    release_date: "2023-07-19",
    vote_average: 8.1,
    media_type: "movie",
    adult: false,
    trailers: [{ key: "uYPbbksJxIg", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  }
];

const MOCK_TVS = [
  {
    id: 66732,
    genre_ids: [18, 10765, 9648],
    name: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    first_air_date: "2016-07-15",
    vote_average: 8.6,
    media_type: "tv",
    adult: false,
    trailers: [{ key: "b9EkMc79ZSU", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 93405,
    genre_ids: [10759, 9648, 18],
    name: "Squid Game",
    overview: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
    poster_path: "/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg",
    backdrop_path: "/2meX1nMdScFOoV4370rqHWKmXhY.jpg",
    first_air_date: "2021-09-17",
    vote_average: 8.1,
    media_type: "tv",
    adult: false,
    trailers: [{ key: "oqxAJKy0ii4", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 119051,
    genre_ids: [10765, 9648, 35],
    name: "Wednesday",
    overview: "Wednesday Addams is sent to Nevermore Academy, a bizarre boarding school where she attempts to master her psychic powers, stop a monstrous killing spree, and solve the supernatural mystery that embroiled her parents 25 years ago.",
    poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    backdrop_path: "/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    first_air_date: "2022-11-23",
    vote_average: 8.5,
    media_type: "tv",
    adult: false,
    trailers: [{ key: "Di310BC8TBo", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 1399,
    genre_ids: [10765, 18, 10759],
    name: "Game of Thrones",
    overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
    poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    first_air_date: "2011-04-17",
    vote_average: 8.4,
    media_type: "tv",
    adult: false,
    trailers: [{ key: "KPLWWIOCOOQ", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  },
  {
    id: 1396,
    genre_ids: [18, 80],
    name: "Breaking Bad",
    overview: "Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of two years left to live. He chooses to enter a dangerous world of crime to secure his family's future.",
    poster_path: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    first_air_date: "2008-01-20",
    vote_average: 8.9,
    media_type: "tv",
    adult: false,
    trailers: [{ key: "HhesaQXLuRY", name: "Official Trailer", site: "YouTube", type: "Trailer" }]
  }
];

const MOCK_GENRES = {
  movie: [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 36, name: "History" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thriller" },
  ],
  tv: [
    { id: 10759, name: "Action & Adventure" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 9648, name: "Mystery" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
  ],
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
  }
}

// Read lazily: this module is imported before dotenv.config() runs in server.js.
const getApiKey = () => (process.env.TMDB_API_KEY || "").trim().replace(/^Bearer\s+/i, "");

export const isTmdbConfigured = () => getApiKey() !== "";

// Country used for "where to watch" data (ISO 3166-1 code such as US, GB, FR). Set WATCH_REGION in .env.
export const getWatchRegion = () => {
  const region = (process.env.WATCH_REGION || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(region) ? region : "US";
};

/**
 * Titles that legitimate services (Tubi, Pluto TV, Plex, ...) currently stream for free,
 * usually with ads, in the configured region. Data comes from TMDB's JustWatch feed.
 * These play on the service's own site, not here. type: "movie" | "tv".
 */
// Optional extra TMDB "discover" filters that narrow the free list to one kind of title.
export const FREE_FILTERS = {
  // Company ids: Marvel Studios, Marvel Entertainment, Marvel Enterprises, Marvel Animation, Marvel Television
  marvel: { with_companies: "420|7505|19551|13252|38679" },
  // Anime = Animation genre (16) with Japanese as the original language
  anime: { with_genres: 16, with_original_language: "ja" },
};

export const fetchStreamingFree = async (type, { newest = false, page = 1, filter = {} } = {}) => {
  if (!isTmdbConfigured()) return { page: 1, results: [], total_pages: 1 }; // needs live TMDB data
  const dateField = type === "tv" ? "first_air_date" : "primary_release_date";
  return fetchFromTMDB(`/discover/${type}`, {
    with_watch_monetization_types: "free|ads",
    watch_region: getWatchRegion(),
    include_adult: false,
    page,
    ...filter,
    ...(newest
      ? {
          sort_by: `${dateField}.desc`,
          [`${dateField}.lte`]: new Date().toISOString().slice(0, 10),
          "vote_count.gte": type === "tv" ? 10 : 20, // skips unreleased/placeholder entries
        }
      : { sort_by: "popularity.desc" }),
  });
};

/**
 * GET a TMDB v3 endpoint, e.g. fetchFromTMDB("/movie/popular", { page: 2 }).
 *
 * Accepts either kind of TMDB credential in TMDB_API_KEY: the short v3 "API Key"
 * (sent as ?api_key=) or the long v4 "API Read Access Token" (sent as a Bearer header).
 *
 * With no key configured it answers from the small demo catalog above. With a key,
 * failures are thrown as TmdbError so the UI can show a real error instead of fake data.
 */
export const fetchFromTMDB = async (path, params = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) return getMockData(path, params);

  const isV4Token = apiKey.length >= 40;
  try {
    const response = await axios.get(`${process.env.TMDB_BASE_URL || TMDB_BASE_URL}${path}`, {
      params: { language: "en-US", ...params, ...(isV4Token ? {} : { api_key: apiKey }) },
      headers: {
        accept: "application/json",
        ...(isV4Token ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    throw new TmdbError(error.response?.data?.status_message || error.message, status);
  }
};

/** Shared controller error response for anything that calls fetchFromTMDB. */
export const sendTmdbError = (res, error, label) => {
  if (error instanceof TmdbError) {
    if (error.status === 404) {
      return res.status(404).json({ success: false, message: "Title not found" });
    }
    console.error(`TMDB error in ${label}:`, error.status || "", error.message);
    if (error.status === 401) {
      return res.status(502).json({
        success: false,
        message: "TMDB rejected the API key. Check TMDB_API_KEY in backend/.env.",
      });
    }
    return res.status(502).json({ success: false, message: "Could not reach TMDB. Please try again." });
  }
  console.error(`Error in ${label}:`, error.message);
  return res.status(500).json({ success: false, message: "Internal Server Error" });
};

/** Pick the best official YouTube trailer (falling back to a teaser) from a /videos response. */
export const pickTrailer = (videos = []) => {
  const youtube = videos.filter((v) => v.site === "YouTube" && v.key);
  return (
    youtube.find((v) => v.type === "Trailer" && v.official) ||
    youtube.find((v) => v.type === "Trailer") ||
    youtube.find((v) => v.type === "Teaser") ||
    null
  );
};

// ---------------------------------------------------------------------------
// Demo catalog (no TMDB_API_KEY). Mirrors the shape of the TMDB endpoints used.
// ---------------------------------------------------------------------------

const list = (results) => ({ page: 1, results, total_pages: 1, total_results: results.length });
const byRating = (items) => [...items].sort((a, b) => b.vote_average - a.vote_average);
const byNewest = (items, dateKey) => [...items].sort((a, b) => b[dateKey].localeCompare(a[dateKey]));
const matchesQuery = (item, query = "") =>
  (item.title || item.name).toLowerCase().includes(String(query).trim().toLowerCase());

function getMockData(path, params) {
  const [, kind, second, third] = path.split("/"); // "/movie/27205/videos" -> movie, 27205, videos

  if (kind === "genre") return { genres: MOCK_GENRES[second] || [] };

  if (kind === "trending") return list(second === "tv" ? MOCK_TVS : MOCK_MOVIES);

  if (kind === "discover") {
    const items = second === "tv" ? MOCK_TVS : MOCK_MOVIES;
    const genreId = Number(params.with_genres);
    return list(genreId ? items.filter((item) => item.genre_ids.includes(genreId)) : items);
  }

  if (kind === "search") {
    const movies = MOCK_MOVIES.filter((item) => matchesQuery(item, params.query));
    const tvs = MOCK_TVS.filter((item) => matchesQuery(item, params.query));
    if (second === "movie") return list(movies);
    if (second === "tv") return list(tvs);
    if (second === "multi") return list([...movies, ...tvs]);
    return list([]);
  }

  if (kind === "movie" || kind === "tv") {
    const items = kind === "tv" ? MOCK_TVS : MOCK_MOVIES;
    const dateKey = kind === "tv" ? "first_air_date" : "release_date";

    if (second === "top_rated") return list(byRating(items));
    if (second === "popular") return list([...items].reverse());
    if (["upcoming", "now_playing", "on_the_air", "airing_today"].includes(second)) {
      return list(byNewest(items, dateKey));
    }

    const item = items.find((entry) => entry.id === Number(second));
    if (!item) throw new TmdbError("The resource you requested could not be found.", 404);

    if (third === "videos") return { id: item.id, results: item.trailers || [] };
    if (third === "similar") {
      return list(
        items.filter((other) => other.id !== item.id && other.genre_ids.some((g) => item.genre_ids.includes(g)))
      );
    }
    if (third === "watch") return { id: item.id, results: {} };

    const { trailers, ...details } = item;
    return { ...details, genres: MOCK_GENRES[kind].filter((genre) => item.genre_ids.includes(genre.id)) };
  }

  return list([]);
}
