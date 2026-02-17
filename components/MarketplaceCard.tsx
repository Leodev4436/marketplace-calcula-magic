import React, { useMemo, useEffect } from 'react';
import { ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { MarketplaceConfig, GlobalInputs, CalculationResult } from '../types';

interface MarketplaceCardProps {
  config: MarketplaceConfig;
  globalValues: GlobalInputs;
  onUpdateConfig: (id: string, newConfig: Partial<MarketplaceConfig>) => void;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ config, globalValues, onUpdateConfig }) => {
  
  // --- Auto-Calculation Logic ---
  useEffect(() => {
    if (config.type === 'mercadolivre') {
      const price = globalValues.sellingPrice;
      
      // Regra Mercado Livre: Abaixo de R$79 tem taxa fixa de R$6.50 (valor atualizado)
      // Acima de R$79 a taxa fixa some (geralmente), mas entra o frete grátis por conta do vendedor
      
      const shouldHaveFixedFee = price > 0 && price < 79;
      const expectedFixedFee = shouldHaveFixedFee ? 6.50 : 0;

      // Atualiza taxa fixa se estiver diferente do esperado
      if (config.fixedFee !== expectedFixedFee) {
        onUpdateConfig(config.id, { fixedFee: expectedFixedFee });
      }

      // Sugestão de Frete para produtos acima de 79 (Frete Grátis)
      if (price >= 79 && config.shippingCost === 0) {
         onUpdateConfig(config.id, { shippingCost: 20.00 });
      }
    }
  }, [globalValues.sellingPrice, config.type, config.fixedFee, config.shippingCost, config.id, onUpdateConfig]);

  // --- Real-Time Calculation ---
  const results: CalculationResult = useMemo(() => {
    const { sellingPrice, productionCost, packagingCost, quantity, taxRate, desiredProfit, desiredProfitType } = globalValues;
    const { commissionRate, fixedFee, shippingCost, anticipationFee } = config;

    const totalBaseCost = (productionCost + packagingCost) * quantity;
    const taxValue = (sellingPrice * taxRate) / 100;
    
    const commissionValue = (sellingPrice * commissionRate) / 100;
    const anticipationValue = (sellingPrice * anticipationFee) / 100;
    const totalMarketplaceFees = commissionValue + fixedFee + shippingCost + anticipationValue;

    // Real Profit logic
    const realProfit = sellingPrice - (totalBaseCost + taxValue + totalMarketplaceFees);
    
    // Percent Margin (Profit / Selling Price)
    const profitMargin = sellingPrice > 0 ? (realProfit / sellingPrice) * 100 : 0;
    
    // ROI (Profit / Product Cost)
    // Adjusted: ROI is now Profit divided by the Cost of Goods (Production + Packaging)
    const roi = totalBaseCost > 0 ? (realProfit / totalBaseCost) * 100 : 0;
    
    // Goal Logic
    let goalReached = false;
    // Se a meta for 0, consideramos que não há meta definida ou que qualquer lucro > 0 é válido? 
    // Assumindo que o usuário quer ver se atinge a meta informada. Se for 0, tecnicamente > 0 atinge.
    if (desiredProfitType === 'percentage') {
      goalReached = profitMargin >= desiredProfit;
    } else {
      goalReached = realProfit >= desiredProfit;
    }

    return {
      totalMarketplaceFees,
      netReceivable: sellingPrice - totalMarketplaceFees,
      totalCost: totalBaseCost + taxValue,
      realProfit,
      profitMargin,
      roi,
      markup: 0,
      goalReached
    };
  }, [globalValues, config]);

  // --- Handlers ---
  const handleInputChange = (field: keyof MarketplaceConfig, value: number) => {
    onUpdateConfig(config.id, { [field]: value });
  };

  const handleModeSwitch = (mode: string) => {
    const updates: Partial<MarketplaceConfig> = { extraOptionValue: mode };
    
    if (config.type === 'mercadolivre') {
      updates.commissionRate = mode === 'classic' ? 12 : 17;
    } else if (config.type === 'shopee') {
      updates.commissionRate = mode === 'standard' ? 14 : 20; 
    } else if (config.type === 'amazon') {
      if (mode === 'dba') updates.fixedFee = 5.50; 
      if (mode === 'fba') updates.fixedFee = 8.50; 
      if (mode === 'none') updates.fixedFee = 0;
    } else if (config.type === 'tiktok') {
      updates.commissionRate = mode === 'standard' ? 8 : 13;
    }

    onUpdateConfig(config.id, updates);
  };

  // --- Styles ---
  const getBrandStyles = () => {
    switch(config.type) {
      case 'mercadolivre': return { 
        headerBg: 'bg-[#FFE600]', textColor: 'text-[#2D3277]', 
      };
      case 'shopee': return { 
        headerBg: 'bg-[#EE4D2D]', textColor: 'text-white', 
      };
      case 'amazon': return { 
        headerBg: 'bg-[#232F3E]', textColor: 'text-white', 
      };
      case 'magalu': return { 
        headerBg: 'bg-[#0086FF]', textColor: 'text-white', 
      };
      case 'shein': return { 
        headerBg: 'bg-black', textColor: 'text-white', 
      };
      case 'tiktok': return { 
        headerBg: 'bg-black', textColor: 'text-white', 
      };
      default: return { headerBg: 'bg-gray-500', textColor: 'text-white' };
    }
  };

  const brand = getBrandStyles();
  const getShippingLabel = () => {
    if (config.type === 'amazon') {
      if (config.extraOptionValue === 'dba') return 'Taxa Envio DBA';
      if (config.extraOptionValue === 'fba') return 'Taxa FBA';
      return 'Custo Frete';
    }
    return 'Custo Frete';
  }

  // Calculate Base Cost for display (Product + Packaging)
  const baseCost = (globalValues.productionCost + globalValues.packagingCost) * globalValues.quantity;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-xl transition-shadow duration-300">
      
      {/* Brand Header */}
      <div className={`${brand.headerBg} h-16 flex items-center justify-center relative px-4`}>
        <h3 className={`text-xl font-black tracking-tight ${brand.textColor} flex items-center gap-2`}>
           {config.type === 'tiktok' ? (
             <span className="font-bold relative"><span className="absolute -left-[2px] -top-[2px] text-[#25F4EE] opacity-70">TikTok</span><span className="absolute -right-[2px] -bottom-[2px] text-[#FE2C55] opacity-70">TikTok</span>TikTok</span>
           ) : config.name}
        </h3>
        <a href="#" className={`absolute right-4 text-[10px] opacity-70 hover:opacity-100 flex items-center gap-1 ${brand.textColor}`}>
          <ExternalLink className="w-3 h-3" /> Regras
        </a>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        
        {/* Mode Selector */}
        {config.extraOption && (
          <div className="mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-[10px] font-bold uppercase tracking-wide">
             {config.type === 'mercadolivre' && (
               <>
                 <button onClick={() => handleModeSwitch('classic')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'classic' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Clássico</button>
                 <button onClick={() => handleModeSwitch('premium')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'premium' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Premium</button>
               </>
             )}
             {config.type === 'shopee' && (
               <>
                 <button onClick={() => handleModeSwitch('standard')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'standard' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Padrão</button>
                 <button onClick={() => handleModeSwitch('free_shipping')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'free_shipping' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Frete Grátis</button>
               </>
             )}
             {config.type === 'amazon' && (
               <>
                 <button onClick={() => handleModeSwitch('none')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'none' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Próprio</button>
                 <button onClick={() => handleModeSwitch('dba')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'dba' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>DBA</button>
                 <button onClick={() => handleModeSwitch('fba')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'fba' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>FBA</button>
               </>
             )}
              {config.type === 'tiktok' && (
               <>
                 <button onClick={() => handleModeSwitch('standard')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'standard' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Padrão</button>
                 <button onClick={() => handleModeSwitch('affiliate')} className={`flex-1 py-1.5 rounded-md transition-all ${config.extraOptionValue === 'affiliate' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Afiliado</button>
               </>
             )}
          </div>
        )}

        {/* Inputs Compact Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Comissão %</label>
            <input type="number" value={config.commissionRate} onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Taxa Fixa</label>
            <input type="number" value={config.fixedFee} onChange={(e) => handleInputChange('fixedFee', parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{getShippingLabel()}</label>
            <input type="number" value={config.shippingCost} onChange={(e) => handleInputChange('shippingCost', parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Antecipação %</label>
            <input type="number" value={config.anticipationFee} onChange={(e) => handleInputChange('anticipationFee', parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium" />
          </div>
        </div>

        {/* RESULT CARD */}
        <div className={`rounded-xl p-4 border ${results.goalReached ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800'} transition-colors duration-300`}>
           
           {/* Header Tag */}
           <div className="flex items-center justify-between mb-3">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${results.goalReached ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                {config.extraOptionValue ? String(config.extraOptionValue) : 'Resultado'}
             </span>
             <span className="text-xs font-bold text-slate-500">{config.commissionRate}%</span>
           </div>

           {/* Cost Breakdown */}
           <div className="space-y-1 mb-3 text-xs">
              <div className="flex justify-between text-red-600/80 dark:text-red-400">
                 <span>Comissão</span>
                 <span>- R$ {((globalValues.sellingPrice * config.commissionRate)/100).toFixed(2)}</span>
              </div>
              {(config.fixedFee + config.shippingCost) > 0 && (
                <div className="flex justify-between text-red-600/80 dark:text-red-400">
                  <span>Taxas Fixas/Frete</span>
                  <span>- R$ {(config.fixedFee + config.shippingCost).toFixed(2)}</span>
                </div>
              )}
               <div className="flex justify-between text-red-600/80 dark:text-red-400">
                 <span>Custo Produto</span>
                 <span>- R$ {baseCost.toFixed(2)}</span>
              </div>
           </div>

           <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-2"></div>

           {/* Final Numbers */}
           <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Margem Final</span>
              <span className={`text-xl font-bold ${results.goalReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                R$ {results.realProfit.toFixed(2)}
              </span>
           </div>
           
           <div className="flex justify-between items-center mb-3">
              <span className={`text-xs font-bold ${results.goalReached ? 'text-emerald-600' : 'text-red-500'}`}>
                +{results.profitMargin.toFixed(2)}%
              </span>
           </div>

           {/* ROI & Status */}
           <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
             <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold">ROI-Lucro</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">+{results.roi.toFixed(2)}%</span>
             </div>
             
             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${results.goalReached ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                {results.goalReached ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                {results.goalReached ? 'Meta atingida!' : 'Abaixo da meta'}
             </div>
           </div>

        </div>

      </div>
    </div>
  );
};