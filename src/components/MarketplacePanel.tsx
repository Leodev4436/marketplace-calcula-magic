import { MarketplaceConfig } from '@/lib/types';
import { MARKETPLACE_BRAND_CLASSES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Settings2 } from 'lucide-react';

interface MarketplaceCardProps {
  marketplace: MarketplaceConfig;
  onChange: (updated: MarketplaceConfig) => void;
}

function MarketplaceCard({ marketplace, onChange }: MarketplaceCardProps) {
  const brand = MARKETPLACE_BRAND_CLASSES[marketplace.type];
  const update = (partial: Partial<MarketplaceConfig>) => onChange({ ...marketplace, ...partial });

  const renderExtraOption = () => {
    if (marketplace.type === 'mercadolivre') {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tipo de Anúncio</Label>
          <ToggleGroup
            type="single"
            value={marketplace.extraOptionValue as string}
            onValueChange={v => {
              if (!v) return;
              const commission = v === 'premium' ? 16 : 12;
              update({ extraOptionValue: v, commissionRate: commission });
            }}
            className="border rounded-md w-full"
          >
            <ToggleGroupItem value="classic" className="flex-1 h-8 text-xs">Clássico</ToggleGroupItem>
            <ToggleGroupItem value="premium" className="flex-1 h-8 text-xs">Premium</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );
    }
    if (marketplace.type === 'shopee') {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Programa</Label>
          <ToggleGroup
            type="single"
            value={marketplace.extraOptionValue as string}
            onValueChange={v => {
              if (!v) return;
              const commission = v === 'free_shipping' ? 20 : 14;
              update({ extraOptionValue: v, commissionRate: commission });
            }}
            className="border rounded-md w-full"
          >
            <ToggleGroupItem value="standard" className="flex-1 h-8 text-xs">Padrão</ToggleGroupItem>
            <ToggleGroupItem value="free_shipping" className="flex-1 h-8 text-xs">Frete Grátis</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );
    }
    if (marketplace.type === 'amazon') {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Logística</Label>
          <ToggleGroup
            type="single"
            value={marketplace.extraOptionValue as string}
            onValueChange={v => {
              if (!v) return;
              const fixedFee = v === 'fba' ? 8.5 : 2.0;
              update({ extraOptionValue: v, fixedFee });
            }}
            className="border rounded-md w-full"
          >
            <ToggleGroupItem value="fba" className="flex-1 h-8 text-xs">FBA</ToggleGroupItem>
            <ToggleGroupItem value="dba" className="flex-1 h-8 text-xs">DBA</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );
    }
    if (marketplace.type === 'tiktok') {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <ToggleGroup
            type="single"
            value={marketplace.extraOptionValue as string}
            onValueChange={v => {
              if (!v) return;
              const commission = v === 'affiliate' ? 13 : 8;
              update({ extraOptionValue: v, commissionRate: commission });
            }}
            className="border rounded-md w-full"
          >
            <ToggleGroupItem value="standard" className="flex-1 h-8 text-xs">Standard</ToggleGroupItem>
            <ToggleGroupItem value="affiliate" className="flex-1 h-8 text-xs">Afiliado</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`transition-all ${marketplace.isEnabled ? `${brand.border} border` : 'opacity-50'}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-bold ${brand.text}`}>{marketplace.name}</CardTitle>
          <Switch
            checked={marketplace.isEnabled}
            onCheckedChange={checked => update({ isEnabled: checked })}
          />
        </div>
      </CardHeader>
      {marketplace.isEnabled && (
        <CardContent className="p-4 pt-2 space-y-3">
          {renderExtraOption()}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Comissão (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={marketplace.commissionRate || ''}
                onChange={e => update({ commissionRate: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Taxa Fixa (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={marketplace.fixedFee || ''}
                onChange={e => update({ fixedFee: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Frete (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={marketplace.shippingCost || ''}
                onChange={e => update({ shippingCost: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Antecipação (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={marketplace.anticipationFee || ''}
                onChange={e => update({ anticipationFee: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface MarketplacePanelProps {
  marketplaces: MarketplaceConfig[];
  onChange: (marketplaces: MarketplaceConfig[]) => void;
}

export function MarketplacePanel({ marketplaces, onChange }: MarketplacePanelProps) {
  const handleChange = (updated: MarketplaceConfig) => {
    onChange(marketplaces.map(m => (m.id === updated.id ? updated : m)));
  };

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Settings2 className="h-5 w-5 text-primary" />
        Marketplaces
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {marketplaces.map(m => (
          <MarketplaceCard key={m.id} marketplace={m} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}
