// Small helpers for reading TMDB movie / TV objects consistently.

export const getTitle = (item) => item?.title || item?.name || "Untitled";

export const getMediaType = (item) => item?.media_type || (item?.first_air_date ? "tv" : "movie");

export const getReleaseDate = (item) => item?.release_date || item?.first_air_date || "";

export const getYear = (item) => getReleaseDate(item).substring(0, 4);

/** "2014-11-05" -> "November 5, 2014". Year-only or missing dates are returned as-is. */
export const formatDate = (value) => {
  if (!value) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/** 8.43 -> "8.4". Returns "" when the title has no rating yet. */
export const formatRating = (voteAverage) => (voteAverage > 0 ? Number(voteAverage).toFixed(1) : "");

export const formatRuntime = (minutes) => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

/** Lists come back as `content` (most endpoints), `all` (trending) or `similar`. */
export const extractList = (data) => {
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.all)) return data.all;
  if (Array.isArray(data?.similar)) return data.similar;
  return [];
};

export const getErrorMessage = (error) => {
  const message = error?.response?.data?.message;
  if (message) return message;
  if (!error?.response || error.response.status >= 500) {
    return "Can't reach the server. Make sure the backend is running, then try again.";
  }
  return `Request failed (${error.response.status}).`;
};
