import { SearchResult, DuplicateGroup } from '../../types';

// Titles are compared after lowercasing, stripping punctuation and removing
// common stopwords, so "React Hooks Guide!" and "react hooks guide" match.
const TITLE_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'with', 'at', 'by',
  'is', 'are', 'vs', 'your', 'you', '2024', '2025', '2026'
]);

function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !TITLE_STOPWORDS.has(w))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
}

// Two titles are considered the same article when their token sets overlap heavily.
const TITLE_SIMILARITY_THRESHOLD = 0.7;

// Union-find over result indexes, used to merge URL groups with similar titles.
class DSU {
  private parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }
    return x;
  }
  union(a: number, b: number) {
    this.parent[this.find(a)] = this.find(b);
  }
}

export function deduplicateResults(results: SearchResult[]): {
  uniqueResults: SearchResult[];
  duplicateGroups: DuplicateGroup[];
} {
  // 1. Group by normalized hostname (without "www.") + pathname (ignoring query params)
  const urlMap = new Map<string, number[]>();
  results.forEach((res, idx) => {
    let key: string;
    try {
      const parsed = new URL(res.url);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      key = `${host}${parsed.pathname.toLowerCase()}`;
    } catch {
      key = res.url.toLowerCase().replace(/^https?:\/\/www\./, 'https://').split('?')[0];
    }
    if (!urlMap.has(key)) urlMap.set(key, []);
    urlMap.get(key)!.push(idx);
  });

  // 2. Merge groups whose titles describe the same article (even across different URLs)
  const groups = Array.from(urlMap.values());
  const dsu = new DSU(results.length);
  // Members of the same URL group start out already united
  for (const g of groups) {
    for (let k = 1; k < g.length; k++) dsu.union(g[0], g[k]);
  }
  const tokens = results.map(r => titleTokens(r.title || ''));
  for (let gi = 0; gi < groups.length; gi++) {
    for (let gj = gi + 1; gj < groups.length; gj++) {
      let similar = false;
      for (const i of groups[gi]) {
        for (const j of groups[gj]) {
          if (jaccard(tokens[i], tokens[j]) >= TITLE_SIMILARITY_THRESHOLD) {
            similar = true;
            break;
          }
        }
        if (similar) break;
      }
      if (similar) {
        dsu.union(groups[gi][0], groups[gj][0]);
      }
    }
  }

  // 3. Collect merged groups
  const merged = new Map<number, number[]>();
  results.forEach((_, idx) => {
    const root = dsu.find(idx);
    if (!merged.has(root)) merged.set(root, []);
    merged.get(root)!.push(idx);
  });

  const uniqueResults: SearchResult[] = [];
  const duplicateGroups: DuplicateGroup[] = [];
  let groupCounter = 1;

  for (const [, memberIdxs] of merged) {
    if (memberIdxs.length === 0) continue;

    // Sort by highest relevance & evidence score
    const groupItems = memberIdxs
      .map(i => results[i])
      .sort((a, b) => (b.evidenceScore || 0) - (a.evidenceScore || 0));

    const primary = groupItems[0];
    const groupId = `grp-${groupCounter++}`;

    primary.isDuplicate = false;
    primary.duplicateCount = groupItems.length;
    if (groupItems.length > 1) {
      primary.duplicateGroup = groupId;
      duplicateGroups.push({
        groupId,
        primaryResultId: primary.id,
        memberResultIds: groupItems.map(item => item.id),
        count: groupItems.length
      });
    }
    primary.sourcesList = groupItems.map(item => ({
      provider: item.sourceProvider,
      url: item.url
    }));

    uniqueResults.push(primary);
  }

  return { uniqueResults, duplicateGroups };
}
