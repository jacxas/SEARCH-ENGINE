import { SearchResult } from '../../types';

export function normalizeUrl(rawUrl: string): { normalizedUrl: string; domain: string } {
  try {
    let cleanUrl = rawUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const parsed = new URL(cleanUrl);

    // Remove tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', '_ga', 'mc_cid', 'mc_eid', 'ref', 'source'
    ];

    trackingParams.forEach(param => {
      parsed.searchParams.delete(param);
    });

    // Normalize trailing slash for root paths, or strip trailing slash for standard paths
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    parsed.pathname = pathname;
    const normalizedUrl = parsed.toString();
    const domain = parsed.hostname.replace(/^www\./, '');

    return { normalizedUrl, domain };
  } catch {
    return { normalizedUrl: rawUrl, domain: extractDomainFallback(rawUrl) };
  }
}

function extractDomainFallback(url: string): string {
  try {
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n+~\s]+)/im);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

export function normalizeResult(result: Partial<SearchResult>, index: number): SearchResult {
  const { normalizedUrl, domain } = normalizeUrl(result.url || 'https://example.com');
  
  const title = (result.title || 'Untitled Result').trim();
  const snippet = (result.snippet || '').trim();
  const id = result.id || `res-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`;

  return {
    id,
    title,
    url: normalizedUrl,
    domain,
    snippet: snippet || `Discovered resource on ${domain} related to query search terms.`,
    sourceProvider: result.sourceProvider || 'GeneralWeb',
    sourceType: result.sourceType || 'web',
    publishedAt: result.publishedAt || new Date().toISOString().split('T')[0],
    retrievedAt: new Date().toISOString(),
    relevanceScore: result.relevanceScore ?? Math.floor(70 + Math.random() * 28),
    evidenceScore: result.evidenceScore ?? Math.floor(65 + Math.random() * 32),
    freshnessScore: result.freshnessScore ?? Math.floor(50 + Math.random() * 45),
    matchedTerms: result.matchedTerms || []
  };
}
