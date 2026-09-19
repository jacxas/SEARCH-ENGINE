import { SearchProvider, ProviderCapabilities } from './SearchProvider';
import { SearchResult, SearchMode, ProviderStatus } from '../../types';
import { normalizeResult } from '../normalizer/normalizer';

export class DocumentProvider implements SearchProvider {
  id = 'doc-papers-manuals';
  name = 'Documents & Manuals Index (Crossref & arXiv)';
  private errorCount = 0;
  private lastLatency = 190;

  capabilities(): ProviderCapabilities {
    return {
      supportedModes: ['documents', 'deep', 'academic', 'web'],
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
    const encoded = encodeURIComponent(variant || query);

    // 1. Try Crossref API for authoritative documents, papers, manuals, and technical reports
    try {
      const url = `https://api.crossref.org/works?query=${encoded}&rows=6`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'NexusSearchPortal/1.0 (mailto:support@nexussearch.org)' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const items = data.message?.items || [];
        if (items.length > 0) {
          const results: SearchResult[] = items.map((item: any, idx: number) => {
            const title = Array.isArray(item.title) && item.title.length > 0 ? item.title[0] : `Document on ${query}`;
            const docUrl = item.URL || `https://doi.org/${item.DOI}`;
            const publisher = item.publisher || 'Crossref Document Index';
            const year = item.created?.['date-parts']?.[0]?.[0] || 'Recent';

            return normalizeResult({
              title: `[Document / Report (${year})] ${title}`,
              url: docUrl,
              snippet: `Published by ${publisher} in ${year}. Authoritative document reference indexed via Crossref.`,
              sourceProvider: this.name,
              sourceType: 'document',
              publishedAt: item.created?.['date-parts']?.[0] ? `${item.created['date-parts'][0][0]}-${String(item.created['date-parts'][0][1] || 1).padStart(2, '0')}-${String(item.created['date-parts'][0][2] || 1).padStart(2, '0')}` : undefined,
              queryVariantUsed: variant
            }, idx);
          });

          this.lastLatency = Date.now() - startTime;
          return results;
        }
      }
    } catch (err) {
      // Crossref failed, fall back to arXiv API below
    }

    // 2. Fallback to arXiv API for research preprints and technical whitepapers
    try {
      const url = `https://export.arxiv.org/api/query?search_query=all:${encoded}&max_results=5`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`arXiv API HTTP error ${res.status}`);
      }

      const xmlText = await res.text();
      const entryMatches = xmlText.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
      const results: SearchResult[] = [];

      entryMatches.forEach((entry, idx) => {
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
        const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
        const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);

        const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : `Research Paper on ${query}`;
        const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : `Technical specification and whitepaper documentation.`;
        const link = idMatch ? idMatch[1].trim() : `https://arxiv.org/abs/${query}`;
        const published = publishedMatch ? publishedMatch[1].split('T')[0] : undefined;

        results.push(normalizeResult({
          title: `[arXiv Paper] ${title}`,
          url: link,
          snippet: summary.slice(0, 200) + '...',
          sourceProvider: this.name,
          sourceType: 'document',
          publishedAt: published,
          queryVariantUsed: variant
        }, idx));
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


