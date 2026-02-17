import React from 'react';
import { History, ArrowUpRight, RotateCcw } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySectionProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ history, onLoad, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 pb-12">
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" />
            Últimos Cálculos
         </h3>
         <button onClick={onClear} className="text-xs text-red-500 hover:underline">Limpar Histórico</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <button 
            key={item.id}
            onClick={() => onLoad(item)}
            className="group text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-2">
               <span className="text-xs text-slate-400 font-mono">
                 {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
               <RotateCcw className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate mb-1">
              {item.inputs.productName || 'Sem nome'}
            </div>
            <div className="flex justify-between items-end">
               <span className="text-xs text-slate-500">
                  Venda: <span className="text-slate-900 dark:text-white font-semibold">R$ {item.inputs.sellingPrice}</span>
               </span>
               <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.resultsSummary.bestProfit > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                  Max: R$ {item.resultsSummary.bestProfit.toFixed(0)}
               </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};