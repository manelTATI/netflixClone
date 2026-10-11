import { fetchFromTMDB, sendTmdbError } from "../services/tmdb.service.js";
import { User } from "../models/user.model.js";

const getPage = (req) => Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 500);

// Shared handler for the three single-type searches. An empty result is a normal
// 200 response with an empty list, so the UI can show its "no results" state.
const createSearchHandler = (searchType, imageKey, titleKey) => async (req, res) => {
  const { query } = req.params;
  try {
    const response = await fetchFromTMDB(`/search/${searchType}`, {
      query,
      include_adult: false,
      page: getPage(req),
    });
    const results = response.results || [];

    if (req.user && results.length > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          searchHistory: {
            id: results[0].id,
            image: results[0][imageKey],
            title: results[0][titleKey],
            searchType,
            createdAt: new Date(),
          },
        },
      });
    }

    const content = searchType === "person" ? results : results.map((item) => ({ ...item, media_type: searchType }));
    res.status(200).json({ success: true, content, page: response.page, totalPages: response.total_pages });
  } catch (error) {
    sendTmdbError(res, error, `search ${searchType}`);
  }
};

export const searchPerson = createSearchHandler("person", "profile_path", "name");
export const searchMovie = createSearchHandler("movie", "poster_path", "title");
export const searchTv = createSearchHandler("tv", "poster_path", "name");

// Movies and TV shows together, in one paginated list (used by the search page).
export const searchMulti = async (req, res) => {
  const { query } = req.params;
  try {
    const response = await fetchFromTMDB("/search/multi", {
      query,
      include_adult: false,
      page: getPage(req),
    });
    const content = (response.results || []).filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );
    res.status(200).json({ success: true, content, page: response.page, totalPages: response.total_pages });
  } catch (error) {
    sendTmdbError(res, error, "searchMulti");
  }
};

export const getSearchHistory = async (req, res) => {
  try {
    res.status(200).json({ success: true, content: req.user.searchHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const removeItemFromSearchHistory = async (req, res) => {
  let { id } = req.params;
  id = parseInt(id);

  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        searchHistory: { id },
      },
    });

    res.status(200).json({ success: true, message: "Item removed from search history" });
  } catch (error) {
    console.error("Error in removeItemFromSearchHistory controller:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
