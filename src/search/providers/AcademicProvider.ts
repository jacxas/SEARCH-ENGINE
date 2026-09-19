import { SearchProvider, ProviderCapabilities } from './SearchProvider';
import { SearchResult, SearchMode, ProviderStatus } from '../../types';
import { normalizeResult } from '../normalizer/normalizer';

export class AcademicProvider implements SearchProvider {
  id = 'academic-scholar';
  name = 'Academic & Scholarly Index (OpenAlex)';
  private errorCount = 0;
  private lastLatency = 150;

  capabilities(): ProviderCapabilities {
    return {
      supportedModes: ['academic', 'deep', 'documents'],
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
      const url = `https://api.openalex.org/works?search=${encoded}&per_page=6`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`OpenAlex API HTTP error ${res.status}`);
      }

      const data = await res.json();
      const works = data.results || [];

      const results: SearchResult[] = works.map((work: any, idx: number) => {
        const title = work.title || `Academic Publication on ${query}`;
        const doiUrl = work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : (work.primary_location?.landing_page_url || `https://openalex.org/W${work.id}`);
        const citedBy = work.cited_by_count || 0;
        const year = work.publication_year || 'Recent';

        return normalizeResult({
          title: `[Scholarly Paper (${year})] ${title}`,
          url: doiUrl,
          snippet: `Academic paper published in ${year} with ${citedBy} citations. Indexed in OpenAlex repository.`,
          sourceProvider: this.name,
          sourceType: 'academic',
          publishedAt: work.publication_date,
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

