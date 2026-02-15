import { MarketplaceConfig, GlobalInputs } from '@/lib/types';
import { MARKETPLACE_BRAND_CLASSES } from '@/lib/constants';
import { calculateMarketplace, formatCurrency, formatPercent } from '@/lib/calculations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Settings2, CheckCircle2, TrendingDown, ExternalLink } from 'lucide-react';

interface MarketplaceCardProps {
  marketplace: MarketplaceConfig;
  inputs: GlobalInputs;
  onChange: (updated: MarketplaceConfig) => void;
}

const MARKETPLACE_RULES_URLS: Record<string, string> = {
  mercadolivre: 'https://www.mercadolivre.com.br/ajuda/tarifas-de-venda_870',
  shopee: 'https://seller.shopee.com.br/edu/article/13289',
  amazon: 'https://sell.amazon.com.br/taxas-de-venda',
  magalu: 'https://marketplace.magazineluiza.com.br/',
  shein: 'https://br.shein.com/',
  tiktok: 'https://seller.tiktok.com/',
};

function MarketplaceCard({ marketplace, inputs, onChange }: MarketplaceCardProps) {
  const brand = MARKETPLACE_BRAND_CLASSES[marketplace.type];
  const update = (partial: Partial<MarketplaceConfig>) => onChange({ ...marketplace, ...partial });

  const hasResults = inputs.sellingPrice > 0;
  const result = hasResults ? calculateMarketplace(inputs, marketplace) : null;

  const commissionValue = result ? inputs.sellingPrice * (marketplace.commissionRate / 100) : 0;
  const fixedAndShipping = result ? marketplace.fixedFee + marketplace.shippingCost + (inputs.sellingPrice * (marketplace.anticipationFee / 100)) : 0;
  const totalProductCost = result ? inputs.productionCost + inputs.packagingCost + (inputs.sellingPrice * (inputs.taxRate / 100)) : 0;

  const extraOptionLabel = () => {
    if (!marketplace.extraOptionValue) return 'RESULTADO';
    return String(marketplace.extraOptionValue).toUpperCase();
  };

  const renderExtraOption = () => {
    if (marketplace.type === 'mercadolivre') {
      return (
        <ToggleGroup
          type="single"
          value={marketplace.extraOptionValue as string}
          onValueChange={v => {
            if (!v) return;
            const commission = v === 'premium' ? 16 : 12;
            const fixedFee = v === 'premium' ? 6.5 : 6.5;
            update({ extraOptionValue: v, commissionRate: commission, fixedFee });
          }}
          className="border rounded-lg w-full bg-muted/30"
        >
          <ToggleGroupItem value="classic" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">Clássico</ToggleGroupItem>
          <ToggleGroupItem value="premium" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">Premium</ToggleGroupItem>
        </ToggleGroup>
      );
    }
    if (marketplace.type === 'shopee') {
      return (
        <ToggleGroup
          type="single"
          value={marketplace.extraOptionValue as string}
          onValueChange={v => {
            if (!v) return;
            const commission = v === 'free_shipping' ? 20 : 14;
            update({ extraOptionValue: v, commissionRate: commission });
          }}
          className="border rounded-lg w-full bg-muted/30"
        >
          <ToggleGroupItem value="standard" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">Padrão</ToggleGroupItem>
          <ToggleGroupItem value="free_shipping" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">Frete Grátis</ToggleGroupItem>
        </ToggleGroup>
      );
    }
    if (marketplace.type === 'amazon') {
      return (
        <ToggleGroup
          type="single"
          value={marketplace.extraOptionValue as string}
          onValueChange={v => {
            if (!v) return;
            let fixedFee = 0;
            let commission = 15;
            if (v === 'fba') { fixedFee = 8.5; }
            else if (v === 'dba') { fixedFee = 2.0; }
            else { fixedFee = 0; }
            update({ extraOptionValue: v, fixedFee, commissionRate: commission });
          }}
          className="border rounded-lg w-full bg-muted/30"
        >
          <ToggleGroupItem value="proprio" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">Próprio</ToggleGroupItem>
          <ToggleGroupItem value="dba" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">DBA</ToggleGroupItem>
          <ToggleGroupItem value="fba" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">FBA</ToggleGroupItem>
        </ToggleGroup>
      );
    }
    if (marketplace.type === 'tiktok') {
      return (
        <ToggleGroup
          type="single"
          value={marketplace.extraOptionValue as string}
          onValueChange={v => {
            if (!v) return;
            const commission = v === 'affiliate' ? 13 : 8;
            update({ extraOptionValue: v, commissionRate: commission });
          }}
          className="border rounded-lg w-full bg-muted/30"
        >
          <ToggleGroupItem value="standard" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">Padrão</ToggleGroupItem>
          <ToggleGroupItem value="affiliate" className="flex-1 h-11 text-sm font-semibold rounded-lg text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md">Afiliado</ToggleGroupItem>
        </ToggleGroup>
      );
    }
    return null;
  };

  // Determine the third label for Amazon (Taxa FBA/DBA)
  const getFixedFeeLabel = () => {
    if (marketplace.type === 'amazon') {
      const val = marketplace.extraOptionValue as string;
      if (val === 'fba') return 'TAXA FBA';
      if (val === 'dba') return 'TAXA DBA';
      return 'TAXA FIXA';
    }
    return 'TAXA FIXA';
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border bg-card">
      {/* Colored Header */}
      <div className={`${brand.headerBg} ${brand.headerText} px-5 py-4 flex items-center justify-between`}>
        <h3 className="text-xl font-bold tracking-tight">{marketplace.name}</h3>
        <a
          href={MARKETPLACE_RULES_URLS[marketplace.type] || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium opacity-90 hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="h-4 w-4" />
          Regras
        </a>
      </div>

      <div className="p-5 space-y-4">
        {/* Extra Option Toggle */}
        {renderExtraOption()}

        {/* Input Fields with brand-colored labels */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className={`text-xs font-bold uppercase tracking-wider ${brand.text}`}>Comissão %</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={marketplace.commissionRate || ''}
              onChange={e => update({ commissionRate: parseFloat(e.target.value) || 0 })}
              className="h-11 text-sm rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={`text-xs font-bold uppercase tracking-wider ${brand.text}`}>{getFixedFeeLabel()}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={marketplace.fixedFee || ''}
              onChange={e => update({ fixedFee: parseFloat(e.target.value) || 0 })}
              className="h-11 text-sm rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={`text-xs font-bold uppercase tracking-wider ${brand.text}`}>Custo Frete</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={marketplace.shippingCost || ''}
              onChange={e => update({ shippingCost: parseFloat(e.target.value) || 0 })}
              className="h-11 text-sm rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={`text-xs font-bold uppercase tracking-wider ${brand.text}`}>Antecipação %</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={marketplace.anticipationFee || ''}
              onChange={e => update({ anticipationFee: parseFloat(e.target.value) || 0 })}
              className="h-11 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Results Section */}
        {hasResults && result && (
          <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 p-4 space-y-3">
            {/* Header with badge and percentage */}
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100 text-xs font-bold uppercase tracking-wider px-3 py-1">
                {extraOptionLabel()}
              </Badge>
              <span className="text-sm font-semibold text-muted-foreground">{marketplace.commissionRate}%</span>
            </div>

            {/* Breakdown rows */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-orange-600 dark:text-orange-400 font-medium">Comissão</span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">- {formatCurrency(commissionValue)}</span>
              </div>
              {fixedAndShipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600 dark:text-orange-400 font-medium">Taxas Fixas/Frete</span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">- {formatCurrency(fixedAndShipping)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-orange-600 dark:text-orange-400 font-medium">Custo Produto</span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">- {formatCurrency(totalProductCost)}</span>
              </div>
            </div>

            {/* Margem Final */}
            <div className="border-t border-green-200 dark:border-green-800/50 pt-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm font-bold text-foreground">Margem Final</span>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +{formatPercent(result.profitMargin)}
                  </div>
                </div>
                <span className={`text-2xl font-bold ${result.realProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {formatCurrency(result.realProfit)}
                </span>
              </div>
            </div>

            {/* ROI + Meta */}
            <div className="border-t border-green-200 dark:border-green-800/50 pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ROI-Lucro</span>
                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                  +{formatPercent(result.roi)}
                </div>
              </div>
              {result.goalReached ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Meta atingida!
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full">
                  <TrendingDown className="h-3.5 w-3.5" /> Abaixo da meta
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MarketplacePanelProps {
  marketplaces: MarketplaceConfig[];
  inputs: GlobalInputs;
  onChange: (marketplaces: MarketplaceConfig[]) => void;
}

export function MarketplacePanel({ marketplaces, inputs, onChange }: MarketplacePanelProps) {
  const handleChange = (updated: MarketplaceConfig) => {
    onChange(marketplaces.map(m => (m.id === updated.id ? updated : m)));
  };

  return (
    <div className="space-y-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Settings2 className="h-5 w-5 text-primary" />
        Marketplaces
      </h2>
      <div className="grid grid-cols-1 gap-5">
        {marketplaces.map(m => (
          <MarketplaceCard key={m.id} marketplace={m} inputs={inputs} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}
