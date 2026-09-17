import { SearchMode } from '../../types';

export interface QueryAnalysis {
  originalQuery: string;
  mode: SearchMode;
  intent: string;
  variants: string[];
  selectedStrategies: string[];
}

export function analyzeAndExpandQuery(query: string, mode: SearchMode = 'web'): QueryAnalysis {
  const cleanQuery = query.trim().replace(/\s+/g, ' ');
  const variants: string[] = [cleanQuery];
  const strategies: string[] = ['General Web Index'];

  if (!cleanQuery) {
    return {
      originalQuery: '',
      mode,
      intent: 'empty',
      variants: [],
      selectedStrategies: []
    };
  }

  const lower = cleanQuery.toLowerCase();

  // Intent detection
  let intent = 'informational';
  if (lower.includes('how to') || lower.includes('tutorial') || lower.includes('guide') || lower.includes('setup')) {
    intent = 'instructional';
  } else if (lower.includes('error') || lower.includes('bug') || lower.includes('issue') || lower.includes('problem') || lower.includes('fail')) {
    intent = 'troubleshooting';
  } else if (lower.includes('pdf') || lower.includes('spec') || lower.includes('manual') || lower.includes('paper')) {
    intent = 'document_research';
  } else if (lower.includes('github') || lower.includes('api') || lower.includes('code') || lower.includes('npm')) {
    intent = 'technical_dev';
  }

  // Mode & strategy expansion
  if (mode === 'deep' || mode === 'technical') {
    strategies.push('Technical Code & Documentation Strategy');
    variants.push(`"${cleanQuery}"`);
    variants.push(`${cleanQuery} site:github.com`);
    variants.push(`${cleanQuery} documentation OR docs`);
    if (intent === 'troubleshooting') {
      variants.push(`${cleanQuery} site:stackoverflow.com OR issue`);
    }
  }

  if (mode === 'deep' || mode === 'community') {
    strategies.push('Community & Discussions Strategy');
    variants.push(`${cleanQuery} site:reddit.com`);
    variants.push(`${cleanQuery} discussions OR forum`);
    variants.push(`${cleanQuery} site:news.ycombinator.com`);
  }

  if (mode === 'documents' || mode === 'academic') {
    strategies.push('Documents & Academic Research Strategy');
    variants.push(`${cleanQuery} filetype:pdf`);
    variants.push(`${cleanQuery} whitepaper OR manual OR specification`);
    if (mode === 'academic') {
      strategies.push('Academic Scholarly Index');
      variants.push(`${cleanQuery} site:arxiv.org`);
    }
  }

  if (mode === 'web' && variants.length === 1) {
    variants.push(`${cleanQuery} guide`);
    variants.push(`${cleanQuery} overview`);
  }

  return {
    originalQuery: cleanQuery,
    mode,
    intent,
    variants: Array.from(new Set(variants)),
    selectedStrategies: Array.from(new Set(strategies))
  };
}
