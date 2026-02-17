import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { GlobalInputs, MarketplaceConfig, HistoryItem } from './types';
import { INITIAL_INPUTS, DEFAULT_MARKETPLACES } from './constants';
import { InputSection } from './components/InputSection';
import { MarketplaceCard } from './components/MarketplaceCard';
import { HistorySection } from './components/HistorySection';

function App() {
  // --- State ---
  const [darkMode, setDarkMode] = useState(false);
  const [inputs, setInputs] = useState<GlobalInputs>(INITIAL_INPUTS);
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>(DEFAULT_MARKETPLACES);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // --- Effects ---
  
  // Initialize Theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    // Load history
    const saved = localStorage.getItem('mktcalc_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Update HTML class for Tailwind Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Handlers ---

  const handleGlobalInputChange = (field: keyof GlobalInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleMarketplaceUpdate = (id: string, newConfig: Partial<MarketplaceConfig>) => {
    setMarketplaces(prev => prev.map(m => m.id === id ? { ...m, ...newConfig } : m));
  };

  const calculateBestProfit = () => {
    let maxProfit = -Infinity;
    let bestMkt = '';

    marketplaces.forEach(mkt => {
       // Replicate basic calc logic for summary
       const costs = (inputs.productionCost + inputs.packagingCost) * inputs.quantity;
       const tax = (inputs.sellingPrice * inputs.taxRate) / 100;
       const fees = (inputs.sellingPrice * mkt.commissionRate / 100) + mkt.fixedFee + mkt.shippingCost + (inputs.sellingPrice * mkt.anticipationFee / 100);
       const profit = inputs.sellingPrice - (costs + tax + fees);
       
       if (profit > maxProfit) {
         maxProfit = profit;
         bestMkt = mkt.name;
       }
    });

    return { bestProfit: maxProfit, bestMarketplace: bestMkt };
  };

  const saveToHistory = () => {
    if (inputs.sellingPrice <= 0) return;

    const summary = calculateBestProfit();
    
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

  const loadHistoryItem = (item: HistoryItem) => {
    setInputs(item.inputs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mktcalc_history');
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Calculadora Free
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Simulador Avançado de Precificação Multi-Marketplace
            </p>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Global Inputs */}
        <InputSection 
          values={inputs} 
          onChange={handleGlobalInputChange} 
          onSave={saveToHistory}
        />

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaces.filter(m => m.isEnabled).map(mkt => (
            <MarketplaceCard 
              key={mkt.id} 
              config={mkt} 
              globalValues={inputs} 
              onUpdateConfig={handleMarketplaceUpdate}
            />
          ))}
        </div>

        {/* History Footer */}
        <HistorySection 
          history={history} 
          onLoad={loadHistoryItem} 
          onClear={clearHistory}
        />

      </div>
    </div>
  );
}

export default App;