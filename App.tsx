import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { MarketPulse } from './components/MarketPulse';
import { ChatBot } from './components/ChatBot';
import { QuickLookup } from './components/QuickLookup';
import { AppView } from './types';
import { Icons } from './components/ui/Icons';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col sticky top-0 md:h-screen">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            <Icons.BarChart2 className="text-blue-400" />
            TradeMind
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === AppView.DASHBOARD 
                ? 'bg-purple-600/20 text-purple-300 border border-purple-600/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Icons.BrainCircuit className="w-5 h-5" />
            <span>Advisor</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.MARKET_PULSE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === AppView.MARKET_PULSE 
                ? 'bg-blue-600/20 text-blue-300 border border-blue-600/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Icons.Search className="w-5 h-5" />
            <span>Market Pulse</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.CHAT)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === AppView.CHAT 
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Icons.MessageSquare className="w-5 h-5" />
            <span>AI Chat</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <QuickLookup />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900/50 overflow-y-auto">
        <div className="p-6 md:p-12">
          {currentView === AppView.DASHBOARD && <Dashboard />}
          {currentView === AppView.MARKET_PULSE && <MarketPulse />}
          {currentView === AppView.CHAT && <ChatBot />}
        </div>
      </main>

    </div>
  );
};

export default App;