import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { SearchView } from './components/SearchView';
import { AnalyticsView } from './components/AnalyticsView';
import { AboutView } from './components/AboutView';
import { SearchMode, SearchResponsePayload, ProviderStatus } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'search' | 'analytics' | 'about'>('landing');
  const [searchData, setSearchData] = useState<SearchResponsePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);

  useEffect(() => {
    // Fetch initial provider statuses
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        if (data && data.providers) {
          setProviderStatuses(data.providers);
        }
      })
      .catch(() => {
        // Fallback mock statuses if API fails before start
        setProviderStatuses([
          { id: 'web-general', name: 'General Web Index', active: true, status: 'healthy', lastChecked: new Date().toISOString(), errorCount: 0, latencyMs: 140, supportedModes: ['web', 'deep'] },
          { id: 'tech-github', name: 'Technical & Developer Index', active: true, status: 'healthy', lastChecked: new Date().toISOString(), errorCount: 0, latencyMs: 180, supportedModes: ['deep', 'technical'] },
          { id: 'community-discussions', name: 'Community Discussions', active: true, status: 'healthy', lastChecked: new Date().toISOString(), errorCount: 0, latencyMs: 160, supportedModes: ['deep', 'community'] },
          { id: 'doc-papers-manuals', name: 'Documents & Manuals', active: true, status: 'healthy', lastChecked: new Date().toISOString(), errorCount: 0, latencyMs: 190, supportedModes: ['documents', 'deep'] }
        ]);
      });
  }, []);

  const executeSearch = async (query: string, mode: SearchMode) => {
    setCurrentTab('search');
    setIsLoading(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode })
      });

      if (!res.ok) {
        throw new Error(`Search request failed with status ${res.status}`);
      }

      const data: SearchResponsePayload = await res.json();
      setSearchData(data);
    } catch (err) {
      console.error('Search execution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        providerStatuses={providerStatuses}
      />

      <main className="pb-16">
        {currentTab === 'landing' && (
          <LandingView
            onSearch={(q, m) => executeSearch(q, m)}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'search' && (
          <SearchView
            searchData={searchData}
            isLoading={isLoading}
            onExecuteSearch={(q, m) => executeSearch(q, m)}
            providerStatuses={providerStatuses}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsView />}

        {currentTab === 'about' && <AboutView />}
      </main>
    </div>
  );
}
