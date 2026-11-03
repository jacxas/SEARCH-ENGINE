import { SearchResult, SourceType } from '../../types';
import { normalizeResult } from '../normalizer/normalizer';

// Deterministic mock search data, used when SEARCH_MOCK=true (offline/tests/demo).
// Results are stable for a given (providerId, query) pair so tests and demos are reproducible.

interface MockTemplate {
  providerId: string;
  sourceType: SourceType;
  domains: string[];
  titleTemplates: string[];
  snippetTemplates: string[];
}

const TEMPLATES: MockTemplate[] = [
  {
    providerId: 'web-general',
    sourceType: 'web',
    domains: ['en.wikipedia.org', 'dev.to', 'medium.com', 'smashingmagazine.com', 'css-tricks.com'],
    titleTemplates: [
      '{q} — Complete Overview and Key Concepts',
      'Understanding {q}: A Practical Guide',
      '{q} Explained: Best Practices in 2026',
      'What is {q}? Everything You Need to Know',
      'The Ultimate Resource on {q}'
    ],
    snippetTemplates: [
      'A comprehensive reference covering {q}, including background, real-world use cases, and expert recommendations.',
      'Learn how {q} works under the hood, with code examples, performance notes, and common pitfalls to avoid.',
      'An in-depth look at {q}: architecture decisions, trade-offs, and how top teams apply it in production.'
    ]
  },
  {
    providerId: 'tech-github',
    sourceType: 'technical',
    domains: ['github.com', 'stackoverflow.com', 'developer.mozilla.org', 'docs.npmjs.com'],
    titleTemplates: [
      '{q} — GitHub repository and examples',
      'How to implement {q} (Stack Overflow)',
      '{q} API reference and documentation',
      'Official {q} docs on MDN / npm'
    ],
    snippetTemplates: [
      'Open-source implementation of {q} with tests, CI, and usage examples. MIT licensed.',
      'Step-by-step code for {q}: the accepted answer with 500+ upvotes, updated for the latest version.',
      'Technical reference for {q}: parameters, return values, edge cases, and migration notes.'
    ]
  },
  {
    providerId: 'community-discussions',
    sourceType: 'community',
    domains: ['reddit.com', 'news.ycombinator.com', 'newsletter.example.com', 'forum.example.org'],
    titleTemplates: [
      'r/programming: What do you think about {q}?',
      'Ask HN: How are you using {q} in production?',
      'Discussion: {q} — experiences and lessons learned',
      'Weekly thread: {q} tips from the community'
    ],
    snippetTemplates: [
      'Honest discussion about {q}: what works, what does not, and what the maintainers will not tell you.',
      'Community consensus on {q} after 3 years in production — the good, the bad, and the rewrites.',
      'People who actually shipped {q} share their numbers: latency, cost, and maintenance overhead.'
    ]
  },
  {
    providerId: 'documents',
    sourceType: 'document',
    domains: ['docs.example.com', 'archive.org', 'manuals.example.org', 'standards.example.net'],
    titleTemplates: [
      '{q} — Official Specification (PDF)',
      'Whitepaper: {q} Architecture and Design Decisions',
      '{q} User Manual, 4th Edition (PDF)',
      'Technical report on {q}: methodology and results'
    ],
    snippetTemplates: [
      'Formal specification covering {q}: terminology, invariants, and conformance requirements (PDF, 42 pages).',
      'Peer-reviewed whitepaper analyzing {q} with benchmarks, case studies, and a reproducible appendix.',
      'The complete {q} manual: installation, configuration, troubleshooting, and advanced tuning.'
    ]
  },
  {
    providerId: 'academic',
    sourceType: 'academic',
    domains: ['arxiv.org', 'doi.org', 'nature.com', 'openreview.net'],
    titleTemplates: [
      'Advances in {q}: A Survey (arXiv)',
      'On the Complexity of {q} — peer-reviewed paper',
      '{q} at Scale: Empirical Study of 10,000 Deployments',
      'A Novel Approach to {q} (NeurIPS-style preprint)'
    ],
    snippetTemplates: [
      'We present a systematic survey of {q}, covering 200+ papers, open challenges, and future research directions.',
      'Our peer-reviewed study evaluates {q} across 10,000 production deployments; effect sizes and stats included.',
      'A novel method for {q} achieving state-of-the-art results on 6 benchmarks; code and data released openly.'
    ]
  }
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function fill(template: string, q: string): string {
  return template.replaceAll('{q}', q);
}

export function generateMockResults(
  providerId: string,
  providerName: string,
  query: string,
  variant: string,
  count: number
): SearchResult[] {
  const template = TEMPLATES.find(t => t.providerId === providerId) || TEMPLATES[0];
  const baseSeed = hashString(`${providerId}::${query}`);
  const results: SearchResult[] = [];

  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i * 7919;
    const domain = pick(template.domains, seed >> 3);
    const title = fill(pick(template.titleTemplates, seed), query);
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'topic';
    const isPdf = template.sourceType === 'document' && i % 3 === 0;
    const path = isPdf ? `/docs/${slug}-${i + 1}.pdf` : `/${slug}/${slug}-${i + 1}`;
    // Occasionally reuse the same URL across providers to exercise deduplication.
    const shared = i === 0 ? `https://${domain}${path}` : `https://www.${domain}${path}?utm_source=mock&utm_medium=demo`;

    results.push(normalizeResult({
      title,
      url: shared,
      snippet: fill(pick(template.snippetTemplates, seed >> 5), query),
      sourceProvider: providerName,
      sourceType: template.sourceType,
      publishedAt: `2026-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`,
      queryVariantUsed: variant,
      matchedTerms: query.toLowerCase().split(/\s+/).slice(0, 4)
    }, i));
  }

  return results;
}
