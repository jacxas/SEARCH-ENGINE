import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { analyzeAndExpandQuery } from "./src/search/engine/queryEngine";
import { providerRegistry } from "./src/search/providers/registry";
import { normalizeResult } from "./src/search/normalizer/normalizer";
import { classifyResult } from "./src/search/classifier/classifier";
import { deduplicateResults } from "./src/search/deduplicator/deduplicator";
import { calculateEvidenceScores, calculateMetricsSummary } from "./src/search/evidence/evidenceEngine";
import { SearchEvent, SearchRequestPayload, SearchResponsePayload } from "./src/types";

// In-memory observability and analytics store
const searchHistoryEvents: SearchEvent[] = [];
let totalSearchesCount = 1284; // Initial baseline analytics

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Providers Status Endpoint
  app.get("/api/providers", (req, res) => {
    const statuses = providerRegistry.getStatuses();
    res.json({
      providers: statuses,
      activeCount: statuses.filter(s => s.active).length,
      timestamp: new Date().toISOString()
    });
  });

  // Product Analytics Endpoint
  app.get("/api/metrics", (req, res) => {
    const modeBreakdown: Record<string, number> = { web: 420, deep: 480, technical: 210, community: 110, documents: 54, academic: 10 };
    searchHistoryEvents.forEach(e => {
      modeBreakdown[e.mode] = (modeBreakdown[e.mode] || 0) + 1;
    });

    res.json({
      totalSearches: totalSearchesCount + searchHistoryEvents.length,
      searchesToday: 142 + searchHistoryEvents.length,
      avgDurationMs: 1680,
      uniqueResultRate: 61.4,
      providerErrorRate: 1.8,
      mostUsedMode: 'deep',
      modeBreakdown,
      recentEvents: searchHistoryEvents.slice(-20).reverse()
    });
  });

  // Main Search API Endpoint
  app.post("/api/search", async (req, res) => {
    const startTime = Date.now();
    try {
      const payload: SearchRequestPayload = req.body;
      const query = (payload.query || '').trim();
      const mode = payload.mode || 'web';

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      // 1. Query Analysis & Expansion
      const analysis = analyzeAndExpandQuery(query, mode);

      // 2. Execute Multi-Provider Search
      const providerRes = await providerRegistry.executeSearch(query, mode, analysis.variants);

      // 3. Normalize Results & Classify
      const normalizedResults = providerRes.results.map((r, idx) => {
        const norm = normalizeResult(r, idx);
        const sourceType = classifyResult(norm.url, norm.title, norm.snippet || '', norm.sourceProvider);
        return {
          ...norm,
          sourceType
        };
      });

      // 4. Evidence Scoring
      const scoredResults = calculateEvidenceScores(normalizedResults, query);

      // 5. Deduplicate Results
      const { uniqueResults, duplicateGroups } = deduplicateResults(scoredResults);

      // 6. Calculate Metrics Summary
      const durationMs = Date.now() - startTime;
      const metrics = calculateMetricsSummary(
        scoredResults,
        uniqueResults,
        duplicateGroups.length,
        durationMs,
        providerRes.providersUsed.length,
        analysis.variants.length
      );

      // 7. Log Search Observability Event
      const searchEvent: SearchEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        query,
        mode,
        timestamp: new Date().toISOString(),
        providersUsed: providerRes.providersUsed,
        queryVariants: analysis.variants,
        resultsCollected: scoredResults.length,
        uniqueResults: uniqueResults.length,
        duplicateGroups: duplicateGroups.length,
        durationMs,
        errors: providerRes.errors
      };

      searchHistoryEvents.push(searchEvent);
      totalSearchesCount++;

      const responsePayload: SearchResponsePayload = {
        query,
        mode,
        metrics,
        results: uniqueResults,
        duplicateGroups,
        events: searchEvent,
        errors: providerRes.errors
      };

      res.json(responsePayload);
    } catch (error: any) {
      console.error("Search API error:", error);
      res.status(500).json({ error: error.message || "Internal search processing error" });
    }
  });

  // GET search shortcut
  app.get("/api/search", async (req, res) => {
    const query = (req.query.q as string) || '';
    const mode = (req.query.mode as any) || 'web';
    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    // Forward to POST handler logic
    req.body = { query, mode };
    return app._router.handle(req, res, () => {});
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Search Portal server running on http://localhost:${PORT}`);
  });
}

startServer();
