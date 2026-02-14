import { GlobalInputs, MarketplaceConfig, CalculationResult } from './types';

export function calculateMarketplace(
  inputs: GlobalInputs,
  marketplace: MarketplaceConfig
): CalculationResult {
  const { sellingPrice, productionCost, packagingCost, taxRate, desiredProfit, desiredProfitType, quantity } = inputs;
  const { commissionRate, fixedFee, shippingCost, anticipationFee } = marketplace;

  const commission = sellingPrice * (commissionRate / 100);
  const anticipation = sellingPrice * (anticipationFee / 100);
  const totalMarketplaceFees = commission + fixedFee + shippingCost + anticipation;

  const netReceivable = sellingPrice - totalMarketplaceFees;

  const taxAmount = sellingPrice * (taxRate / 100);
  const totalCost = productionCost + packagingCost + taxAmount;

  const realProfit = netReceivable - totalCost;

  const profitMargin = sellingPrice > 0 ? (realProfit / sellingPrice) * 100 : 0;
  const roi = totalCost > 0 ? (realProfit / totalCost) * 100 : 0;
  const markup = totalCost > 0 ? sellingPrice / totalCost : 0;

  let goalReached = false;
  if (desiredProfitType === 'percentage') {
    goalReached = profitMargin >= desiredProfit;
  } else {
    goalReached = realProfit >= desiredProfit;
  }

  return {
    totalMarketplaceFees,
    netReceivable,
    totalCost,
    realProfit,
    profitMargin,
    roi,
    markup,
    goalReached,
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
