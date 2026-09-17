import { SearchResult, DuplicateGroup } from '../../types';

export function deduplicateResults(results: SearchResult[]): {
  uniqueResults: SearchResult[];
  duplicateGroups: DuplicateGroup[];
} {
  const urlMap = new Map<string, SearchResult[]>();

  // Group by normalized hostname + pathname (ignoring query params)
  for (const res of results) {
    try {
      const parsed = new URL(res.url);
      const key = `${parsed.hostname.toLowerCase()}${parsed.pathname.toLowerCase()}`;
      if (!urlMap.has(key)) {
        urlMap.set(key, []);
      }
      urlMap.get(key)!.push(res);
    } catch {
      const fallbackKey = res.url.toLowerCase().split('?')[0];
      if (!urlMap.has(fallbackKey)) {
        urlMap.set(fallbackKey, []);
      }
      urlMap.get(fallbackKey)!.push(res);
    }
  }

  const uniqueResults: SearchResult[] = [];
  const duplicateGroups: DuplicateGroup[] = [];
  let groupCounter = 1;

  for (const [, groupItems] of urlMap.entries()) {
    if (groupItems.length === 0) continue;

    // Sort by highest relevance & evidence score
    groupItems.sort((a, b) => (b.evidenceScore || 0) - (a.evidenceScore || 0));

    const primary = groupItems[0];
    const groupId = `grp-${groupCounter++}`;

    if (groupItems.length > 1) {
      primary.isDuplicate = false;
      primary.duplicateCount = groupItems.length;
      primary.duplicateGroup = groupId;
      primary.sourcesList = groupItems.map(item => ({
        provider: item.sourceProvider,
        url: item.url
      }));

      duplicateGroups.push({
        groupId,
        primaryResultId: primary.id,
        memberResultIds: groupItems.map(item => item.id),
        count: groupItems.length
      });

      uniqueResults.push(primary);
    } else {
      primary.isDuplicate = false;
      primary.duplicateCount = 1;
      primary.sourcesList = [{ provider: primary.sourceProvider, url: primary.url }];
      uniqueResults.push(primary);
    }
  }

  return { uniqueResults, duplicateGroups };
}
