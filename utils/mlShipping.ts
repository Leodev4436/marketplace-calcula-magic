// Tabela de frete Mercado Livre por peso e faixa de preço (MercadoLíderes / reputação verde)
// Colunas: [R$0-18.99, R$19-48.99, R$49-78.99, R$79+]

interface WeightRange {
  maxKg: number; // upper bound (inclusive), use Infinity for last
  costs: [number, number, number, number]; // 4 price ranges
}

const ML_SHIPPING_TABLE: WeightRange[] = [
  { maxKg: 0.3,   costs: [5.65, 6.55, 7.75, 12.35] },
  { maxKg: 0.5,   costs: [5.95, 6.65, 7.85, 13.25] },
  { maxKg: 1,     costs: [6.05, 6.75, 7.95, 13.85] },
  { maxKg: 1.5,   costs: [6.15, 6.85, 8.05, 14.15] },
  { maxKg: 2,     costs: [6.25, 6.95, 8.15, 14.45] },
  { maxKg: 3,     costs: [6.35, 7.95, 8.55, 15.75] },
  { maxKg: 4,     costs: [6.45, 8.15, 8.95, 17.05] },
  { maxKg: 5,     costs: [6.55, 8.35, 9.75, 18.45] },
  { maxKg: 6,     costs: [6.65, 8.55, 9.95, 25.45] },
  { maxKg: 7,     costs: [6.75, 8.75, 10.15, 27.05] },
  { maxKg: 8,     costs: [6.85, 8.95, 10.35, 28.85] },
  { maxKg: 9,     costs: [6.95, 9.15, 10.55, 29.65] },
  { maxKg: 11,    costs: [7.05, 9.55, 10.95, 41.25] },
  { maxKg: 13,    costs: [7.15, 9.95, 11.35, 42.15] },
  { maxKg: 15,    costs: [7.25, 10.15, 11.55, 45.05] },
  { maxKg: 17,    costs: [7.35, 10.35, 11.75, 48.55] },
  { maxKg: 20,    costs: [7.45, 10.55, 11.95, 54.75] },
  { maxKg: 25,    costs: [7.65, 10.95, 12.15, 64.05] },
  { maxKg: 30,    costs: [7.75, 11.15, 12.35, 65.95] },
  { maxKg: 40,    costs: [7.85, 11.35, 12.55, 67.75] },
  { maxKg: 50,    costs: [7.95, 11.55, 12.75, 70.25] },
  { maxKg: 60,    costs: [8.05, 11.75, 12.95, 74.95] },
  { maxKg: 70,    costs: [8.15, 11.95, 13.15, 80.25] },
  { maxKg: 80,    costs: [8.25, 12.15, 13.35, 83.95] },
  { maxKg: 90,    costs: [8.35, 12.35, 13.55, 93.25] },
  { maxKg: 100,   costs: [8.45, 12.55, 13.75, 106.55] },
  { maxKg: 125,   costs: [8.55, 12.75, 13.95, 119.25] },
  { maxKg: 150,   costs: [8.65, 12.75, 14.15, 126.55] },
  { maxKg: Infinity, costs: [8.75, 12.95, 14.35, 166.15] },
];

function getPriceColumnIndex(price: number): number {
  if (price < 19) return 0;
  if (price < 49) return 1;
  if (price < 79) return 2;
  return 3; // R$79+
}

/**
 * Calcula o custo de frete do Mercado Livre baseado no peso e preço de venda.
 * Regra especial: produtos < R$19 pagam no máximo metade do preço do produto.
 */
export function getMLShippingCost(weightKg: number, sellingPrice: number): number {
  if (weightKg <= 0) return 0;

  const colIndex = getPriceColumnIndex(sellingPrice);
  
  // Find the weight range
  const range = ML_SHIPPING_TABLE.find(r => weightKg <= r.maxKg) || ML_SHIPPING_TABLE[ML_SHIPPING_TABLE.length - 1];
  let cost = range.costs[colIndex];

  // Regra: produtos < R$19 pagam no máximo metade do preço
  if (sellingPrice > 0 && sellingPrice < 19) {
    cost = Math.min(cost, sellingPrice / 2);
  }

  return cost;
}
