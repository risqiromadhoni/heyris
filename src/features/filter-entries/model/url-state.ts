import { SEARCH_PARAM } from "@/shared/i18n";

/** The filter as the address bar holds it: a topic key, or `all`, and the search text. */
export interface FilterUrlState {
  topic: string;
  query: string;
}

/** Reads the filter from a page address. A missing parameter means the default. */
export function readFilterUrl(url: URL, topicParam: string): FilterUrlState {
  return {
    topic: url.searchParams.get(topicParam) ?? "all",
    query: url.searchParams.get(SEARCH_PARAM) ?? "",
  };
}

/** The same address with the filter written in. Defaults are left out, so the plain URL stays clean. */
export function filterUrl(url: URL, topicParam: string, topic: string, query: string): URL {
  if (topic === "all") {
    url.searchParams.delete(topicParam);
  } else {
    url.searchParams.set(topicParam, topic);
  }

  if (query.trim() === "") {
    url.searchParams.delete(SEARCH_PARAM);
  } else {
    url.searchParams.set(SEARCH_PARAM, query);
  }

  return url;
}
