export interface GlobalInputs {
  productName: string;
  productionCost: number;
  packagingCost: number;
  quantity: number;
  taxRate: number;
  sellingPrice: number;
  desiredProfit: number;
  desiredProfitType: 'percentage' | 'currency';
}

export type MarketplaceType = 'mercadolivre' | 'shopee' | 'amazon' | 'shein' | 'magalu' | 'tiktok';

export interface MarketplaceConfig {
  id: string;
  type: MarketplaceType;
  name: string;
  isEnabled: boolean;
  // Specific settings
  commissionRate: number; // percentage
  fixedFee: number; // currency
  shippingCost: number; // currency (cost to seller)
  anticipationFee: number; // percentage
  // Marketplace specific toggles/options
  extraOption?: string; // e.g., "Classic/Premium" or "DBA/FBA"
  extraOptionValue?: string | boolean; 
}

export interface CalculationResult {
  totalMarketplaceFees: number; // Comissao + Taxa Fixa + Frete + Antecipacao
  netReceivable: number; // Preço Venda - Taxas Mkt
  totalCost: number; // Producao + Embalagem + Imposto
  realProfit: number; // Preço Venda - (Custo Prod + Emb + Imposto + Taxas Mkt)
  profitMargin: number; // % do preço de venda
  roi: number; // % sobre o investimento (custo)
  markup: number; // Multiplicador sobre o custo
  goalReached: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputs: GlobalInputs;
  resultsSummary: {
    bestProfit: number;
    bestMarketplace: string;
  };
}