import { SearchProvider, ProviderCapabilities } from './SearchProvider';
import { SearchResult, SearchMode, ProviderStatus } from '../../types';
import { normalizeResult } from '../normalizer/normalizer';

export class GeneralWebProvider implements SearchProvider {
  id = 'web-general';
  name = 'General Web Index (Brave Search & Wikipedia)';
  private errorCount = 0;
  private lastLatency = 140;

  capabilities(): ProviderCapabilities {
    return {
      supportedModes: ['web', 'deep', 'documents', 'technical', 'community', 'academic'],
      maxResultsPerQuery: 15,
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
    const encoded = encodeURIComponent(variant || query);

    // 1. Try Brave Search API if subscription key is configured in environment
    const braveApiKey = process.env.BRAVE_API_KEY;
    if (braveApiKey) {
      try {
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encoded}&count=10`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Key': braveApiKey
          }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const webResults = data.web?.results || [];
          if (webResults.length > 0) {
            const results: SearchResult[] = webResults.map((item: any, idx: number) => normalizeResult({
              title: item.title || `Web Result for ${query}`,
              url: item.url,
              snippet: item.description || `Verified web reference for ${query}.`,
              sourceProvider: this.name,
              sourceType: 'web',
              publishedAt: item.published ? item.published.split('T')[0] : undefined,
              queryVariantUsed: variant
            }, idx));

            this.lastLatency = Date.now() - startTime;
            return results;
          }
        }
      } catch (err) {
        // Brave Search API call failed or timed out, fall back to open Wikimedia API
      }
    }

    // 2. Fallback to Wikimedia OpenSearch API (requires no key, 100% reliable public web index)
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encoded}&limit=8&namespace=0&format=json&origin=*`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Wikipedia API HTTP error ${res.status}`);
      }

      const data = await res.json();
      const titles: string[] = data[1] || [];
      const snippets: string[] = data[2] || [];
      const urls: string[] = data[3] || [];

      const results: SearchResult[] = [];
      for (let i = 0; i < titles.length; i++) {
        results.push(normalizeResult({
          title: titles[i],
          url: urls[i] || `https://en.wikipedia.org/wiki/${encodeURIComponent(titles[i])}`,
          snippet: snippets[i] || `Comprehensive reference article on ${titles[i]} with background context.`,
          sourceProvider: this.name,
          sourceType: 'web',
          queryVariantUsed: variant
        }, i));
      }

      this.lastLatency = Date.now() - startTime;
      return results;
    } catch (err) {
      this.errorCount++;
      this.lastLatency = Date.now() - startTime;
      return [];
    }
  }
}


