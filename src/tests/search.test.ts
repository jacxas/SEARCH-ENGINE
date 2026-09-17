import assert from 'assert';
import { normalizeUrl } from '../search/normalizer/normalizer';
import { classifyResult } from '../search/classifier/classifier';
import { deduplicateResults } from '../search/deduplicator/deduplicator';
import { analyzeAndExpandQuery } from '../search/engine/queryEngine';
import { SearchResult } from '../types';

export function runBasicTests() {
  console.log('Running search engine unit tests...');

  // 1. Test URL Normalization & Tracking Param Stripping
  const raw = 'https://www.Example.com/article/?utm_source=twitter&utm_medium=social#hash';
  const { normalizedUrl, domain } = normalizeUrl(raw);
  assert.strictEqual(domain, 'example.com', 'Domain extraction failed');
  assert.ok(!normalizedUrl.includes('utm_source'), 'Tracking parameters not stripped');
  console.log('✓ URL Normalization test passed');

  // 2. Test Classification
  const st1 = classifyResult('https://github.com/facebook/react', 'React Repo', 'JS library', 'GitHub');
  assert.strictEqual(st1, 'technical', 'Technical classification failed');

  const st2 = classifyResult('https://arxiv.org/abs/2103.0002', 'Paper PDF', 'Research abstract', 'arXiv');
  assert.strictEqual(st2, 'academic', 'Academic classification failed');
  console.log('✓ Result Classification test passed');

  // 3. Test Deduplication
  const resList: SearchResult[] = [
    {
      id: '1',
      title: 'Guide',
      url: 'https://example.com/guide?utm_source=1',
      domain: 'example.com',
      sourceProvider: 'ProvA',
      sourceType: 'web',
      retrievedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Guide Duplicate',
      url: 'https://www.example.com/guide',
      domain: 'example.com',
      sourceProvider: 'ProvB',
      sourceType: 'web',
      retrievedAt: new Date().toISOString()
    }
  ];
  const { uniqueResults, duplicateGroups } = deduplicateResults(resList);
  assert.strictEqual(uniqueResults.length, 1, 'Deduplication failed to group identical URLs');
  assert.strictEqual(duplicateGroups.length, 1, 'Duplicate group count mismatch');
  console.log('✓ Deduplication test passed');

  // 4. Test Query Expansion
  const expansion = analyzeAndExpandQuery('nextjs electron', 'deep');
  assert.ok(expansion.variants.length > 1, 'Query expansion failed to generate variants');
  assert.ok(expansion.variants.some(v => v.includes('github.com')), 'Technical strategy expansion missing');
  console.log('✓ Query Expansion test passed');

  console.log('All search engine tests passed successfully!');
}

// Automatically execute tests in development or test runs
try {
  runBaseTestsSafely();
} catch (e) {
  console.error('Test execution error:', e);
}

function runBaseTestsSafely() {
  runBasicTests();
}
