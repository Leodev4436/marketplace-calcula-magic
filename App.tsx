import React, { useState, useEffect } from 'react';
import { Moon, Sun, LayoutGrid } from 'lucide-react';
import { GlobalInputs, MarketplaceConfig, HistoryItem } from './types';
import { INITIAL_INPUTS, DEFAULT_MARKETPLACES } from './constants';
import { InputSection } from './components/InputSection';
import { MarketplaceCard } from './components/MarketplaceCard';
import { HistorySection } from './components/HistorySection';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [inputs, setInputs] = useState<GlobalInputs>(INITIAL_INPUTS);
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>(DEFAULT_MARKETPLACES);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const saved = localStorage.getItem('mktcalc_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleGlobalInputChange = (field: keyof GlobalInputs, value: string | number | boolean) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleMarketplaceUpdate = (id: string, newConfig: Partial<MarketplaceConfig>) => {
    setMarketplaces(prev => prev.map(m => m.id === id ? { ...m, ...newConfig } : m));
  };

  const calculateSummary = () => {
    let maxProfit = -Infinity;
    let bestMkt = '';
    marketplaces.forEach(mkt => {
       const costs = (inputs.productionCost + inputs.packagingCost) * inputs.quantity;
       const tax = (inputs.sellingPrice * inputs.taxRate) / 100;
       const fees = (inputs.sellingPrice * mkt.commissionRate / 100) + mkt.fixedFee + mkt.shippingCost + (inputs.sellingPrice * mkt.anticipationFee / 100);
       const profit = inputs.sellingPrice - (costs + tax + fees);
       if (profit > maxProfit) { maxProfit = profit; bestMkt = mkt.name; }
    });
    return { bestProfit: maxProfit, bestMarketplace: bestMkt };
  };

  const saveToHistory = () => {
    if (inputs.sellingPrice <= 0) return;
    const summary = calculateSummary();
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      inputs: { ...inputs },
      resultsSummary: summary
    };
    const newHistory = [newItem, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('mktcalc_history', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-20">
      
      {/* Navbar Minimalista */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Precifica<span className="text-indigo-600">Pro</span></span>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Seção Principal */}
        <div className="flex flex-col gap-8">
          
          {/* Inputs Globais (Topo) */}
          <InputSection 
            values={inputs} 
            onChange={handleGlobalInputChange} 
            onSave={saveToHistory}
          />

          {/* Grid de Cards */}
          <div>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-800 dark:text-white">Simulação por Marketplace</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {marketplaces.filter(m => m.isEnabled).map(mkt => (
                <MarketplaceCard 
                  key={mkt.id} 
                  config={mkt} 
                  globalValues={inputs} 
                  onUpdateConfig={handleMarketplaceUpdate}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Histórico */}
        <HistorySection 
          history={history} 
          onLoad={(item) => {
            setInputs(item.inputs);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onClear={() => {
            setHistory([]);
            localStorage.removeItem('mktcalc_history');
          }}
        />

      </div>
    </div>
  );
}

export default App;