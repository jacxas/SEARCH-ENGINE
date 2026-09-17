export type SearchMode = 'web' | 'deep' | 'documents' | 'technical' | 'community' | 'academic';

export type SourceType = 'web' | 'document' | 'technical' | 'community' | 'academic' | 'news' | 'other';

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  sourceProvider: string;
  sourceType: SourceType;
  publishedAt?: string;
  retrievedAt: string;
  relevanceScore?: number; // 0-100
  evidenceScore?: number; // 0-100
  freshnessScore?: number; // 0-100
  duplicateGroup?: string;
  queryVariantUsed?: string;
  matchedTerms?: string[];
  isDuplicate?: boolean;
  duplicateCount?: number;
  sourcesList?: { provider: string; url: string }[];
}

export interface DuplicateGroup {
  groupId: string;
  primaryResultId: string;
  memberResultIds: string[];
  count: number;
}

export interface SearchMetrics {
  resultsCollected: number;
  uniqueResults: number;
  duplicateGroups: number;
  providersCount: number;
  queryVariantsCount: number;
  durationMs: number;
  sourceDistribution: Record<SourceType, number>;
  uniqueResultRatio: number; // percentage
  sourceDiversity: number; // score
  averageRelevance: number;
  averageEvidence: number;
}

export interface SearchEvent {
  id: string;
  query: string;
  mode: SearchMode;
  timestamp: string;
  providersUsed: string[];
  queryVariants: string[];
  resultsCollected: number;
  uniqueResults: number;
  duplicateGroups: number;
  durationMs: number;
  errors: string[];
}

export interface ProviderStatus {
  id: string;
  name: string;
  active: boolean;
  status: 'healthy' | 'degraded' | 'unavailable' | 'mock';
  lastChecked: string;
  errorCount: number;
  latencyMs: number;
  supportedModes: SearchMode[];
}

export interface ProductAnalytics {
  totalSearches: number;
  searchesToday: number;
  avgDurationMs: number;
  uniqueResultRate: number;
  providerErrorRate: number;
  mostUsedMode: SearchMode;
  modeBreakdown: Record<SearchMode, number>;
  providerBreakdown: Record<string, number>;
}

export interface SearchRequestPayload {
  query: string;
  mode?: SearchMode;
}

export interface SearchResponsePayload {
  query: string;
  mode: SearchMode;
  metrics: SearchMetrics;
  results: SearchResult[];
  duplicateGroups: DuplicateGroup[];
  events: SearchEvent;
  errors: string[];
}
