import React, { useState } from 'react';
import { quickLookup } from '../services/geminiService';
import { Icons } from './ui/Icons';

export const QuickLookup: React.FC = () => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term) return;
    setLoading(true);
    setDefinition('');
    try {
      const result = await quickLookup(term);
      setDefinition(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Icons.Zap className="w-4 h-4 text-yellow-400" />
        Quick Define
      </h3>
      <form onSubmit={handleLookup} className="relative">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Define 'Short Selling'..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:border-yellow-500 outline-none"
        />
        <button 
          type="submit"
          className="absolute right-2 top-2 text-slate-500 hover:text-yellow-400 transition-colors"
        >
          {loading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Search className="w-4 h-4" />}
        </button>
      </form>
      {definition && (
        <div className="mt-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded border border-slate-700 animate-fade-in">
          {definition}
        </div>
      )}
    </div>
  );
};