import { analyzeAndExpandQuery } from './queryEngine';
import { providerRegistry } from '../providers/registry';
import { normalizeResult } from '../normalizer/normalizer';
import { classifyResult } from '../classifier/classifier';
import { deduplicateResults } from '../deduplicator/deduplicator';
import { calculateEvidenceScores, calculateMetricsSummary } from '../evidence/evidenceEngine';
import { SearchMode, SearchEvent, SearchResponsePayload } from '../../types';

// Shared search pipeline used by both the local dev server (server.ts)
// and the Vercel serverless function (api/search.ts), so behavior never drifts between environments.
export async function runSearch(query: string, mode: SearchMode): Promise<SearchResponsePayload> {
  const startTime = Date.now();

  const analysis = analyzeAndExpandQuery(query, mode);
  const providerRes = await providerRegistry.executeSearch(query, mode, analysis.variants);

  const normalizedResults = providerRes.results.map((r, idx) => {
    const norm = normalizeResult(r, idx);
    const sourceType = classifyResult(norm.url, norm.title, norm.snippet || '', norm.sourceProvider);
    return { ...norm, sourceType };
  });

  const scoredResults = calculateEvidenceScores(normalizedResults, query);
  const { uniqueResults, duplicateGroups } = deduplicateResults(scoredResults);

  const durationMs = Date.now() - startTime;
  const metrics = calculateMetricsSummary(
    scoredResults,
    uniqueResults,
    duplicateGroups.length,
    durationMs,
    providerRes.providersUsed.length,
    analysis.variants.length
  );

  const searchEvent: SearchEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    query,
    mode,
    timestamp: new Date().toISOString(),
    providersUsed: providerRes.providersUsed,
    queryVariants: analysis.variants,
    resultsCollected: scoredResults.length,
    uniqueResults: uniqueResults.length,
    duplicateGroups: duplicateGroups.length,
    durationMs,
    errors: providerRes.errors
  };

  return {
    query,
    mode,
    metrics,
    results: uniqueResults,
    duplicateGroups,
    events: searchEvent,
    errors: providerRes.errors
  };
}
