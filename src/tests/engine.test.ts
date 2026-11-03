import assert from 'assert';
import { calculateEvidenceScores, calculateMetricsSummary } from '../search/evidence/evidenceEngine';
import { classifyResult } from '../search/classifier/classifier';
import { generateMockResults } from '../search/providers/mockData';
import { runSearch } from '../search/engine/runSearch';
import { deduplicateResults } from '../search/deduplicator/deduplicator';
import { parsePagination, paginatePayload, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../search/engine/paginate';
import { normalizeResult } from '../search/normalizer/normalizer';
import { isSearchMode, SEARCH_MODES, SearchResult, SearchResponsePayload } from '../types';

function makeResult(partial: Partial<SearchResult>): SearchResult {
  return {
    id: partial.id || 'x',
    title: partial.title || 't',
    url: partial.url || 'https://example.com/x',
    domain: partial.domain || 'example.com',
    sourceProvider: partial.sourceProvider || 'P',
    sourceType: partial.sourceType || 'web',
    retrievedAt: partial.retrievedAt || new Date().toISOString(),
    ...partial
  } as SearchResult;
}

export async function runEngineTests() {
  console.log('Running engine tests...');

  // 1. Classifier: one case per source type
  assert.strictEqual(classifyResult('https://example.com/files/spec.pdf', 'Spec', 'pdf document', 'Prov'), 'document', 'PDF classification failed');
  assert.strictEqual(classifyResult('https://github.com/facebook/react', 'Repo', 'code', 'GitHub'), 'technical', 'GitHub classification failed');
  assert.strictEqual(classifyResult('https://www.reddit.com/r/programming/x', 'Thread', 'discussion', 'Community'), 'community', 'Reddit classification failed');
  assert.strictEqual(classifyResult('https://arxiv.org/abs/2103.0002', 'Paper', 'abstract', 'Academic'), 'academic', 'arXiv classification failed');
  assert.strictEqual(classifyResult('https://techcrunch.com/2026/01/x', 'News', 'article', 'General'), 'news', 'News classification failed');
  assert.strictEqual(classifyResult('https://blog.example.com/post', 'Post', 'thoughts', 'General'), 'web', 'Generic web classification failed');
  console.log('✓ Classifier tests passed');

  // 2. Evidence scoring: better term matches => higher relevance; trusted domain bonus
  const query = 'react hooks';
  const [good, bad] = calculateEvidenceScores([
    makeResult({ id: 'g', title: 'react hooks guide', url: 'https://react.dev/hooks', domain: 'react.dev', snippet: 'everything about react hooks', sourceType: 'technical' }),
    makeResult({ id: 'b', title: 'unrelated cooking blog', url: 'https://example.com/cake', domain: 'example.com', snippet: 'a cake recipe' })
  ], query);
  assert.ok((good.relevanceScore || 0) > (bad.relevanceScore || 0), 'Relevance should be higher when query terms match');
  assert.ok(good.evidenceScore! >= 50 && good.evidenceScore! <= 99, 'Evidence score out of range');
  assert.deepStrictEqual(good.matchedTerms, ['react', 'hooks'], 'matchedTerms mismatch');
  console.log('✓ Evidence scoring tests passed');

  // 3. Metrics summary math
  const m = calculateMetricsSummary([good, bad], [good], 0, 10, 5, 3);
  assert.strictEqual(m.resultsCollected, 2, 'resultsCollected mismatch');
  assert.strictEqual(m.uniqueResults, 1, 'uniqueResults mismatch');
  assert.strictEqual(m.uniqueResultRatio, 50, 'uniqueResultRatio mismatch');
  assert.strictEqual(m.providersCount, 5, 'providersCount mismatch');
  console.log('✓ Metrics summary tests passed');

  // 4. Search mode validation helpers
  assert.strictEqual(SEARCH_MODES.length, 6, 'SEARCH_MODES should list 6 modes');
  assert.ok(isSearchMode('deep') && isSearchMode('web'), 'valid modes rejected');
  assert.ok(!isSearchMode('banana') && !isSearchMode('') && !isSearchMode(undefined), 'invalid modes accepted');
  console.log('✓ Search mode validation tests passed');

  // 5. Mock data is deterministic (same provider+query => same results)
  const a = generateMockResults('web-general', 'General Web Index', 'deterministic test', 'deterministic test', 5);
  const b = generateMockResults('web-general', 'General Web Index', 'deterministic test', 'deterministic test', 5);
  assert.strictEqual(a.length, 5, 'mock should return requested count');
  assert.deepStrictEqual(a.map(r => r.url), b.map(r => r.url), 'mock results not deterministic');
  assert.ok(a.every(r => r.url.startsWith('https://')), 'mock URLs should be absolute https');
  console.log('✓ Mock determinism tests passed');

  // 6. normalizeResult fills defaults and strips tracking params
  const norm = normalizeResult({ title: ' T ', url: 'https://WWW.Example.com/a/?utm_source=x' }, 0);
  assert.strictEqual(norm.domain, 'example.com', 'domain should drop www.');
  assert.ok(!norm.url.includes('utm_source'), 'tracking param not stripped');
  assert.ok(norm.snippet && norm.snippet.length > 0, 'snippet default missing');
  console.log('✓ normalizeResult tests passed');

  // 7. End-to-end runSearch with SEARCH_MOCK=true
  process.env.SEARCH_MOCK = 'true';
  const res = await runSearch('nextjs routing', 'deep');
  assert.ok(res.results.length > 0, 'e2e mock search returned no results');
  assert.strictEqual(res.results.length, res.metrics.uniqueResults, 'results should equal uniqueResults');
  assert.ok(res.events.queryVariants.length > 1, 'deep mode should expand query variants');
  assert.ok(res.metrics.providersCount >= 1, 'no providers used');
  assert.strictEqual(new Set(res.results.map(r => r.id)).size, res.results.length, 'duplicate result ids');
  // every unique result carries evidence fields
  assert.ok(res.results.every(r => typeof r.evidenceScore === 'number' && typeof r.relevanceScore === 'number'), 'missing scores');
  console.log('✓ End-to-end runSearch (mock) tests passed');

  // 8. Dedup by title similarity: same article on different URLs must group together
  const byTitle = deduplicateResults([
    makeResult({ id: 't1', title: 'React Hooks Performance Guide', url: 'https://blog-a.com/react-hooks-performance', evidenceScore: 80 }),
    makeResult({ id: 't2', title: 'React hooks performance guide!', url: 'https://blog-b.com/news/react-hooks-performance-guide', evidenceScore: 90 }),
    makeResult({ id: 't3', title: 'Completely different topic about cooking', url: 'https://blog-c.com/cooking', evidenceScore: 70 })
  ]);
  assert.strictEqual(byTitle.uniqueResults.length, 2, 'similar titles on different URLs should merge into one');
  assert.strictEqual(byTitle.duplicateGroups.length, 1, 'expected one duplicate group');
  assert.strictEqual(byTitle.uniqueResults.find(r => r.duplicateCount === 2)?.id, 't2', 'highest evidence score should be primary');
  console.log('✓ Title-similarity dedup tests passed');

  // 9. Pagination parsing & slicing
  assert.deepStrictEqual(parsePagination(undefined, undefined), { page: 1, pageSize: DEFAULT_PAGE_SIZE }, 'default pagination mismatch');
  assert.deepStrictEqual(parsePagination('3', '10'), { page: 3, pageSize: 10 }, 'explicit pagination mismatch');
  assert.deepStrictEqual(parsePagination('-5', '9999'), { page: 1, pageSize: MAX_PAGE_SIZE }, 'clamping failed');
  assert.deepStrictEqual(parsePagination('abc', 'xyz'), { page: 1, pageSize: DEFAULT_PAGE_SIZE }, 'garbage input should fall back to defaults');

  const full = await runSearch('pagination test query', 'web');
  const page1 = paginatePayload(full, 1, 10);
  const page2 = paginatePayload(full, 2, 10);
  assert.strictEqual(page1.results.length, Math.min(10, full.results.length), 'page 1 size mismatch');
  assert.strictEqual(page1.pagination?.totalResults, full.results.length, 'totalResults mismatch');
  assert.strictEqual(page1.pagination?.totalPages, Math.max(1, Math.ceil(full.results.length / 10)), 'totalPages mismatch');
  assert.ok(page1.pagination?.hasMore === (full.results.length > 10), 'hasMore mismatch');
  if (full.results.length > 10) {
    assert.strictEqual(page2.results.length, Math.min(10, full.results.length - 10), 'page 2 size mismatch');
    assert.ok(page1.results[0].id !== page2.results[0]?.id, 'pages should not overlap');
  }
  // asking beyond the last page clamps to the last page
  const beyond = paginatePayload(full, 999, 10);
  assert.strictEqual(beyond.pagination?.page, beyond.pagination?.totalPages, 'page should clamp to totalPages');
  console.log('✓ Pagination tests passed');

  console.log('All engine tests passed successfully!');
}
