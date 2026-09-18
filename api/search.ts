import { runSearch } from '../src/search/engine/runSearch';
import { SearchMode } from '../src/types';

// Vercel Serverless Function: replaces the Express POST/GET /api/search
// routes from server.ts for production deploys.
export default async function handler(req: any, res: any) {
  try {
    const isPost = req.method === 'POST';
    const rawQuery = isPost ? req.body?.query : req.query?.q;
    const rawMode = isPost ? req.body?.mode : req.query?.mode;

    const query = String(rawQuery || '').trim();
    const mode: SearchMode = (rawMode || 'web') as SearchMode;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const payload = await runSearch(query, mode);
    res.status(200).json(payload);
  } catch (error: any) {
    console.error('Search API error:', error);
    res.status(500).json({ error: error.message || 'Internal search processing error' });
  }
}
