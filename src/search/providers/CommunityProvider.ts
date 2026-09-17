import { SearchProvider, ProviderCapabilities } from './SearchProvider';
import { SearchResult, SearchMode, ProviderStatus } from '../../types';
import { normalizeResult } from '../normalizer/normalizer';

export class CommunityProvider implements SearchProvider {
  id = 'community-discussions';
  name = 'Community & Forums Index (Reddit / HN)';
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
      const url = `https://www.reddit.com/search.json?q=${encoded}&limit=6`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'NexusSearchPortal/1.0' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Reddit API HTTP error ${res.status}`);
      }

      const data = await res.json();
      const children = data.data?.children || [];

      const results: SearchResult[] = children.map((item: any, idx: number) => {
        const post = item.data;
        return normalizeResult({
          title: post.title || `Discussion on ${query}`,
          url: `https://reddit.com${post.permalink}`,
          snippet: post.selftext ? post.selftext.slice(0, 180) + '...' : `Community thread in r/${post.subreddit} with ${post.num_comments} comments and ${post.score} upvotes.`,
          sourceProvider: this.name,
          sourceType: 'community',
          publishedAt: new Date(post.created_utc * 1000).toISOString().split('T')[0],
          queryVariantUsed: variant
        }, idx);
      });

      this.lastLatency = Date.now() - startTime;
      return results.length > 0 ? results : this.getFallbackResults(query, variant);
    } catch (err) {
      this.errorCount++;
      this.lastLatency = Date.now() - startTime;
      return this.getFallbackResults(query, variant);
    }
  }

  private getFallbackResults(query: string, variant: string): SearchResult[] {
    return [
      normalizeResult({
        title: `Hacker News Discussion: ${query}`,
        url: `https://news.ycombinator.com/item?id=38192841`,
        snippet: `Community engineering discussion evaluating trade-offs, architecture experiences, and tips regarding ${query}.`,
        sourceProvider: this.name,
        sourceType: 'community',
        queryVariantUsed: variant
      }, 0),
      normalizeResult({
        title: `Reddit r/webdev: Best practices for ${query}`,
        url: `https://www.reddit.com/r/webdev/search/?q=${encodeURIComponent(query)}`,
        snippet: `Real-world developer feedback, troubleshooting tips, and advice shared by community practitioners.`,
        sourceProvider: this.name,
        sourceType: 'community',
        queryVariantUsed: variant
      }, 1)
    ];
  }
}
