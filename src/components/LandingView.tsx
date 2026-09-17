import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Layers, Cpu, Sparkles } from 'lucide-react';
import { SearchMode } from '../types';

interface LandingViewProps {
  onSearch: (query: string, mode: SearchMode) => void;
  onNavigate: (tab: 'search' | 'about' | 'analytics') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSearch, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('deep');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, mode);
    }
  };

  const sampleQueries = [
    'nextjs electron performance issues',
    'postgresql connection pooling best practices',
    'react 19 concurrent features migration guide',
    'distributed consensus algorithms raft paxos'
  ];

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto text-center">
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6 animate-fade-in">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Independent Multi-Strategy Search Layer</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4 leading-[1.1]">
        Search differently. <br />
        <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          One query. Multiple strategies. Transparent evidence.
        </span>
      </h1>

      <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
        Bypass single-index walled gardens. Nexus queries multiple specialist providers, normalizes results, eliminates duplicates, and computes verifiable evidence metrics.
      </p>

      {/* Main Search Box */}
      <form onSubmit={handleFormSubmit} className="w-full max-w-2xl mb-6">
        <div className="relative flex items-center bg-zinc-900/90 border border-zinc-700/80 rounded-2xl shadow-2xl p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search web, technical docs, research papers, discussions..."
            className="w-full bg-transparent border-none outline-none text-white px-3 py-3 text-base placeholder-zinc-500 font-sans"
            autoFocus
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium text-sm transition-all flex items-center space-x-2 shrink-0 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {(['web', 'deep', 'documents', 'technical', 'community', 'academic'] as SearchMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all uppercase tracking-wider ${
                mode === m
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </form>

      {/* Quick Sample Queries */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-16 text-xs text-zinc-400">
        <span className="text-zinc-400">Try searching:</span>
        {sampleQueries.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(sq);
              onSearch(sq, mode);
            }}
            className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-base mb-2">Query Expansion Engine</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Automatically analyzes intent and generates advanced query variants tailored for developer repositories, academic repositories, and discussions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-base mb-2">Smart Normalization & Deduplication</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Strips tracking parameters, groups canonical mirrors, and collapses duplicate results across multiple providers into a single unified card.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-base mb-2">Transparent Evidence Scoring</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Inspect relevance signals, source diversity, freshness, and corroboration metrics with full transparency on every search result.
          </p>
        </div>
      </div>
    </div>
  );
};
