import { useState } from 'react';
import { GlobalInputs, MarketplaceConfig } from '@/lib/types';
import { INITIAL_INPUTS, DEFAULT_MARKETPLACES } from '@/lib/constants';
import { ProductForm } from '@/components/ProductForm';
import { MarketplacePanel } from '@/components/MarketplacePanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Calculator } from 'lucide-react';

const Index = () => {
  const [inputs, setInputs] = useState<GlobalInputs>(INITIAL_INPUTS);
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>(DEFAULT_MARKETPLACES);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Calculadora de Marketplaces</h1>
          </div>
          <ThemeToggle />
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
