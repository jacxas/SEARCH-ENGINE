import { SearchProvider } from './SearchProvider';
import { GeneralWebProvider } from './GeneralWebProvider';
import { TechnicalProvider } from './TechnicalProvider';
import { CommunityProvider } from './CommunityProvider';
import { DocumentProvider } from './DocumentProvider';
import { AcademicProvider } from './AcademicProvider';
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
    return this.providers.map(p => p.getStatus());
  }

  async executeSearch(query: string, mode: SearchMode, variants: string[]): Promise<{ results: SearchResult[]; errors: string[]; providersUsed: string[] }> {
    const results: SearchResult[] = [];
    const errors: string[] = [];
    const providersUsedSet = new Set<string>();

    // Select relevant providers based on mode
    const activeProviders = this.providers.filter(p => p.capabilities().supportedModes.includes(mode));
    
    // Fallback if none match
    const targetProviders = activeProviders.length > 0 ? activeProviders : this.providers;

    // Run searches in parallel across providers and variants
    const promises = targetProviders.map(async provider => {
      providersUsedSet.add(provider.name);
      try {
        // Use top variant or primary query
        const variantToUse = variants[0] || query;
        const provResults = await provider.search(query, mode, variantToUse);
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
