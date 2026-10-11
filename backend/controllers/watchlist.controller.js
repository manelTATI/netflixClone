import { User } from "../models/user.model.js";

export const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("myList");
    res.status(200).json({ success: true, watchlist: user?.myList || [] });
  } catch (error) {
    console.error("Error in getWatchlist controller:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const { id, title, name, poster_path, backdrop_path, media_type, overview, release_date, first_air_date, vote_average } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Item ID is required" });
    }

    const user = await User.findById(req.user._id);

    const alreadyExists = user.myList.some((item) => Number(item.id) === Number(id));
    if (alreadyExists) {
      return res.status(400).json({ success: false, message: "Item already in watchlist" });
    }

    user.myList.push({
      id: Number(id),
      title: title || name || "",
      name: name || title || "",
      poster_path: poster_path || "",
      backdrop_path: backdrop_path || "",
      media_type: media_type || "movie",
      overview: overview || "",
      release_date: release_date || first_air_date || "",
      vote_average: vote_average || 0,
    });

    await user.save();

    res.status(201).json({ success: true, message: "Added to watchlist", watchlist: user.myList });
  } catch (error) {
    console.error("Error in addToWatchlist controller:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { myList: { id: numericId } } },
      { new: true }
    ).select("myList");

    res.status(200).json({ success: true, message: "Removed from watchlist", watchlist: user.myList });
  } catch (error) {
    console.error("Error in removeFromWatchlist controller:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
