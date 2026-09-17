import { SearchResult, SearchMode, ProviderStatus } from '../../types';

export interface ProviderCapabilities {
  supportedModes: SearchMode[];
  maxResultsPerQuery: number;
  requiresApiKey: boolean;
}

export interface SearchProvider {
  id: string;
  name: string;
  search(query: string, mode: SearchMode, variant: string): Promise<SearchResult[]>;
  capabilities(): ProviderCapabilities;
  getStatus(): ProviderStatus;
}
