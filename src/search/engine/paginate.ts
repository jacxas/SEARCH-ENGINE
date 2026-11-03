import { SearchResponsePayload, PaginationInfo } from '../../types';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// Parses and clamps page/pageSize coming from user input (query string or JSON body).
export function parsePagination(rawPage: unknown, rawPageSize: unknown): { page: number; pageSize: number } {
  let page = Number.parseInt(String(rawPage ?? '1'), 10);
  let pageSize = Number.parseInt(String(rawPageSize ?? String(DEFAULT_PAGE_SIZE)), 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
  return { page, pageSize };
}

// Returns a copy of the payload with `results` sliced to the requested page.
// The full result set stays in `metrics.uniqueResults`, so pages never hide data.
export function paginatePayload(payload: SearchResponsePayload, page: number, pageSize: number): SearchResponsePayload {
  const totalResults = payload.results.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  const pagination: PaginationInfo = {
    page: safePage,
    pageSize,
    totalResults,
    totalPages,
    hasMore: safePage < totalPages
  };

  return {
    ...payload,
    results: payload.results.slice(start, start + pageSize),
    pagination
  };
}
