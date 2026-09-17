# Nexus Web Search Portal

An independent web search portal with multi-strategy query expansion, source normalization, deduplication, evidence scoring, and high-performance search observability.

## Overview

Nexus Search Portal is not a monolithic index clone of Google or Bing. Instead, it acts as a **smart query and discovery layer** that:
1. **Analyzes & Expands Queries**: Generates multiple intent-driven query variants (e.g., technical site filters, community discussions, documentation).
2. **Consults Multiple Providers**: Queries General Web, Technical (GitHub/Dev docs), Community (Forums/Reddit), Documents (PDF/Papers/Manuals), and Academic sources.
3. **Normalizes & Deduplicates**: Cleans URLs, strips tracking parameters (`utm_*`), resolves canonical endpoints, and groups duplicate articles across different providers.
4. **Classifies & Scores Evidence**: Tags source types, computes relevance, freshness, and composite evidence signals with full transparency ("Why this result?").
5. **Observability & Analytics**: Tracks real search latency, source distribution ratios, duplicate rates, and provider health.

---

## Architecture

```
Query ──→ Query Analyzer ──→ Query Expansion ──→ Multi-Provider Dispatch
                                                      │
Results UI ←── Evidence Engine ←── Deduplicator ←── Normalizer
```

- **Frontend**: Single-page React + Tailwind CSS (Vite), featuring clean modern dark mode SaaS design, search views, analytics dashboard, transparency inspector, and provider status monitor.
- **Backend**: Express server running on port 3000 with modular search engine, normalizer, deduplicator, classifier, and evidence scoring algorithms.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

1. Clone or download repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

### Build & Production

```bash
npm run build
npm run start
```

---

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/providers` - Active search providers and status
- `GET /api/metrics` - Product and search engine analytics
- `POST /api/search` - Execute multi-strategy search `{ query: string, mode?: string }`
