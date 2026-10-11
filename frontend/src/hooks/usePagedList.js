import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { extractList, getErrorMessage } from "../lib/media";

const withPage = (url, page) => `${url}${url.includes("?") ? "&" : "?"}page=${page}`;

/**
 * Loads a paginated list endpoint page by page ("load more").
 * Pass null as the url to show nothing. Returns { items, loading, error, hasMore, loadMore, retry }.
 */
export function usePagedList(url) {
  const [state, setState] = useState({ url: null, items: [], page: 0, totalPages: 1, loading: false, error: null });
  const requestId = useRef(0);

  const loadPage = useCallback((targetUrl, page) => {
    const id = ++requestId.current;
    setState((prev) => ({
      ...(prev.url === targetUrl ? prev : { url: targetUrl, items: [], page: 0, totalPages: 1 }),
      loading: true,
      error: null,
    }));

    axios
      .get(withPage(targetUrl, page))
      .then((res) => {
        if (id !== requestId.current) return; // a newer request replaced this one
        setState((prev) => {
          const seen = new Set(prev.items.map((item) => `${item.media_type}-${item.id}`));
          const fresh = extractList(res.data).filter((item) => !seen.has(`${item.media_type}-${item.id}`));
          return {
            url: targetUrl,
            items: [...prev.items, ...fresh],
            page,
            totalPages: res.data?.totalPages || 1,
            loading: false,
            error: null,
          };
        });
      })
      .catch((error) => {
        if (id !== requestId.current) return;
        setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
      });
  }, []);

  useEffect(() => {
    if (url) loadPage(url, 1);
    else requestId.current++;
  }, [url, loadPage]);

  const isCurrent = Boolean(url) && state.url === url;
  const nextPage = (isCurrent ? state.page : 0) + 1;

  return {
    items: isCurrent ? state.items : [],
    loading: Boolean(url) && (!isCurrent || state.loading),
    error: isCurrent ? state.error : null,
    hasMore: isCurrent && state.page > 0 && state.page < state.totalPages,
    loadMore: () => url && loadPage(url, nextPage),
    retry: () => url && loadPage(url, nextPage),
  };
}
