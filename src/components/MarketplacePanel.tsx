import { MarketplaceConfig, GlobalInputs } from '@/lib/types';
import { MARKETPLACE_BRAND_CLASSES } from '@/lib/constants';
import { calculateMarketplace, formatCurrency, formatPercent } from '@/lib/calculations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Settings2, CheckCircle2, TrendingDown } from 'lucide-react';

import logoMercadoLivre from '@/assets/logo-mercadolivre.png';
import logoShopee from '@/assets/logo-shopee.png';
import logoAmazon from '@/assets/logo-amazon.png';
import logoMagalu from '@/assets/logo-magalu.png';
import logoShein from '@/assets/logo-shein.png';
import logoTiktok from '@/assets/logo-tiktok.png';

const MARKETPLACE_LOGOS: Record<string, string> = {
  mercadolivre: logoMercadoLivre,
  shopee: logoShopee,
  amazon: logoAmazon,
  magalu: logoMagalu,
  shein: logoShein,
  tiktok: logoTiktok,
};

interface MarketplaceCardProps {
  marketplace: MarketplaceConfig;
  inputs: GlobalInputs;
  onChange: (updated: MarketplaceConfig) => void;
}

function MarketplaceCard({ marketplace, inputs, onChange }: MarketplaceCardProps) {
  const brand = MARKETPLACE_BRAND_CLASSES[marketplace.type];
  const update = (partial: Partial<MarketplaceConfig>) => onChange({ ...marketplace, ...partial });

  const hasResults = inputs.sellingPrice > 0;
  const result = hasResults ? calculateMarketplace(inputs, marketplace) : null;

  const commissionValue = result ? inputs.sellingPrice * (marketplace.commissionRate / 100) : 0;
  const effectiveShipping = result ? (marketplace.shippingThreshold && inputs.sellingPrice < marketplace.shippingThreshold ? 0 : marketplace.shippingCost) : 0;
  const fixedAndShipping = result ? marketplace.fixedFee + effectiveShipping + (inputs.sellingPrice * (marketplace.anticipationFee / 100)) : 0;
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

  const getFixedFeeLabel = () => {
    if (marketplace.type === 'amazon') {
      const val = marketplace.extraOptionValue as string;
      if (val === 'fba') return 'TAXA FBA';
      if (val === 'dba') return 'TAXA DBA';
      return 'TAXA FIXA';
    }
    return 'TAXA FIXA';
  };

  const logo = MARKETPLACE_LOGOS[marketplace.type];

  // Goal details calculation
  const getGoalDetails = () => {
    if (!result || inputs.desiredProfit <= 0) return null;
    
    if (inputs.desiredProfitType === 'percentage') {
      const diffPercent = result.profitMargin - inputs.desiredProfit;
      const diffCurrency = result.realProfit - (inputs.sellingPrice * (inputs.desiredProfit / 100));
      return {
        reached: result.goalReached,
        diffPercent: Math.abs(diffPercent),
        diffCurrency: Math.abs(diffCurrency),
      };
    } else {
      const diffCurrency = result.realProfit - inputs.desiredProfit;
      const diffPercent = inputs.sellingPrice > 0 ? Math.abs(diffCurrency / inputs.sellingPrice) * 100 : 0;
      return {
        reached: result.goalReached,
        diffPercent,
        diffCurrency: Math.abs(diffCurrency),
      };
    }
  };

  const goalDetails = getGoalDetails();

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border bg-card">
      {/* Header with Logo only */}
      <div className={`${brand.headerBg} ${brand.headerText} px-5 py-3 flex items-center justify-start`}>
        {logo && (
          <img src={logo} alt={marketplace.name} className="h-16 w-auto object-contain" />
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Extra Option Toggle */}
        {renderExtraOption()}

        {/* Input Fields */}
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
            <Label className={`text-xs font-bold uppercase tracking-wider ${brand.text}`}>
              Custo Frete
              {marketplace.shippingThreshold && (
                <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground ml-1">
                  (acima de R${marketplace.shippingThreshold})
                </span>
              )}
            </Label>
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

            {/* ROI */}
            <div className="border-t border-green-200 dark:border-green-800/50 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ROI-Lucro</span>
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    +{formatPercent(result.roi)}
                  </div>
                </div>
              </div>
            </div>

            {/* Goal Details */}
            {goalDetails && (
              <div className="border-t border-green-200 dark:border-green-800/50 pt-3">
                {goalDetails.reached ? (
                  <div className="space-y-1.5">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Meta atingida!
                    </Badge>
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                      +{formatCurrency(goalDetails.diffCurrency)} ou +{formatPercent(goalDetails.diffPercent)} acima da meta
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Badge variant="secondary" className="gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-red-600 dark:text-red-400">
                      <TrendingDown className="h-3.5 w-3.5" /> Meta não atingida
                    </Badge>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Faltam {formatCurrency(goalDetails.diffCurrency)} ou {formatPercent(goalDetails.diffPercent)} para a meta
                    </p>
                  </div>
                )}
              </div>
            )}
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
