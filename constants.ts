import { MarketplaceConfig } from './types';

export const INITIAL_INPUTS = {
  productionCost: 0,
  packagingCost: 0, // Used as 'Extra Cost'
  quantity: 1,
  taxRate: 0, 
  sellingPrice: 0,
  desiredProfit: 0, 
  desiredProfitType: 'percentage' as const,
  enableRoas: false,
  roasValue: 10,
};

export const DEFAULT_MARKETPLACES: MarketplaceConfig[] = [
  {
    id: 'ml',
    type: 'mercadolivre',
    name: 'Mercado Livre',
    isEnabled: true,
    commissionRate: 12, // Classic default
    fixedFee: 6.50, // Fixed at 6.50 requested
    shippingCost: 0,
    anticipationFee: 0,
    extraOption: 'listingType',
    extraOptionValue: 'classic', // 'classic' or 'premium'
    isFullSuper: false
  },
  {
    id: 'shopee',
    type: 'shopee',
    name: 'Shopee',
    isEnabled: true,
    commissionRate: 20, // Free Shipping default (20%)
    fixedFee: 4.00,
    shippingCost: 0,
    anticipationFee: 0,
    extraOption: 'program',
    extraOptionValue: 'free_shipping' // Default to 'free_shipping'
  },
  {
    id: 'amazon',
    type: 'amazon',
    name: 'Amazon',
    isEnabled: true,
    commissionRate: 15,
    fixedFee: 8.50, // FBA default fee
    shippingCost: 0,
    anticipationFee: 0,
    extraOption: 'logistics',
    extraOptionValue: 'fba' // Default to 'fba'
  },
  {
    id: 'magalu',
    type: 'magalu',
    name: 'Magalu',
    isEnabled: true,
    commissionRate: 16,
    fixedFee: 0,
    shippingCost: 0,
    anticipationFee: 0,
  },
  {
    id: 'shein',
    type: 'shein',
    name: 'Shein',
    isEnabled: true,
    commissionRate: 16,
    fixedFee: 0,
    shippingCost: 0,
    anticipationFee: 0,
  },
  {
    id: 'tiktok',
    type: 'tiktok',
    name: 'TikTok',
    isEnabled: true,
    commissionRate: 8, // Standard default
    fixedFee: 0,
    shippingCost: 0,
    anticipationFee: 0,
    extraOption: 'type',
    extraOptionValue: 'standard' // 'standard', 'affiliate'
  }
];