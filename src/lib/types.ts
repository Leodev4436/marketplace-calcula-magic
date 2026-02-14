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
  commissionRate: number;
  fixedFee: number;
  shippingCost: number;
  anticipationFee: number;
  extraOption?: string;
  extraOptionValue?: string | boolean;
}

export interface CalculationResult {
  totalMarketplaceFees: number;
  netReceivable: number;
  totalCost: number;
  realProfit: number;
  profitMargin: number;
  roi: number;
  markup: number;
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
