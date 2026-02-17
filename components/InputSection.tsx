import React, { useMemo } from 'react';
import { Calculator, HelpCircle } from 'lucide-react';
import { GlobalInputs } from '../types';

interface InputSectionProps {
  values: GlobalInputs;
  onChange: (field: keyof GlobalInputs, value: string | number) => void;
  onSave: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ values, onChange, onSave }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof GlobalInputs) => {
    const val = field === 'productName' || field === 'desiredProfitType' ? e.target.value : parseFloat(e.target.value) || 0;
    onChange(field, val);
  };

  const toggleProfitType = (type: 'percentage' | 'currency') => {
    // @ts-ignore - casting for simple toggle
    onChange('desiredProfitType', type);
  };

  // --- Markup Calculations for Dashboard ---
  const stats = useMemo(() => {
    const totalCost = (values.productionCost || 0) + (values.packagingCost || 0);
    const price = values.sellingPrice || 0;
    const grossProfit = price - totalCost;
    
    // Prevent division by zero
    const markupPercentage = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
    const markupFactor = totalCost > 0 ? price / totalCost : 0;
    
    return {
      grossProfit,
      markupPercentage,
      markupFactor
    };
  }, [values.productionCost, values.packagingCost, values.sellingPrice]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 mb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Calcule suas Taxas
          </h2>
          <p className="text-sm text-slate-500 mt-1">Insira custos e meta de lucro.</p>
        </div>
        <button 
          onClick={onSave}
          className="hidden md:block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          Salvar Cálculo
        </button>
      </div>

      <div className="space-y-6">
        {/* Row 1: Product Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome do Produto</label>
          <input
            type="text"
            value={values.productName}
            onChange={(e) => handleChange(e, 'productName')}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-0 text-slate-900 dark:text-white transition-colors placeholder-slate-400"
            placeholder="Ex: Camiseta Básica"
          />
        </div>

        {/* Grid for Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Selling Price */}
          <div className="relative group">
            <label className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 font-bold">Preço de Venda</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600/70 font-semibold">R$</span>
              <input
                type="number"
                value={values.sellingPrice || ''}
                onChange={(e) => handleChange(e, 'sellingPrice')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-500 focus:ring-0 text-blue-900 dark:text-blue-100 font-bold transition-colors"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Production Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Custo Produto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <input
                type="number"
                value={values.productionCost || ''}
                onChange={(e) => handleChange(e, 'productionCost')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-0 text-slate-900 dark:text-white transition-colors"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Embalagem & Qty */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Embalagem</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                  <input
                    type="number"
                    value={values.packagingCost || ''}
                    onChange={(e) => handleChange(e, 'packagingCost')}
                    className="w-full pl-8 pr-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-0 text-slate-900 dark:text-white transition-colors text-center"
                    placeholder="0"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Qtd (Kit)</label>
                <input
                  type="number"
                  min="1"
                  value={values.quantity || 1}
                  onChange={(e) => handleChange(e, 'quantity')}
                  className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-0 text-slate-900 dark:text-white transition-colors text-center"
                  placeholder="1"
                />
             </div>
          </div>

          {/* Imposto & Lucro Desejado */}
          <div className="grid grid-cols-5 gap-3">
             <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 truncate">Imposto</label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.taxRate || ''}
                    onChange={(e) => handleChange(e, 'taxRate')}
                    className="w-full px-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-0 text-slate-900 dark:text-white transition-colors text-center"
                    placeholder="0"
                  />
                   <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                </div>
             </div>
             <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex justify-between items-center">
                   Lucro
                   <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 ml-1">
                      <button 
                        onClick={() => toggleProfitType('currency')}
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${values.desiredProfitType === 'currency' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}`}
                      >R$</button>
                      <button 
                         onClick={() => toggleProfitType('percentage')}
                         className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${values.desiredProfitType === 'percentage' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}`}
                      >%</button>
                   </div>
                </label>
                <div className="relative">
                  {values.desiredProfitType === 'currency' && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>}
                  <input
                    type="number"
                    value={values.desiredProfit || ''}
                    onChange={(e) => handleChange(e, 'desiredProfit')}
                    className="w-full px-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-0 text-slate-900 dark:text-white transition-colors text-center"
                    placeholder="0"
                  />
                  {values.desiredProfitType === 'percentage' && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>}
                </div>
             </div>
          </div>

        </div>

        {/* Markup Dashboard */}
        <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
               Markup (Global) 
               <HelpCircle size={14} className="text-slate-400"/>
            </label>
            <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden text-center">
               <div className="p-3">
                  <span className={`block font-bold text-lg ${stats.markupPercentage > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600'}`}>
                    +{stats.markupPercentage.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Markup %</span>
               </div>
               <div className="p-3">
                   <span className={`block font-bold text-lg ${stats.markupFactor > 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600'}`}>
                    {stats.markupFactor.toFixed(2)}x
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Fator</span>
               </div>
               <div className="p-3">
                  <span className={`block font-bold text-lg ${stats.grossProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600'}`}>
                    +R$ {stats.grossProfit.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Margem Bruta</span>
               </div>
            </div>
        </div>

        <div className="md:hidden pt-4">
           <button 
            onClick={onSave}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg active:scale-95"
          >
            Salvar Cálculo
          </button>
        </div>
      </div>
    </div>
  );
};