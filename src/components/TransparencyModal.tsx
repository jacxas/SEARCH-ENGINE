import React from 'react';
import { X, ShieldCheck, ExternalLink, Cpu, GitPullRequest, Calendar, Layers } from 'lucide-react';
import { SearchResult } from '../types';

interface TransparencyModalProps {
  result: SearchResult | null;
  onClose: () => void;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Why this result?</h2>
            <p className="text-xs text-zinc-400">Search Transparency & Evidence Inspector</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-zinc-300">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Target Result Title</span>
            <p className="text-white font-medium">{result.title}</p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:underline flex items-center space-x-1 mt-1 truncate"
            >
              <span>{result.url}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-500 block mb-1 flex items-center gap-1">
                <GitPullRequest className="w-3 h-3 text-blue-400" /> Source Provider
              </span>
              <span className="text-white font-semibold">{result.sourceProvider}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-500 block mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-purple-400" /> Source Type
              </span>
              <span className="text-white font-semibold uppercase text-xs">{result.sourceType}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 space-y-2">
            <span className="text-xs font-medium text-zinc-500 block flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400" /> Query Variant Matched
            </span>
            <p className="text-xs font-mono bg-zinc-900 px-2.5 py-1.5 rounded border border-zinc-800 text-indigo-300">
              "{result.queryVariantUsed || 'Standard primary query'}"
            </p>
          </div>

          {result.matchedTerms && result.matchedTerms.length > 0 && (
            <div>
              <span className="text-xs font-medium text-zinc-500 block mb-1.5">Matched Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedTerms.map((term, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Relevance Signal:</span>
              <span className="text-white font-semibold">{result.relevanceScore}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Composite Evidence Score:</span>
              <span className="text-emerald-400 font-semibold">{result.evidenceScore}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Duplicate Status:</span>
              <span className="text-white font-semibold">
                {result.duplicateCount && result.duplicateCount > 1 ? `${result.duplicateCount} sources grouped` : 'Unique (No duplicates)'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Freshness Signal:</span>
              <span className="text-white font-semibold">{result.publishedAt || 'Recent'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
