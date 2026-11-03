import { runSearch } from '../src/search/engine/runSearch';
import { parsePagination, paginatePayload } from '../src/search/engine/paginate';
import { SearchMode, isSearchMode, SEARCH_MODES } from '../src/types';

const MAX_QUERY_LENGTH = 300;

// Vercel Serverless Function: replaces the Express POST/GET /api/search
// routes from server.ts for production deploys.
export default async function handler(req: any, res: any) {
  try {
    const isPost = req.method === 'POST';
    const rawQuery = isPost ? req.body?.query : req.query?.q;
    const rawMode = isPost ? req.body?.mode : req.query?.mode;
    const rawPage = isPost ? req.body?.page : req.query?.page;
    const rawPageSize = isPost ? req.body?.pageSize : req.query?.pageSize;

    const query = String(rawQuery || '').trim();
    const mode = String(rawMode || 'web');

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }
    if (query.length > MAX_QUERY_LENGTH) {
      res.status(400).json({ error: `Query too long (max ${MAX_QUERY_LENGTH} characters)` });
      return;
    }
    if (!isSearchMode(mode)) {
      res.status(400).json({ error: `Invalid mode '${mode}'. Valid modes: ${SEARCH_MODES.join(', ')}` });
      return;
    }

    const { page, pageSize } = parsePagination(rawPage, rawPageSize);
    const payload = await runSearch(query, mode as SearchMode);
    res.status(200).json(paginatePayload(payload, page, pageSize));
  } catch (error: any) {
    console.error('Search API error:', error);
    res.status(500).json({ error: error.message || 'Internal search processing error' });
  }
}
