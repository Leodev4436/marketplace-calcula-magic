import { GlobalInputs } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Package } from 'lucide-react';

interface ProductFormProps {
  inputs: GlobalInputs;
  onChange: (inputs: GlobalInputs) => void;
}

export function ProductForm({ inputs, onChange }: ProductFormProps) {
  const update = (field: keyof GlobalInputs, value: string | number) => {
    onChange({ ...inputs, [field]: value });
  };

  const numField = (label: string, field: keyof GlobalInputs, prefix?: string, suffix?: string, step?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={field} className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{prefix}</span>}
        <Input
          id={field}
          type="number"
          min="0"
          step={step || '0.01'}
          value={inputs[field] || ''}
          onChange={e => update(field, parseFloat(e.target.value) || 0)}
          className={`${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} h-9 text-sm`}
          placeholder="0"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-primary" />
          Dados do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="productName" className="text-xs font-medium text-muted-foreground">Nome do Produto</Label>
          <Input
            id="productName"
            value={inputs.productName}
            onChange={e => update('productName', e.target.value)}
            placeholder="Ex: Camiseta básica"
            className="h-9 text-sm"
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {numField('Custo de Produção', 'productionCost', 'R$')}
          {numField('Custo de Embalagem', 'packagingCost', 'R$')}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {numField('Quantidade', 'quantity', undefined, undefined, '1')}
          {numField('Imposto', 'taxRate', undefined, '%')}
          {numField('Preço de Venda', 'sellingPrice', 'R$')}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Lucro Desejado</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={inputs.desiredProfit || ''}
              onChange={e => update('desiredProfit', parseFloat(e.target.value) || 0)}
              className="h-9 text-sm flex-1"
              placeholder="0"
            />
            <ToggleGroup
              type="single"
              value={inputs.desiredProfitType}
              onValueChange={v => v && update('desiredProfitType', v)}
              className="border rounded-md"
            >
              <ToggleGroupItem value="percentage" className="h-9 px-3 text-xs">%</ToggleGroupItem>
              <ToggleGroupItem value="currency" className="h-9 px-3 text-xs">R$</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
