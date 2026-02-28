/**
 * Shopee — Tabela de comissões 2026 (vigência a partir de 01/03/2026)
 * Comissão já contempla taxa de transação.
 */

export interface ShopeeFeeResult {
  commissionRate: number; // %
  fixedFee: number;       // R$ (taxa fixa por faixa)
  cpfExtra: number;       // R$ 3 extra para CPF
  pixSubsidyRate: number; // % subsídio Pix
  pixSubsidyValue: number; // R$ valor do subsídio
}

/**
 * Calcula as taxas da Shopee com base no preço de venda, tipo de vendedor e modo (padrão/frete grátis).
 * 
 * Regras especiais para itens baratos:
 * - Produto < R$8: taxa fixa = metade do preço
 * - Produto R$8-R$11.99: taxa regressiva (R$8→R$6, R$10→R$6.50)
 */
export function getShopeeFees(
  sellingPrice: number,
  sellerType: 'cnpj' | 'cpf',
  mode: 'standard' | 'free_shipping'
): ShopeeFeeResult {
  const price = isNaN(sellingPrice) ? 0 : sellingPrice;

  // Determinar comissão e taxa fixa por faixa de preço
  let commissionRate: number;
  let fixedFee: number;
  let pixSubsidyRate: number;

  if (price <= 79.99) {
    commissionRate = 20;
    fixedFee = 4;
    pixSubsidyRate = 0;
  } else if (price <= 99.99) {
    commissionRate = 14;
    fixedFee = 16;
    pixSubsidyRate = 5;
  } else if (price <= 199.99) {
    commissionRate = 14;
    fixedFee = 20;
    pixSubsidyRate = 5;
  } else if (price <= 499.99) {
    commissionRate = 14;
    fixedFee = 26;
    pixSubsidyRate = 5;
  } else {
    commissionRate = 14;
    fixedFee = 26;
    pixSubsidyRate = 8;
  }

  // Regra regressiva para itens muito baratos
  if (price > 0 && price < 8) {
    fixedFee = price / 2; // metade do preço
  } else if (price >= 8 && price < 12) {
    // Interpolação linear: R$8→R$6, R$10→R$6.50, R$12→R$4 (normal)
    // Aproximação: de R$8 a R$12, decai linearmente de R$6.50 para R$4
    fixedFee = 6.50 - ((price - 8) / 4) * 2.50;
    if (fixedFee < 4) fixedFee = 4;
  }

  // CPF extra: R$3 por item (para vendedores CPF com > 450 pedidos/90 dias)
  const cpfExtra = sellerType === 'cpf' ? 3 : 0;

  // Subsídio Pix (valor em R$)
  const pixSubsidyValue = price > 0 ? (price * pixSubsidyRate) / 100 : 0;

  return {
    commissionRate,
    fixedFee: fixedFee + cpfExtra,
    cpfExtra,
    pixSubsidyRate,
    pixSubsidyValue,
  };
}
