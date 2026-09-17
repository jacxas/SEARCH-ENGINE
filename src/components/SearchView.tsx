import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, ExternalLink, RefreshCw, Cpu, Layers, AlertTriangle, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { SearchMode, SearchResponsePayload, SearchResult, ProviderStatus, SourceType } from '../types';
import { TransparencyModal } from './TransparencyModal';

interface SearchViewProps {
  searchData: SearchResponsePayload | null;
  isLoading: boolean;
  onExecuteSearch: (query: string, mode: SearchMode) => void;
  providerStatuses: ProviderStatus[];
}

export const SearchView: React.FC<SearchViewProps> = ({ searchData, isLoading, onExecuteSearch, providerStatuses }) => {
  const [queryInput, setQueryInput] = useState(searchData?.query || '');
  const [selectedMode, setSelectedMode] = useState<SearchMode>(searchData?.mode || 'deep');
  
  // Filters
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<Record<SourceType, boolean>>({
    web: true,
    technical: true,
    community: true,
    document: true,
    academic: true,
    news: true,
    other: true
  });
  const [uniqueOnly, setUniqueOnly] = useState(false);
  const [selectedResultForTransparency, setSelectedResultForTransparency] = useState<SearchResult | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      onExecuteSearch(queryInput.trim(), selectedMode);
    }
  };

  const toggleSourceType = (st: SourceType) => {
    setSelectedSourceTypes(prev => ({ ...prev, [st]: !prev[st] }));
  };

  const filteredResults = (searchData?.results || []).filter(res => {
    if (!selectedSourceTypes[res.sourceType]) return false;
    if (uniqueOnly && res.duplicateCount && res.duplicateCount > 1) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Search Header Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex items-center w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-xl p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search web, technical docs, repositories, research..."
              className="w-full bg-transparent border-none outline-none text-white px-3 py-2.5 text-base placeholder-zinc-500 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !queryInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs transition-all flex items-center space-x-2 shrink-0 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Search</span>}
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-zinc-400 font-medium mr-1">Mode:</span>
          {(['web', 'deep', 'documents', 'technical', 'community', 'academic'] as SearchMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setSelectedMode(m);
                if (queryInput.trim()) {
                  onExecuteSearch(queryInput.trim(), m);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all uppercase tracking-wider ${
                selectedMode === m
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </form>

      {/* Errors banner if any */}
      {searchData?.errors && searchData.errors.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold block mb-0.5">Provider Warning / Degradation</span>
            <p>{searchData.errors.join(' · ')}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid: Sidebar Filters + Results + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Filters & Provider Status */}
        <div className="space-y-6 lg:col-span-1">
          {/* Filters Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm pb-3 border-b border-zinc-800">
              <Filter className="w-4 h-4 text-indigo-400" />
              <span>Search Filters</span>
            </div>

            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2.5">Source Types</span>
              <div className="space-y-2">
                {(['web', 'technical', 'community', 'document', 'academic', 'news'] as SourceType[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => toggleSourceType(st)}
                    className="flex items-center space-x-2.5 text-xs text-zinc-300 hover:text-white w-full text-left py-1"
                  >
                    {selectedSourceTypes[st] ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                    <span className="capitalize">{st}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <button
                onClick={() => setUniqueOnly(!uniqueOnly)}
                className="flex items-center space-x-2.5 text-xs text-zinc-300 hover:text-white w-full text-left py-1"
              >
                {uniqueOnly ? (
                  <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                )}
                <span>Unique Results Only</span>
              </button>
            </div>
          </div>

          {/* Search Providers Status */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-white font-semibold text-sm">Search Sources</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">Live</span>
            </div>
            <div className="space-y-2.5">
              {providerStatuses.map((prov) => (
                <div key={prov.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${prov.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-zinc-300 truncate">{prov.name.split(' ')[0]}</span>
                  </div>
                  <span className="text-zinc-400 font-mono text-[10px]">{prov.latencyMs}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right: Results & Metrics Summary */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Metrics Bar */}
          {searchData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
              <div>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Results</span>
                <span className="text-lg font-bold text-white">{searchData.metrics.uniqueResults} <span className="text-xs text-zinc-400 font-normal">/ {searchData.metrics.resultsCollected}</span></span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Duplicate Groups</span>
                <span className="text-lg font-bold text-indigo-400">{searchData.metrics.duplicateGroups}</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Sources Active</span>
                <span className="text-lg font-bold text-emerald-400">{searchData.metrics.providersCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Duration</span>
                <span className="text-lg font-bold text-purple-400">{searchData.metrics.durationMs}ms</span>
              </div>
            </div>
          )}

          {/* Results List */}
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-zinc-400 text-sm">Expanding query, querying multi-strategy providers, normalizing & deduplicating...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3">
              <Search className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-white font-semibold">No results found</h3>
              <p className="text-zinc-400 text-xs max-w-md mx-auto">
                Try adjusting your search query, selecting a different search mode (e.g., Deep or Technical), or clearing active source filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-mono text-zinc-400">{result.domain}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider font-semibold">
                          {result.sourceType}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                          {result.sourceProvider.split(' ')[0]}
                        </span>
                        {result.duplicateCount && result.duplicateCount > 1 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                            {result.duplicateCount} sources grouped
                          </span>
                        )}
                      </div>

                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-semibold text-base hover:text-indigo-400 transition-colors flex items-center space-x-1.5 group-hover:underline"
                      >
                        <span>{result.title}</span>
                        <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
                    {result.snippet}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 gap-3">
                    <div className="flex items-center space-x-4">
                      <span>Relevance: <strong className="text-white">{result.relevanceScore}%</strong></span>
                      <span>Evidence: <strong className="text-emerald-400">{result.evidenceScore}%</strong></span>
                      <span>Freshness: <strong className="text-zinc-300">{result.publishedAt || '2026'}</strong></span>
                    </div>

                    <button
                      onClick={() => setSelectedResultForTransparency(result)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-indigo-300 font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Why this result?</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transparency Modal */}
      <TransparencyModal
        result={selectedResultForTransparency}
        onClose={() => setSelectedResultForTransparency(null)}
      />
    </div>
  );
};
