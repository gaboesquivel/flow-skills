/** Window event that opens the global search palette. */
export const OPEN_SEARCH_EVENT = "flow:open-search";

/** What to open the palette with: a prefilled query, answered right away when `ask` is set. */
export type OpenSearchDetail = { query?: string; ask?: boolean };

export const openSearch = (detail?: OpenSearchDetail) => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT, { detail }));
