/**
 * Shopee — Tabela de comissões 2026 (vigência a partir de 01/03/2026)
 * Comissão já contempla taxa de transação.
 * Todas as faixas: 14% de comissão percentual.
 */

export interface ShopeeFeeResult {
  commissionRate: number; // % (sempre 14%)
  fixedFee: number;       // R$ (taxa fixa por faixa, já inclui cpfExtra se aplicável)
  cpfExtra: number;       // R$ 3 extra para CPF >450 pedidos
  pixSubsidyRate: number; // % subsídio Pix (0, 5 ou 8)
  pixSubsidyValue: number; // R$ valor do subsídio Pix
}

/**
 * Calcula as taxas da Shopee com base no preço de venda e tipo de vendedor.
 * 
 * Faixas CNPJ/CPF (comissão sempre 14%):
 * - Até R$79,99: 14% + R$4 | Pix: sem
 * - R$80-R$99,99: 14% + R$12 | Pix: 5%
 * - R$100-R$199,99: 14% + R$20 | Pix: 5%
 * - R$200-R$499,99: 14% + R$24 | Pix: 5%
 * - Acima R$500: 14% + R$26 | Pix: 8%
 * 
 * CPF: +R$3 por item (se >450 pedidos/90 dias)
 * 
 * Regras regressivas para itens baratos:
 * - Produto < R$8: taxa fixa = metade do preço
 * - Produto R$8-R$11.99: taxa regressiva
 * - Comissão total não pode ultrapassar ~20% do valor para itens < R$12
 */
export function getShopeeFees(
  sellingPrice: number,
  sellerType: 'cnpj' | 'cpf',
  mode: 'standard' | 'free_shipping'
): ShopeeFeeResult {
  const price = isNaN(sellingPrice) ? 0 : sellingPrice;

  // Comissão percentual é sempre 14% em todas as faixas
  const commissionRate = 14;
  let fixedFee: number;
  let pixSubsidyRate: number;

  if (price <= 79.99) {
    fixedFee = 4;
    pixSubsidyRate = 0;
  } else if (price <= 99.99) {
    fixedFee = 12;
    pixSubsidyRate = 5;
  } else if (price <= 199.99) {
    fixedFee = 20;
    pixSubsidyRate = 5;
  } else if (price <= 499.99) {
    fixedFee = 24;
    pixSubsidyRate = 5;
  } else {
    fixedFee = 26;
    pixSubsidyRate = 8;
  }

  // Regra regressiva para itens muito baratos
  if (price > 0 && price < 8) {
    fixedFee = price / 2; // metade do preço
  } else if (price >= 8 && price < 12) {
    // Interpolação: R$8→R$6, R$10→R$6.50, tendendo a R$4 em R$12
    fixedFee = 6.50 - ((price - 8) / 4) * 2.50;
    if (fixedFee < 4) fixedFee = 4;
  }

  // Trava: comissão total (% + fixa) não pode ultrapassar ~20% do preço para itens < R$12
  if (price > 0 && price < 12) {
    const maxTotal = price * 0.20;
    const percentPart = (price * commissionRate) / 100;
    if (percentPart + fixedFee > maxTotal) {
      fixedFee = Math.max(0, maxTotal - percentPart);
    }
  }

  // CPF extra: R$3 por item (para vendedores CPF com > 450 pedidos/90 dias)
  const cpfExtra = sellerType === 'cpf' ? 3 : 0;

  // Subsídio Pix (valor em R$) - aplicado sobre o preço do item
  const pixSubsidyValue = price > 0 ? (price * pixSubsidyRate) / 100 : 0;

  return {
    commissionRate,
    fixedFee: fixedFee + cpfExtra,
    cpfExtra,
    pixSubsidyRate,
    pixSubsidyValue,
  };
}
