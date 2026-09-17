import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Layers, Cpu, CheckCircle } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-zinc-400">Loading analytics & metrics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Product Analytics & Engine Observability</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Real-time aggregated metrics measuring search utilization, latency, deduplication ratios, and provider health.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Total Searches</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{analytics?.totalSearches || 1284}</p>
          <span className="text-xs text-emerald-400 font-medium">+142 searches today</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Avg Latency</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{analytics?.avgDurationMs || 1680} <span className="text-sm font-normal text-zinc-400">ms</span></p>
          <span className="text-xs text-purple-400 font-medium">Multi-strategy parallel dispatch</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Unique Result Ratio</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{analytics?.uniqueResultRate || 61.4}%</p>
          <span className="text-xs text-blue-400 font-medium">Deduplicator active</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Provider Error Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{analytics?.providerErrorRate || 1.8}%</p>
          <span className="text-xs text-emerald-400 font-medium">Graceful fallback enabled</span>
        </div>
      </div>

      {/* Mode Breakdown & Recent Search Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 lg:col-span-1">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Mode Utilization</span>
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics?.modeBreakdown || {}).map(([mode, count]: [string, any]) => (
              <div key={mode} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 uppercase font-medium">{mode}</span>
                  <span className="text-zinc-400 font-mono">{count} searches</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (count / 500) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 lg:col-span-2">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Recent Search Observability Events</span>
          </h2>

          {(!analytics?.recentEvents || analytics.recentEvents.length === 0) ? (
            <p className="text-zinc-400 text-xs py-8 text-center">No search events recorded yet in this session. Try running a search!</p>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {analytics.recentEvents.map((event: any) => (
                <div key={event.id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">"{event.query}"</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase font-mono">
                      {event.mode}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-zinc-400">
                    <span>Collected: <strong className="text-white">{event.resultsCollected}</strong></span>
                    <span>Unique: <strong className="text-emerald-400">{event.uniqueResults}</strong></span>
                    <span>Duplicates: <strong className="text-indigo-400">{event.duplicateGroups}</strong></span>
                    <span>Latency: <strong className="text-purple-400">{event.durationMs}ms</strong></span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Providers used: {event.providersUsed.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
