// NOTE: unlike server.ts's in-memory version, a serverless function has no
// persistent memory across invocations (each request may hit a cold or different instance). These numbers are a static baseline placeholder,
// not real accumulating analytics. Wiring real analytics needs a DB
// (e.g. Vercel Postgres/KV) — flagged here on purpose instead of faking it.
export default function handler(req: any, res: any) {
  res.status(200).json({
    totalSearches: 1284,
    searchesToday: 142,
    avgDurationMs: 1680,
    uniqueResultRate: 61.4,
    providerErrorRate: 1.8,
    mostUsedMode: 'deep',
    modeBreakdown: { web: 420, deep: 480, technical: 210, community: 110, documents: 54, academic: 10 },
    recentEvents: []
  });
}
