// TMDB image helpers. TMDB returns only a file path such as "/abc123.jpg";
// the full URL is <base>/<size><path>. See https://developer.themoviedb.org/docs/image-basics
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const POSTER_SIZE = "w500";
export const BACKDROP_SIZE = "w1280";

/** Build a full image URL, or return null when there is no image. */
export const tmdbImage = (path, size) => {
  if (!path || typeof path !== "string") return null;
  if (/^https?:\/\//.test(path)) return path; // already absolute (e.g. Internet Archive artwork)
  return `${TMDB_IMAGE_BASE}/${size}${path.startsWith("/") ? path : `/${path}`}`;
};

export const posterUrl = (path) => tmdbImage(path, POSTER_SIZE);
export const backdropUrl = (path) => tmdbImage(path, BACKDROP_SIZE);
