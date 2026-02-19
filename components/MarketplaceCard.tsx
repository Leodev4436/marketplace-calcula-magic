import React, { useMemo, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { MarketplaceConfig, GlobalInputs, CalculationResult } from '../types';

interface MarketplaceCardProps {
  config: MarketplaceConfig;
  globalValues: GlobalInputs;
  onUpdateConfig: (id: string, newConfig: Partial<MarketplaceConfig>) => void;
}

// Configuração de Assets das Marcas (Cores e URLs de Imagens)
const BRAND_ASSETS: Record<string, { bg: string; logo: string; logoClass: string; textClass: string }> = {
  mercadolivre: {
    bg: 'bg-[#FFE600]', // Amarelo ML
    // Logo específica solicitada - Exibição original sem filtros
    logo: 'https://bring.com.br/blog/wp-content/uploads/2018/05/Mercado-Livre-logo.png',
    logoClass: 'h-10 object-contain', 
    textClass: 'text-[#2D3277]'
  },
  shopee: {
    bg: 'bg-[#EE4D2D]', // Laranja Shopee
    // Logo Shopee (Wikimedia)
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png',
    logoClass: 'h-8 object-contain brightness-0 invert', // Filtro para Branco
    textClass: 'text-white'
  },
  amazon: {
    bg: 'bg-[#232F3E]', // Azul Escuro Amazon
    // Logo Amazon Branca solicitada (PNGMart)
    logo: 'https://www.pngmart.com/files/23/Amazon-Logo-White-PNG-Image.png',
    // Adicionado mt-2 para mover a logo para baixo conforme solicitado
    logoClass: 'h-8 object-contain mt-2', 
    textClass: 'text-white'
  },
  magalu: {
    bg: 'bg-[#0086FF]', // Azul Magalu
    // Logo Magalu solicitada
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Magalu_-_novo_logo.png',
    // Adicionado -ml-2 para mover levemente para a esquerda
    logoClass: 'h-12 object-contain -ml-2', 
    textClass: 'text-white'
  },
  shein: {
    bg: 'bg-black', // Preto Shein
    // Logo Shein solicitada
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Shein-logo.png',
    logoClass: 'h-6 object-contain brightness-0 invert', // Reduzido de h-8 para h-6
    textClass: 'text-white'
  },
  tiktok: {
    // Gradiente estilo TikTok Shop (Ciano -> Rosa -> Preto)
    bg: 'bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-black', 
    // Logo TikTok (Wikimedia)
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1280px-TikTok_logo.svg.png',
    logoClass: 'h-8 object-contain', // Filtros removidos, logo oficial
    textClass: 'text-white'
  }
};

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ config, globalValues, onUpdateConfig }) => {
  const brand = BRAND_ASSETS[config.type] || BRAND_ASSETS.shopee;

  // --- Lógica de Correção Automática (ML) ---
  useEffect(() => {
    if (config.type === 'mercadolivre') {
      const rawPrice = globalValues.sellingPrice;
      const price = isNaN(rawPrice) ? 0 : rawPrice;
      
      // Lógica "Full Super" (Supermercado)
      if (config.isFullSuper) {
          let superFee = 0;
          
          // Faixas de custo fixo por unidade para Full Super
          // Só aplica se preço > 0 para evitar aplicar taxas em valor zerado,
          // mas se o usuário estiver editando, assume-se comportamento dinâmico.
          if (price > 0) {
            if (price < 30) {
                superFee = 1.00; // Até R$ 29,99
            } else if (price < 50) {
                superFee = 2.00; // R$ 30,00 a R$ 49,99
            } else if (price < 100) {
                superFee = 4.00; // R$ 50,00 a R$ 99,99
            } else if (price < 199) {
                superFee = 6.00; // R$ 100,00 a R$ 198,99
            } else {
                // Acima de R$ 199. Na dúvida, zeramos ou mantemos regra.
                superFee = 0; 
            }
          }

          // Atualiza apenas se o valor for diferente
          if (config.fixedFee !== superFee) {
              onUpdateConfig(config.id, { fixedFee: superFee });
          }
      } 
      // Lógica Padrão (Sem Full Super)
      else {
          // Se o preço for menor que 79, a taxa fixa padrão é 6.50.
          // Isso vale inclusive para preço 0 (configuração inicial/reset).
          if (price < 79) {
              if (config.fixedFee !== 6.50) onUpdateConfig(config.id, { fixedFee: 6.50 });
          } 
          // Se for maior ou igual a 79, taxa fixa é 0.
          else {
              if (config.fixedFee !== 0) onUpdateConfig(config.id, { fixedFee: 0 });
          }
      }

      // Update shipping cost logic (Updated to 22.50 for mandatory free shipping > 79)
      // Only updates if current shipping is 0 to allow manual edits
      if (price >= 79 && config.shippingCost === 0) {
        onUpdateConfig(config.id, { shippingCost: 22.50 });
      }
    }
  }, [globalValues.sellingPrice, config.type, config.shippingCost, config.id, config.isFullSuper, config.fixedFee, onUpdateConfig]);

  // Helper safe number
  const safe = (val: number) => isNaN(val) ? 0 : val;

  // --- Cálculos ---
  const results: CalculationResult = useMemo(() => {
    // Sanitize inputs to prevent NaN propagation
    const sellingPrice = safe(globalValues.sellingPrice);
    const productionCost = safe(globalValues.productionCost);
    const packagingCost = safe(globalValues.packagingCost);
    const quantity = globalValues.quantity ? safe(globalValues.quantity) : 1;
    const taxRate = safe(globalValues.taxRate);
    
    // ROAS Calculation
    const enableRoas = globalValues.enableRoas;
    const roasValue = safe(globalValues.roasValue);
    // Marketing Cost = Selling Price / ROAS (Equivalent to Selling Price * (1/ROAS))
    // Protect against division by zero
    const marketingCost = (enableRoas && roasValue > 0) ? (sellingPrice / roasValue) : 0;

    const { commissionRate, fixedFee, shippingCost, anticipationFee } = config;

    const totalRevenue = sellingPrice * quantity;
    const totalBaseCost = (productionCost + packagingCost) * quantity;
    const taxValue = (totalRevenue * taxRate) / 100;
    const totalMarketplaceFees = (totalRevenue * commissionRate / 100) + fixedFee + shippingCost + (totalRevenue * anticipationFee / 100);
    const totalMarketingCost = marketingCost * quantity;
    
    // Profit = Revenue - (Base Costs + Tax + Fees + Marketing)
    const realProfit = totalRevenue - (totalBaseCost + taxValue + totalMarketplaceFees + totalMarketingCost);
    
    const profitMargin = totalRevenue > 0 ? (realProfit / totalRevenue) * 100 : 0;
    const roi = totalBaseCost > 0 ? (realProfit / totalBaseCost) * 100 : 0;
    
    // Logic: If profit >= 0, it's considered "success" color-wise in this new requirement
    const isPositiveOrZero = realProfit >= 0;

    return { 
        totalMarketplaceFees, 
        netReceivable: 0, 
        totalCost: 0, 
        marketingCost,
        realProfit, 
        profitMargin, 
        roi, 
        markup: 0, 
        goalReached: isPositiveOrZero 
    };
  }, [globalValues, config]);

  // Breakdown Values for Display
  const breakdown = useMemo(() => {
    const sellingPrice = safe(globalValues.sellingPrice);
    const productionCost = safe(globalValues.productionCost);
    const packagingCost = safe(globalValues.packagingCost);
    const quantity = globalValues.quantity ? safe(globalValues.quantity) : 1;
    const taxRate = safe(globalValues.taxRate);
    
    const enableRoas = globalValues.enableRoas;
    const roasValue = safe(globalValues.roasValue);
    const marketing = (enableRoas && roasValue > 0) ? (sellingPrice / roasValue) : 0;
    const marketingPercent = (enableRoas && roasValue > 0) ? (1 / roasValue) * 100 : 0;

    const totalRevenue = sellingPrice * quantity;
    return {
        commission: (totalRevenue * config.commissionRate) / 100,
        fixedFee: config.fixedFee,
        cost: (productionCost + packagingCost) * quantity,
        tax: (totalRevenue * taxRate) / 100,
        shipping: config.shippingCost,
        anticipation: (totalRevenue * config.anticipationFee) / 100,
        marketing: marketing * quantity,
        marketingPercent: marketingPercent
    };
  }, [globalValues, config]);

  // --- Comparação com Meta (Novo) ---
  const comparison = useMemo(() => {
    const sellingPrice = safe(globalValues.sellingPrice);
    const desiredProfit = safe(globalValues.desiredProfit);
    const { desiredProfitType } = globalValues;
    
    // Fix: Explicit check for NaN to prevent "Falta NaN%" error
    if (sellingPrice <= 0 || !desiredProfit || isNaN(desiredProfit) || desiredProfit <= 0) return null;

    const targetProfitValue = desiredProfitType === 'percentage' 
      ? (sellingPrice * desiredProfit) / 100
      : desiredProfit;

    const diffValue = results.realProfit - targetProfitValue;
    const diffPercent = sellingPrice > 0 ? (Math.abs(diffValue) / sellingPrice) * 100 : 0;

    return {
      isAbove: diffValue >= 0,
      diffValue: Math.abs(diffValue),
      diffPercent: diffPercent
    };
  }, [globalValues, results.realProfit]);

  const handleUpdate = (field: keyof MarketplaceConfig, val: number) => onUpdateConfig(config.id, { [field]: val });

  // Logic to handle tab switching
  const handleModeSwitch = (mode: string) => {
    const updates: Partial<MarketplaceConfig> = { extraOptionValue: mode };
    
    if (config.type === 'mercadolivre') {
        // Classic: 12% | Premium: 17%
        updates.commissionRate = mode === 'classic' ? 12 : 17;
    } else if (config.type === 'shopee') {
        // Standard: 14% | Free Shipping: 20%
        updates.commissionRate = mode === 'standard' ? 14 : 20; 
    } else if (config.type === 'amazon') {
        // Amazon fees updates
        updates.fixedFee = mode === 'none' ? 0 : (mode === 'dba' ? 5.50 : 8.50);
    } else if (config.type === 'tiktok') {
        // Standard: 8% | Affiliate: 13%
        updates.commissionRate = mode === 'standard' ? 8 : 13;
    }
    
    onUpdateConfig(config.id, updates);
  };

  const showResults = globalValues.sellingPrice > 0 || globalValues.productionCost > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-md transition-shadow duration-200 h-full">
      
      {/* 1. Header Sólido com Logo Imagem (Removido External Link) */}
      <div className={`${brand.bg} h-16 px-5 flex items-center justify-between shrink-0`}>
         <div className="flex items-center gap-2">
            <img 
                src={brand.logo} 
                alt={config.name} 
                className={brand.logoClass}
                referrerPolicy="no-referrer"
            />
         </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-5">
        
        {/* 2. Seletor de Modo (Abas) - RESTORED */}
        {config.extraOption && (
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
             {config.type === 'mercadolivre' && ['classic', 'premium'].map(mode => (
               <button key={mode} onClick={() => handleModeSwitch(mode)} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${config.extraOptionValue === mode ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                  {mode === 'classic' ? 'Clássico' : 'Premium'}
               </button>
             ))}
             {config.type === 'shopee' && ['standard', 'free_shipping'].map(mode => (
               <button key={mode} onClick={() => handleModeSwitch(mode)} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${config.extraOptionValue === mode ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>{mode === 'free_shipping' ? 'Frete Grátis' : 'Padrão'}</button>
             ))}
             {config.type === 'tiktok' && ['standard', 'affiliate'].map(mode => (
               <button key={mode} onClick={() => handleModeSwitch(mode)} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${config.extraOptionValue === mode ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>{mode === 'affiliate' ? 'Afiliado' : 'Padrão'}</button>
             ))}
             {config.type === 'amazon' && ['none', 'dba', 'fba'].map(mode => (
               <button key={mode} onClick={() => handleModeSwitch(mode)} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${config.extraOptionValue === mode ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>{mode === 'none' ? 'Próprio' : mode.toUpperCase()}</button>
             ))}
          </div>
        )}

        {/* 3. Toggle Supermercado (Full Super) - SOMENTE MERCADO LIVRE */}
        {config.type === 'mercadolivre' && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Supermercado (Full Super)</span>
              <div className="group relative">
                <Info className="w-4 h-4 text-blue-500 cursor-help" />
                {/* Tooltip */}
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none text-left">
                  <p className="font-bold mb-1">Custo fixo por unidade:</p>
                  <ul className="list-disc pl-3 space-y-0.5">
                    <li>Até R$ 29,99: <strong>R$ 1,00</strong></li>
                    <li>R$ 30 - 49,99: <strong>R$ 2,00</strong></li>
                    <li>R$ 50 - 99,99: <strong>R$ 4,00</strong></li>
                    <li>R$ 100 - 198,99: <strong>R$ 6,00</strong></li>
                  </ul>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onUpdateConfig(config.id, { isFullSuper: !config.isFullSuper })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${config.isFullSuper ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.isFullSuper ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )}

        {/* 4. Inputs (Grid Limpo) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 shrink-0">
           <div>
             <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Comissão %</label>
             <input type="number" value={config.commissionRate} onChange={(e) => handleUpdate('commissionRate', parseFloat(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
           </div>
           <div>
             <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Taxa Fixa</label>
             <input type="number" value={config.fixedFee} onChange={(e) => handleUpdate('fixedFee', parseFloat(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
           </div>
           <div>
             <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Custo Frete</label>
             <input type="number" value={config.shippingCost} onChange={(e) => handleUpdate('shippingCost', parseFloat(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
           </div>
           <div>
             <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Antecipação %</label>
             <input type="number" value={config.anticipationFee} onChange={(e) => handleUpdate('anticipationFee', parseFloat(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
           </div>
        </div>

        {/* 5. Resultado Detalhado (Novo Layout) */}
        {showResults && (
          <div className={`mt-auto -mx-5 -mb-5 px-5 pt-4 pb-5 border-t border-slate-100 dark:border-slate-800 ${results.goalReached ? 'bg-[#fcfdfa] dark:bg-slate-900/50' : 'bg-[#fffafa] dark:bg-slate-900/50'}`}>
             
             {/* Lista de Descontos */}
             <div className="space-y-1.5 mb-4">
                  {/* Comissão */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Comissão ({config.commissionRate}%)</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">- R$ {breakdown.commission.toFixed(2)}</span>
                  </div>
                  {/* Taxa Fixa */}
                  {breakdown.fixedFee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {config.isFullSuper ? 'Taxa Fixa (Super)' : 'Taxa Fixa'}
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">- R$ {breakdown.fixedFee.toFixed(2)}</span>
                  </div>
                  )}
                  {/* Marketing / ROAS (Novo) */}
                  {breakdown.marketing > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        Ads / Marketing 
                        <span className="text-xs bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1 rounded">
                            {breakdown.marketingPercent.toFixed(1)}%
                        </span>
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">- R$ {breakdown.marketing.toFixed(2)}</span>
                  </div>
                  )}
                  {/* Frete */}
                  {breakdown.shipping > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Custo Frete</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">- R$ {breakdown.shipping.toFixed(2)}</span>
                  </div>
                  )}
                  {/* Custo Produto */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Custo Produto</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">- R$ {breakdown.cost.toFixed(2)}</span>
                  </div>
                  {/* Imposto */}
                  {breakdown.tax > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Imposto ({globalValues.taxRate}%)</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">- R$ {breakdown.tax.toFixed(2)}</span>
                  </div>
                  )}
                   {/* Antecipação */}
                  {breakdown.anticipation > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Antecipação</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">- R$ {breakdown.anticipation.toFixed(2)}</span>
                  </div>
                  )}
             </div>

             <div className="h-px bg-slate-200 dark:bg-slate-800 my-4"></div>

             {/* Resultados Finais */}
             <div className="space-y-4">
                
                {/* Margem Final */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">Margem Final</div>
                        <div className={`text-xs font-bold mt-0.5 ${results.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {results.profitMargin > 0 ? '+' : ''}{results.profitMargin.toFixed(2)}%
                        </div>
                    </div>
                    <div className={`text-2xl font-black ${results.realProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        R$ {results.realProfit.toFixed(2)}
                    </div>
                </div>

                {/* ROI */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">ROI-Lucro</div>
                        <div className="text-[10px] text-slate-400 font-medium">Lucro / Investimento</div>
                    </div>
                    <div className={`text-xl font-bold ${results.roi >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                        {results.roi > 0 ? '+' : ''}{results.roi.toFixed(2)}%
                    </div>
                </div>

             </div>

             {/* Comparação com Meta - Design Elaborado */}
             {comparison && (
               <div className={`mt-5 relative overflow-hidden rounded-lg border ${
                 comparison.isAbove 
                   ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' 
                   : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
               }`}>
                  {/* Decorative bar on the left */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    comparison.isAbove ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></div>

                  <div className="flex items-center gap-3 p-3 pl-5">
                     <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full shadow-sm ${
                        comparison.isAbove 
                          ? 'bg-white text-emerald-500 dark:bg-emerald-900 dark:text-emerald-300' 
                          : 'bg-white text-red-500 dark:bg-red-900 dark:text-red-300'
                     }`}>
                        {comparison.isAbove ? <CheckCircle size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
                     </div>

                     <div>
                        <div className={`text-[10px] font-extrabold uppercase tracking-widest ${
                           comparison.isAbove ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                           {comparison.isAbove ? 'ACIMA DA META' : 'ABAIXO DA META'}
                        </div>
                        <div className={`text-sm font-bold ${
                           comparison.isAbove ? 'text-emerald-800 dark:text-emerald-100' : 'text-red-800 dark:text-red-100'
                        }`}>
                           {comparison.isAbove 
                             ? <span>+{comparison.diffPercent.toFixed(1)}% (R$ {comparison.diffValue.toFixed(2)})</span>
                             : <span>-{comparison.diffPercent.toFixed(1)}% (R$ {comparison.diffValue.toFixed(2)})</span>
                           }
                        </div>
                     </div>
                  </div>
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};