import { GlobalInputs, MarketplaceConfig, CalculationResult } from '@/lib/types';
import { calculateMarketplace, formatCurrency, formatPercent } from '@/lib/calculations';
import { MARKETPLACE_BRAND_CLASSES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Trophy, Target } from 'lucide-react';

interface ResultsPanelProps {
  inputs: GlobalInputs;
  marketplaces: MarketplaceConfig[];
}

export function ResultsPanel({ inputs, marketplaces }: ResultsPanelProps) {
  const enabled = marketplaces.filter(m => m.isEnabled);

  if (enabled.length === 0 || inputs.sellingPrice <= 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Target className="h-10 w-10 mb-3 opacity-50" />
          <p className="text-sm">Preencha o preço de venda e ative ao menos um marketplace para ver os resultados.</p>
        </CardContent>
      </Card>
    );
  }

  const results = enabled.map(m => ({
    marketplace: m,
    result: calculateMarketplace(inputs, m),
  }));

  const bestIdx = results.reduce((best, curr, i) =>
    curr.result.realProfit > results[best].result.realProfit ? i : best, 0);

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <TrendingUp className="h-5 w-5 text-primary" />
        Resultados Comparativos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map(({ marketplace, result }, i) => {
          const brand = MARKETPLACE_BRAND_CLASSES[marketplace.type];
          const isBest = i === bestIdx && results.length > 1;
          return (
            <Card
              key={marketplace.id}
              className={`relative transition-all ${brand.border} border ${isBest ? 'ring-2 ring-primary shadow-lg' : ''}`}
            >
              {isBest && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                    <Trophy className="h-3 w-3" /> Mais Lucrativo
                  </Badge>
                </div>
              )}
              <CardHeader className="p-4 pb-2">
                <CardTitle className={`text-sm font-bold ${brand.text}`}>
                  {marketplace.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <Row label="Taxas Marketplace" value={formatCurrency(result.totalMarketplaceFees)} />
                <Row label="Valor Líquido" value={formatCurrency(result.netReceivable)} />
                <Row label="Custo Total" value={formatCurrency(result.totalCost)} />
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Lucro Real</span>
                    <span className={`text-sm font-bold ${result.realProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {formatCurrency(result.realProfit)}
                    </span>
                  </div>
                </div>
                <Row label="Margem" value={formatPercent(result.profitMargin)} />
                <Row label="ROI" value={formatPercent(result.roi)} />
                <Row label="Markup" value={`${result.markup.toFixed(2)}x`} />
                <div className="pt-1">
                  {result.goalReached ? (
                    <Badge variant="default" className="text-xs gap-1 bg-green-600 hover:bg-green-700">
                      <TrendingUp className="h-3 w-3" /> Meta atingida
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <TrendingDown className="h-3 w-3" /> Abaixo da meta
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
