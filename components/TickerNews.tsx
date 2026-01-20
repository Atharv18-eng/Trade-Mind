import React, { useState, useEffect } from 'react';
import { fetchMarketNews } from '../services/geminiService';
import { MarketNewsItem } from '../types';
import { Icons } from './ui/Icons';

export const TickerNews: React.FC<{ ticker: string }> = ({ ticker }) => {
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedTicker, setDebouncedTicker] = useState(ticker);

  // Debounce ticker to prevent API spam while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTicker(ticker);
    }, 1500);
    return () => clearTimeout(handler);
  }, [ticker]);

  useEffect(() => {
    if (!debouncedTicker) {
        setNews([]);
        return;
    }
    
    const loadNews = async () => {
      setLoading(true);
      try {
        const items = await fetchMarketNews(debouncedTicker);
        setNews(items);
      } catch (e) {
        console.error("Failed to load news", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadNews();
  }, [debouncedTicker]);

  if (!debouncedTicker) return null;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden mt-6">
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
           <Icons.MessageSquare className="text-blue-400 w-4 h-4" />
           Latest Headlines: {debouncedTicker}
        </h3>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Icons.Loader2 className="animate-spin w-3 h-3" />
            Scanning web...
          </div>
        )}
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {!loading && news.length === 0 && (
            <div className="col-span-full text-center py-4 text-slate-500 text-sm">
              No recent news found for this ticker.
            </div>
        )}
        {news.map((item, i) => (
           <div key={i} className="group flex flex-col justify-between p-4 rounded-lg bg-slate-900/30 border border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600 transition-all">
             <div className="mb-3">
               <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-300 hover:text-blue-200 hover:underline mb-1 block leading-snug">
                 {item.title}
               </a>
               <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.snippet}</p>
             </div>
             
             <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                     <span className="font-medium text-slate-400">{item.source}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full bg-slate-800 border ${
                      item.sentiment === 'positive' ? 'text-green-400 border-green-900' : 
                      item.sentiment === 'negative' ? 'text-red-400 border-red-900' : 'text-slate-400 border-slate-700'
                  }`}>
                    {item.sentiment}
                  </span>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};