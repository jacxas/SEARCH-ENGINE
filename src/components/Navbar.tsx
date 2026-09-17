import React from 'react';
import { Compass, Search, BarChart3, Info, Server } from 'lucide-react';
import { ProviderStatus } from '../types';

interface NavbarProps {
  currentTab: 'landing' | 'search' | 'analytics' | 'about';
  setCurrentTab: (tab: 'landing' | 'search' | 'analytics' | 'about') => void;
  providerStatuses: ProviderStatus[];
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, providerStatuses }) => {
  const activeCount = providerStatuses.filter(s => s.active).length;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0b0e]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center space-x-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-white text-base tracking-tight flex items-center gap-1.5">
                Nexus <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">v1 MVP</span>
              </span>
              <p className="text-xs text-zinc-400 hidden sm:block">Independent Search Layer</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setCurrentTab('search')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'search'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Portal</span>
            </button>
            <button
              onClick={() => setCurrentTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'analytics'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setCurrentTab('about')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                currentTab === 'about'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Server className="w-3 h-3 ml-0.5" />
            <span>{activeCount} Providers Active</span>
          </div>

          <button
            onClick={() => setCurrentTab('search')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Launch Search</span>
          </button>
        </div>
      </div>
    </header>
  );
};
