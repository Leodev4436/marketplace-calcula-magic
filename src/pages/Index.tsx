import { useState, useCallback } from 'react';
import { GlobalInputs, MarketplaceConfig, HistoryItem } from '@/lib/types';
import { INITIAL_INPUTS, DEFAULT_MARKETPLACES } from '@/lib/constants';
import { calculateMarketplace } from '@/lib/calculations';
import { ProductForm } from '@/components/ProductForm';
import { MarketplacePanel } from '@/components/MarketplacePanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Calculator, Save, History, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const HISTORY_KEY = 'marketplace-calc-history';

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

const Index = () => {
  const [inputs, setInputs] = useState<GlobalInputs>(INITIAL_INPUTS);
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>(DEFAULT_MARKETPLACES);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  const saveToHistory = useCallback(() => {
    const enabled = marketplaces.filter(m => m.isEnabled);
    if (enabled.length === 0 || inputs.sellingPrice <= 0) return;

    const results = enabled.map(m => ({
      name: m.name,
      profit: calculateMarketplace(inputs, m).realProfit,
    }));
    const best = results.reduce((a, b) => (b.profit > a.profit ? b : a));

    const item: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      inputs,
      resultsSummary: { bestProfit: best.profit, bestMarketplace: best.name },
    };

    const updated = [item, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }, [inputs, marketplaces, history]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setInputs(item.inputs);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Calculadora de Marketplaces</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveToHistory} className="gap-1.5 text-xs">
              <Save className="h-3.5 w-3.5" /> Salvar
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <History className="h-3.5 w-3.5" /> Histórico
                  {history.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
                      {history.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    Histórico
                    {history.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs gap-1 text-destructive">
                        <Trash2 className="h-3 w-3" /> Limpar
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  {history.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum cálculo salvo.</p>
                  )}
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium truncate">
                          {item.inputs.productName || 'Sem nome'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Melhor: {item.resultsSummary.bestMarketplace} •{' '}
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {item.resultsSummary.bestProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        <ProductForm inputs={inputs} onChange={setInputs} />
        <MarketplacePanel marketplaces={marketplaces} inputs={inputs} onChange={setMarketplaces} />
      </main>
    </div>
  );
};

export default Index;
