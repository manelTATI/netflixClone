import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getErrorMessage } from "../lib/media";

// Responses are kept for the session so switching tabs doesn't refetch every row.
const cache = new Map();

/**
 * GET a JSON endpoint. Pass null as the url to skip the request.
 * Returns { data, loading, error, reload }.
 */
export function useApi(url) {
  const [state, setState] = useState({ url: null, data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url) return;
    if (cache.has(url)) {
      setState({ url, data: cache.get(url), error: null });
      return;
    }

    const controller = new AbortController();
    axios
      .get(url, { signal: controller.signal })
      .then((res) => {
        cache.set(url, res.data);
        setState({ url, data: res.data, error: null });
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        setState({ url, data: null, error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [url, attempt]);

  const reload = useCallback(() => {
    cache.delete(url);
    setState({ url: null, data: null, error: null });
    setAttempt((n) => n + 1);
  }, [url]);

  // Until the state belongs to the current url, the request is still in flight.
  const isCurrent = state.url === url;
  return {
    data: isCurrent ? state.data : null,
    error: isCurrent ? state.error : null,
    loading: Boolean(url) && !isCurrent,
    reload,
  };
}
