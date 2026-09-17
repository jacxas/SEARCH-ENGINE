import React from 'react';
import { Compass, Cpu, Layers, ShieldCheck, ArrowRight, Code, Server, Globe } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Architecture & Design Specification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About Nexus Search Portal
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          Nexus is built as a smart query and discovery layer for the conventional internet. Rather than attempting to clone Google by crawling the global web from scratch, Nexus queries specialist multi-strategy providers, normalizes data structures, deduplicates redundant mirrors, and computes verifiable evidence signals.
        </p>
      </div>

      {/* Pipeline Architecture */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>Core Search Pipeline</span>
        </h2>
        <div className="font-mono text-xs bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-indigo-300 space-y-1.5 overflow-x-auto">
          <p>QUERY ──→ QUERY ENGINE (Intent Detection & Expansion)</p>
          <p>       ──→ MULTI-PROVIDER DISPATCH (Web, Technical, Community, Documents, Academic)</p>
          <p>       ──→ RESULT NORMALIZER (URLs, Tracking Params Stripper, Domains)</p>
          <p>       ──→ DEDUPLICATOR (Group Duplicates & Canonical Mirrors)</p>
          <p>       ──→ CLASSIFIER (Source Type Tagging)</p>
          <p>       ──→ EVIDENCE ENGINE (Relevance, Freshness & Evidence Scoring)</p>
          <p>       ──→ RESULTS UI & OBSERVABILITY</p>
        </div>
      </div>

      {/* Future Roadmap & Preparedness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <h3 className="text-white font-semibold text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Future Browser Integration</span>
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The core search engine abstraction (`SearchEngine`, `SearchProvider`, `ResultNormalizer`, `EvidenceEngine`) is completely decoupled from React components. This allows seamless integration into future desktop apps, browser extensions, and dedicated custom browsers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <h3 className="text-white font-semibold text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Robust Error Isolation</span>
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Each provider fails independently with circuit-breaker timeouts and rate-limit handlers. If a specific index provider encounters an error, search continues successfully using remaining active sources.
          </p>
        </div>
      </div>

      {/* Roadmap */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>Product Roadmap</span>
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3 text-white font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>V1 — Web Search Portal, Multi-Strategy Expansion & Deduplication (Active)</span>
          </div>
          <div className="flex items-center space-x-3 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span>V2 — Deep Search Orchestrator & Advanced Corroboration Signals</span>
          </div>
          <div className="flex items-center space-x-3 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span>V3 — Browser Extension & Headless API SDK</span>
          </div>
          <div className="flex items-center space-x-3 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span>V4 — Dedicated Browser Integration & Local Index Caching</span>
          </div>
        </div>
      </div>
    </div>
  );
};
