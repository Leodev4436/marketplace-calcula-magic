import { MarketplaceConfig, GlobalInputs } from '@/lib/types';
import { MARKETPLACE_BRAND_CLASSES } from '@/lib/constants';
import { calculateMarketplace, formatCurrency, formatPercent } from '@/lib/calculations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Settings2, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface MarketplaceCardProps {
  marketplace: MarketplaceConfig;
  inputs: GlobalInputs;
  onChange: (updated: MarketplaceConfig) => void;
}

function MarketplaceCard({ marketplace, inputs, onChange }: MarketplaceCardProps) {
  const brand = MARKETPLACE_BRAND_CLASSES[marketplace.type];
  const update = (partial: Partial<MarketplaceConfig>) => onChange({ ...marketplace, ...partial });

  const hasResults = marketplace.isEnabled && inputs.sellingPrice > 0;
  const result = hasResults ? calculateMarketplace(inputs, marketplace) : null;

  const commissionValue = result ? inputs.sellingPrice * (marketplace.commissionRate / 100) : 0;
  const fixedAndShipping = result ? marketplace.fixedFee + marketplace.shippingCost + (inputs.sellingPrice * (marketplace.anticipationFee / 100)) : 0;
  const totalProductCost = result ? inputs.productionCost + inputs.packagingCost + (inputs.sellingPrice * (inputs.taxRate / 100)) : 0;

  const extraOptionLabel = () => {
    if (!marketplace.extraOptionValue) return 'RESULTADO';
    const val = String(marketplace.extraOptionValue).toUpperCase();
    return val;
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
            update({ extraOptionValue: v, commissionRate: commission });
          }}
          className="border rounded-lg w-full bg-muted/30"
        >
          <ToggleGroupItem value="classic" className="flex-1 h-10 text-sm font-medium rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">Clássico</ToggleGroupItem>
          <ToggleGroupItem value="premium" className="flex-1 h-10 text-sm font-medium rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">Premium</ToggleGroupItem>
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
          <ToggleGroupItem value="standard" className="flex-1 h-10 text-sm font-medium rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">Padrão</ToggleGroupItem>
          <ToggleGroupItem value="free_shipping" className="flex-1 h-10 text-sm font-medium rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">Frete Grátis</ToggleGroupItem>
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
            const fixedFee = v === 'fba' ? 8.5 : 2.0;
            update({ extraOptionValue: v, fixedFee });
          }}
          className="border rounded-lg w-full bg-muted/30"
        >
          <ToggleGroupItem value="dba" className="flex-1 h-10 text-sm font-medium rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">DBA</ToggleGroupItem>
          <ToggleGroupItem value="fba" className="flex-1 h-10 text-sm font-medium rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">FBA</ToggleGroupItem>
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
          <ToggleGroupItem value="standard" className="flex-1 h-10 text-sm font-medium rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">Padrão</ToggleGroupItem>
          <ToggleGroupItem value="affiliate" className="flex-1 h-10 text-sm font-medium rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">Afiliado</ToggleGroupItem>
        </ToggleGroup>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border bg-card ${marketplace.isEnabled ? '' : 'opacity-40'}`}>
      {/* Colored Header */}
      <div className={`${brand.headerBg} ${brand.headerText} px-5 py-4 flex items-center justify-between`}>
        <h3 className="text-lg font-bold tracking-tight">{marketplace.name}</h3>
        <Switch
          checked={marketplace.isEnabled}
          onCheckedChange={checked => update({ isEnabled: checked })}
          className="data-[state=checked]:bg-white/30"
        />
      </div>

      {marketplace.isEnabled && (
        <div className="p-5 space-y-4">
          {/* Extra Option Toggle */}
          {renderExtraOption()}

          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comissão %</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={marketplace.commissionRate || ''}
                onChange={e => update({ commissionRate: parseFloat(e.target.value) || 0 })}
                className="h-10 text-sm rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Taxa Fixa</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={marketplace.fixedFee || ''}
                onChange={e => update({ fixedFee: parseFloat(e.target.value) || 0 })}
                className="h-10 text-sm rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custo Frete</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={marketplace.shippingCost || ''}
                onChange={e => update({ shippingCost: parseFloat(e.target.value) || 0 })}
                className="h-10 text-sm rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Antecipação %</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={marketplace.anticipationFee || ''}
                onChange={e => update({ anticipationFee: parseFloat(e.target.value) || 0 })}
                className="h-10 text-sm rounded-lg"
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
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600 dark:text-orange-400 font-medium">Taxas Fixas/Frete</span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">- {formatCurrency(fixedAndShipping)}</span>
                </div>
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ROI-Lucro</span>
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
      )}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {marketplaces.map(m => (
          <MarketplaceCard key={m.id} marketplace={m} inputs={inputs} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}
