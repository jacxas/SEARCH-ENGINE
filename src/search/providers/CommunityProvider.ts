import { SearchProvider, ProviderCapabilities } from './SearchProvider';
import { SearchResult, SearchMode, ProviderStatus } from '../../types';
import { normalizeResult } from '../normalizer/normalizer';

export class CommunityProvider implements SearchProvider {
  id = 'community-discussions';
  name = 'Community & Forums Index (Hacker News)';
  private errorCount = 0;
  private lastLatency = 160;

  capabilities(): ProviderCapabilities {
    return {
      supportedModes: ['deep', 'community', 'web'],
      maxResultsPerQuery: 8,
      requiresApiKey: false
    };
  }

  getStatus(): ProviderStatus {
    return {
      id: this.id,
      name: this.name,
      active: true,
      status: this.errorCount > 3 ? 'degraded' : 'healthy',
      lastChecked: new Date().toISOString(),
      errorCount: this.errorCount,
      latencyMs: this.lastLatency,
      supportedModes: this.capabilities().supportedModes
    };
  }

  async search(query: string, mode: SearchMode, variant: string): Promise<SearchResult[]> {
    const startTime = Date.now();
    try {
      const encoded = encodeURIComponent(variant || query);
      const url = `https://hn.algolia.com/api/v1/search?query=${encoded}&tags=story&hitsPerPage=6`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Algolia HN API HTTP error ${res.status}`);
      }

      const data = await res.json();
      const hits = data.hits || [];

      const results: SearchResult[] = hits.map((hit: any, idx: number) => {
        const itemUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
        const points = hit.points || 0;
        const comments = hit.num_comments || 0;
        const dateStr = hit.created_at ? hit.created_at.split('T')[0] : undefined;

        return normalizeResult({
          title: hit.title || `Hacker News Discussion on ${query}`,
          url: itemUrl,
          snippet: `Hacker News discussion with ${points} points and ${comments} comments regarding ${query}.`,
          sourceProvider: this.name,
          sourceType: 'community',
          publishedAt: dateStr,
          queryVariantUsed: variant
        }, idx);
      });

      this.lastLatency = Date.now() - startTime;
      return results;
    } catch (err) {
      this.errorCount++;
      this.lastLatency = Date.now() - startTime;
      return [];
    }
  }
}

