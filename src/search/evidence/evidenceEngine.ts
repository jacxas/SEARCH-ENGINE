import { SearchResult } from '../../types';

export function calculateEvidenceScores(results: SearchResult[], query: string): SearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return results.map(res => {
    // 1. Relevance Score calculation based on query term matches in title and snippet
    let matchCount = 0;
    const textToCheck = `${res.title} ${res.snippet} ${res.domain}`.toLowerCase();
    
    for (const term of queryTerms) {
      if (textToCheck.includes(term)) {
        matchCount++;
      }
    }

    const termMatchRatio = queryTerms.length > 0 ? matchCount / queryTerms.length : 1;
    let relevance = Math.min(98, Math.max(45, Math.floor(termMatchRatio * 75 + (res.relevanceScore || 70) * 0.25)));

    // Domain authority bonus for trusted domains
    const trustedDomains = ['github.com', 'stackoverflow.com', 'wikipedia.org', 'mozilla.org', 'npmjs.com', 'arxiv.org', 'golang.org', 'nodejs.org', 'react.dev'];
    if (trustedDomains.some(d => res.domain.includes(d))) {
      relevance = Math.min(99, relevance + 8);
    }

    // 2. Freshness score
    const freshness = res.freshnessScore || Math.floor(60 + Math.random() * 35);

    // 3. Composite Evidence Score formula: (relevance * 0.45) + (freshness * 0.25) + (corroborationBonus * 0.30)
    const corroborationBonus = (res.duplicateCount && res.duplicateCount > 1) ? 95 : 70;
    const evidenceScore = Math.min(99, Math.max(50, Math.floor(relevance * 0.45 + freshness * 0.25 + corroborationBonus * 0.30)));

    return {
      ...res,
      relevanceScore: relevance,
      freshnessScore: freshness,
      evidenceScore,
      matchedTerms: queryTerms
    };
  });
}

export function calculateMetricsSummary(results: SearchResult[], uniqueResults: SearchResult[], duplicateGroupsCount: number, durationMs: number, providersCount: number, queryVariantsCount: number) {
  const sourceDistribution: Record<string, number> = {
    web: 0,
    document: 0,
    technical: 0,
    community: 0,
    academic: 0,
    news: 0,
    other: 0
  };

  uniqueResults.forEach(r => {
    const st = r.sourceType || 'web';
    sourceDistribution[st] = (sourceDistribution[st] || 0) + 1;
  });

  const uniqueResultRatio = results.length > 0 ? Number(((uniqueResults.length / results.length) * 100).toFixed(1)) : 100;
  
  // Source diversity score (0-10 scale based on unique source types and providers present)
  const activeTypes = Object.values(sourceDistribution.valueOf()).filter(v => (v as number) > 0).length;
  const sourceDiversity = Number(Math.min(10, activeTypes * 1.8 + (providersCount * 0.5)).toFixed(1));

  const totalRel = uniqueResults.reduce((acc, r) => acc + (r.relevanceScore || 75), 0);
  const averageRelevance = uniqueResults.length > 0 ? Math.round(totalRel / uniqueResults.length) : 75;

  const totalEv = uniqueResults.reduce((acc, r) => acc + (r.evidenceScore || 74), 0);
  const averageEvidence = uniqueResults.length > 0 ? Math.round(totalEv / uniqueResults.length) : 74;

  return {
    resultsCollected: results.length,
    uniqueResults: uniqueResults.length,
    duplicateGroups: duplicateGroupsCount,
    providersCount,
    queryVariantsCount,
    durationMs,
    sourceDistribution: sourceDistribution as Record<any, number>,
    uniqueResultRatio,
    sourceDiversity,
    averageRelevance,
    averageEvidence
  };
}
