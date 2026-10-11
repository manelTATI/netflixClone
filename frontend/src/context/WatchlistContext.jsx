import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load watchlist on auth change
  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      // Local fallback for guest users
      const saved = localStorage.getItem("netflix_guest_watchlist");
      if (saved) {
        try {
          setWatchlist(JSON.parse(saved));
        } catch {
          setWatchlist([]);
        }
      } else {
        setWatchlist([]);
      }
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/watchlist");
      if (res.data?.success) {
        setWatchlist(res.data.watchlist || []);
      }
    } catch (err) {
      console.warn("Could not fetch watchlist from server:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (item) => {
    const itemData = {
      id: item.id,
      title: item.title || item.name || "Untitled",
      name: item.name || item.title || "Untitled",
      poster_path: item.poster_path || "",
      backdrop_path: item.backdrop_path || "",
      media_type: item.media_type || "movie",
      overview: item.overview || "",
      release_date: item.release_date || item.first_air_date || "",
      vote_average: item.vote_average || 0,
    };

    if (user) {
      try {
        const res = await axios.post("/api/watchlist", itemData);
        if (res.data?.success) {
          setWatchlist(res.data.watchlist);
        }
      } catch (err) {
        console.error("Add to watchlist error:", err.message);
      }
    } else {
      // Guest state
      setWatchlist((prev) => {
        if (prev.some((x) => x.id === item.id)) return prev;
        const updated = [...prev, itemData];
        localStorage.setItem("netflix_guest_watchlist", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromWatchlist = async (id) => {
    const numericId = Number(id);
    if (user) {
      try {
        const res = await axios.delete(`/api/watchlist/${numericId}`);
        if (res.data?.success) {
          setWatchlist(res.data.watchlist);
        }
      } catch (err) {
        console.error("Remove from watchlist error:", err.message);
      }
    } else {
      setWatchlist((prev) => {
        const updated = prev.filter((item) => Number(item.id) !== numericId);
        localStorage.setItem("netflix_guest_watchlist", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const isInWatchlist = (id) => {
    return watchlist.some((item) => Number(item.id) === Number(id));
  };

  const toggleWatchlist = (item) => {
    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
