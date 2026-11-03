// Test runner: executes all suites and exits non-zero if any of them fails.
// Usage: npm test  (tsx src/tests/run.ts)
process.env.SEARCH_MOCK = 'true'; // deterministic offline data for e2e tests

import { runBasicTests } from './search.test';
import { runEngineTests } from './engine.test';

async function main() {
  const suites: Array<[string, () => unknown | Promise<unknown>]> = [
    ['search.test', runBasicTests],
    ['engine.test', runEngineTests]
  ];

  let failed = 0;
  for (const [name, fn] of suites) {
    try {
      await fn();
      console.log(`✓ suite "${name}" passed\n`);
    } catch (e) {
      failed++;
      console.error(`✗ suite "${name}" FAILED:`);
      console.error(e);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} of ${suites.length} test suites failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${suites.length} test suites passed.`);
}

main();
