import { SearchProvider } from './SearchProvider';
import { GeneralWebProvider } from './GeneralWebProvider';
import { TechnicalProvider } from './TechnicalProvider';
import { CommunityProvider } from './CommunityProvider';
import { DocumentProvider } from './DocumentProvider';
import { AcademicProvider } from './AcademicProvider';
import { generateMockResults } from './mockData';
import { SearchMode, SearchResult, ProviderStatus } from '../../types';

class ProviderRegistry {
  private providers: SearchProvider[] = [
    new GeneralWebProvider(),
    new TechnicalProvider(),
    new CommunityProvider(),
    new DocumentProvider(),
    new AcademicProvider()
  ];

  getProviders(): SearchProvider[] {
    return this.providers;
  }

  getStatuses(): ProviderStatus[] {
    const useMock = process.env.SEARCH_MOCK === 'true';
    return this.providers.map(p => {
      const status = p.getStatus();
      return useMock ? { ...status, status: 'mock' as const } : status;
    });
  }

  async executeSearch(query: string, mode: SearchMode, variants: string[]): Promise<{ results: SearchResult[]; errors: string[]; providersUsed: string[] }> {
    const results: SearchResult[] = [];
    const errors: string[] = [];
    const providersUsedSet = new Set<string>();

    // Select relevant providers based on mode
    const activeProviders = this.providers.filter(p => p.capabilities().supportedModes.includes(mode));
    
    // Fallback if none match
    const targetProviders = activeProviders.length > 0 ? activeProviders : this.providers;

    // SEARCH_MOCK=true swaps live providers for deterministic mock data (offline/tests/demo)
    const useMock = process.env.SEARCH_MOCK === 'true';

    // Run searches in parallel across providers and variants
    const promises = targetProviders.map(async provider => {
      providersUsedSet.add(provider.name);
      try {
        // Use top variant or primary query
        const variantToUse = variants[0] || query;
        const provResults = useMock
          ? generateMockResults(provider.id, provider.name, query, variantToUse, provider.capabilities().maxResultsPerQuery)
          : await provider.search(query, mode, variantToUse);
        return provResults;
      } catch (err: any) {
        errors.push(`${provider.name} unavailable: ${err.message || 'Timeout'}`);
        return [];
      }
    });

    const settled = await Promise.allSettled(promises);
    settled.forEach(outcome => {
      if (outcome.status === 'fulfilled') {
        results.push(...outcome.value);
      }
    });

    return {
      results,
      errors,
      providersUsed: Array.from(providersUsedSet)
    };
  }
}

export const providerRegistry = new ProviderRegistry();
