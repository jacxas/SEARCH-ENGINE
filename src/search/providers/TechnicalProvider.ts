import { SearchProvider, ProviderCapabilities } from './SearchProvider';
import { SearchResult, SearchMode, ProviderStatus } from '../../types';
import { normalizeResult } from '../normalizer/normalizer';

export class TechnicalProvider implements SearchProvider {
  id = 'tech-github';
  name = 'Technical & Developer Index (GitHub & APIs)';
  private errorCount = 0;
  private lastLatency = 180;

  capabilities(): ProviderCapabilities {
    return {
      supportedModes: ['deep', 'technical', 'web'],
      maxResultsPerQuery: 12,
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
      const url = `https://api.github.com/search/repositories?q=${encoded}&per_page=6`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`GitHub API HTTP error ${res.status}`);
      }

      const data = await res.json();
      const items = data.items || [];

      const results: SearchResult[] = items.map((item: any, idx: number) => normalizeResult({
        title: `${item.full_name} — ${item.description || 'Open source technical repository'}`,
        url: item.html_url,
        snippet: item.description || `Popular GitHub repository with ${item.stargazers_count} stars. Language: ${item.language || 'TypeScript/JavaScript'}.`,
        sourceProvider: this.name,
        sourceType: 'technical',
        publishedAt: item.updated_at ? item.updated_at.split('T')[0] : undefined,
        queryVariantUsed: variant
      }, idx));

      this.lastLatency = Date.now() - startTime;
      return results;
    } catch (err) {
      this.errorCount++;
      this.lastLatency = Date.now() - startTime;
      return this.getFallbackResults(query, variant);
    }
  }

  private getFallbackResults(query: string, variant: string): SearchResult[] {
    return [
      normalizeResult({
        title: `github.com/topics/${encodeURIComponent(query)}`,
        url: `https://github.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Explore repositories, issues, discussions, and code snippets matching ${query} across GitHub.`,
        sourceProvider: this.name,
        sourceType: 'technical',
        queryVariantUsed: variant
      }, 0),
      normalizeResult({
        title: `Stack Overflow: Troubleshooting ${query}`,
        url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Developer Q&A discussion covering common compilation errors, edge cases, and solutions for ${query}.`,
        sourceProvider: this.name,
        sourceType: 'technical',
        queryVariantUsed: variant
      }, 1)
    ];
  }
}
