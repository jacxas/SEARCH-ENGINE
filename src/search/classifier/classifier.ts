import { SourceType } from '../../types';

export function classifyResult(url: string, title: string, snippet: string, provider: string): SourceType {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerSnippet = snippet.toLowerCase();
  const combined = `${lowerUrl} ${lowerTitle} ${lowerSnippet}`;

  if (
    lowerUrl.endsWith('.pdf') ||
    lowerUrl.includes('/pdf/') ||
    lowerUrl.includes('/doc') ||
    lowerUrl.includes('manual') ||
    lowerUrl.includes('specification') ||
    combined.includes('documentation') ||
    combined.includes('whitepaper')
  ) {
    if (lowerUrl.endsWith('.pdf') || combined.includes('pdf')) {
      return 'document';
    }
  }

  if (
    lowerUrl.includes('github.com') ||
    lowerUrl.includes('gitlab.com') ||
    lowerUrl.includes('stackoverflow.com') ||
    lowerUrl.includes('stackexchange.com') ||
    lowerUrl.includes('npmjs.com') ||
    lowerUrl.includes('pypi.org') ||
    lowerUrl.includes('docs.') ||
    lowerUrl.includes('developer.') ||
    provider.toLowerCase().includes('tech') ||
    provider.toLowerCase().includes('github')
  ) {
    return 'technical';
  }

  if (
    lowerUrl.includes('reddit.com') ||
    lowerUrl.includes('news.ycombinator.com') ||
    lowerUrl.includes('twitter.com') ||
    lowerUrl.includes('x.com') ||
    lowerUrl.includes('discord.com') ||
    lowerUrl.includes('forum') ||
    lowerUrl.includes('discussions') ||
    provider.toLowerCase().includes('community') ||
    provider.toLowerCase().includes('reddit')
  ) {
    return 'community';
  }

  if (
    lowerUrl.includes('arxiv.org') ||
    lowerUrl.includes('.edu') ||
    lowerUrl.includes('scholar.google') ||
    lowerUrl.includes('jstor.org') ||
    lowerUrl.includes('researchgate') ||
    provider.toLowerCase().includes('academic')
  ) {
    return 'academic';
  }

  if (
    lowerUrl.includes('news.') ||
    lowerUrl.includes('reuters.com') ||
    lowerUrl.includes('bbc.') ||
    lowerUrl.includes('techcrunch.com') ||
    lowerUrl.includes('theverge.com')
  ) {
    return 'news';
  }

  if (provider.toLowerCase().includes('doc')) {
    return 'document';
  }

  return 'web';
}
