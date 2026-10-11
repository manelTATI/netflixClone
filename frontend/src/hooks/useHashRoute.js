import { useEffect, useState } from "react";

// Minimal hash router ("#/watch/movie/603"), so the player and "explore all"
// pages get real URLs and a working Back button without a routing library or
// any server configuration.

const parseHash = () => {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path, queryString = ""] = raw.split("?");
  return { segments: path.split("/").filter(Boolean), query: new URLSearchParams(queryString) };
};

export const navigate = (path) => {
  window.location.hash = path.startsWith("/") ? path : `/${path}`;
};

export function useHashRoute() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}
