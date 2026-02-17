import React from 'react';
import { Package, Megaphone, Info, TrendingDown } from 'lucide-react';
import { GlobalInputs } from '../types';

interface InputSectionProps {
  values: GlobalInputs;
  onChange: (field: keyof GlobalInputs, value: string | number | boolean) => void;
  onSave: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ values, onChange, onSave }) => {
  const handleChange = (field: keyof GlobalInputs, val: string | number | boolean) => {
    onChange(field, val);
  };

  const handleProfitTypeChange = (type: 'percentage' | 'currency') => {
    (onChange as any)('desiredProfitType', type);
  };

  // Handler especifico para ROAS limitar em 50
  const handleRoasChange = (val: number) => {
    // Limite de 50 conforme solicitado
    let newVal = val;
    if (newVal > 50) newVal = 50;
    if (newVal < 0) newVal = 0;
    handleChange('roasValue', newVal);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
      {/* Header da Seção */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-slate-900 dark:text-white" />
          Dados do Produto
        </h2>
      </div>

      <div className="space-y-5">
        
        {/* Row 1: Custo do Produto | Preço de Venda */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Custo do Produto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none">R$</span>
              <input
                type="number"
                value={values.productionCost || ''}
                onChange={(e) => handleChange('productionCost', parseFloat(e.target.value))}
                className="w-full pl-11 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Preço de Venda</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none">R$</span>
              <input
                type="number"
                value={values.sellingPrice || ''}
                onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value))}
                className="w-full pl-11 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Custo Extra | Imposto | Quantidade */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1.5">Custo Extra</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none">R$</span>
              <input
                type="number"
                value={values.packagingCost || ''}
                onChange={(e) => handleChange('packagingCost', parseFloat(e.target.value))}
                className="w-full pl-11 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>
          <div>
             <label className="block text-sm text-slate-500 mb-1.5">Imposto</label>
             <div className="relative">
                <input
                  type="number"
                  value={values.taxRate || ''}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none">%</span>
             </div>
          </div>
          <div>
             <label className="block text-sm text-slate-500 mb-1.5">Quantidade</label>
             <input
               type="number"
               min="1"
               value={values.quantity || 1}
               onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
               className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
               placeholder="1"
             />
          </div>
        </div>

        {/* Row 3: Lucro Desejado & ROAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            
            {/* Lucro Desejado */}
            <div>
               <label className="block text-sm text-slate-500 mb-1.5">Lucro Desejado</label>
               <div className="flex gap-2 h-[46px]">
                 <input
                  type="number"
                  value={values.desiredProfit || ''}
                  onChange={(e) => handleChange('desiredProfit', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  placeholder="0"
                />
                <div className="flex shrink-0 border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-800">
                   <button 
                      onClick={() => handleProfitTypeChange('percentage')}
                      className={`px-4 text-sm font-medium transition-colors ${values.desiredProfitType === 'percentage' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                   >
                     %
                   </button>
                   <div className="w-px bg-slate-300 dark:bg-slate-700"></div>
                   <button 
                      onClick={() => handleProfitTypeChange('currency')}
                      className={`px-3 text-sm font-medium transition-colors ${values.desiredProfitType === 'currency' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                   >
                     R$
                   </button>
                </div>
               </div>
            </div>

            {/* Previsão ROAS (Compacto e Expansível) */}
            <div className={`border rounded-lg transition-colors duration-200 ${values.enableRoas ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700'}`}>
               
               {/* Header / Toggle Row - No Overflow Hidden Here */}
               <div className="flex items-center justify-between p-3 h-[46px]">
                   <div className="flex items-center gap-2">
                       <Megaphone className={`w-4 h-4 ${values.enableRoas ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                       <span className={`text-sm font-medium ${values.enableRoas ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-400'}`}>
                          Previsão ROAS
                       </span>
                       
                       {/* Tooltip Wrapper */}
                       <div className="group relative flex items-center">
                             <Info className={`w-3.5 h-3.5 cursor-help ${values.enableRoas ? 'text-indigo-400' : 'text-slate-300'}`} />
                             {/* Tooltip Content - Z-index high to float above */}
                             <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] shadow-xl pointer-events-none text-left">
                                <p className="font-bold mb-1 text-indigo-300">Como funciona o desconto:</p>
                                <p className="mb-2">O ROAS define quanto de receita você gera para cada R$ 1 investido.</p>
                                <div className="bg-slate-800 p-2 rounded mb-2 border border-slate-700">
                                  <p className="font-mono text-[10px] text-slate-300">Custo Mkt = Preço Venda / ROAS</p>
                                </div>
                                <p className="italic text-slate-400">Ex: Venda R$100 com ROAS 10 = R$10 de custo (10%).</p>
                                <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                             </div>
                        </div>
                   </div>
                   
                   <button
                      onClick={() => handleChange('enableRoas', !values.enableRoas)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${values.enableRoas ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                   >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${values.enableRoas ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
               </div>

               {/* Expanded Controls with Overflow Hidden for Animation */}
               <div className={`overflow-hidden transition-all duration-300 ease-in-out ${values.enableRoas ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                 <div className="px-3 pb-3">
                    <div className="bg-white dark:bg-slate-800 rounded border border-indigo-100 dark:border-indigo-900/50 p-2 flex items-center gap-4 shadow-sm">
                        
                        <div className="flex-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ROAS Alvo</label>
                           <input
                              type="number"
                              min="1"
                              max="50"
                              value={values.roasValue || ''}
                              onChange={(e) => handleRoasChange(parseFloat(e.target.value))}
                              className="w-full text-lg font-bold text-indigo-600 dark:text-indigo-400 bg-transparent outline-none placeholder-indigo-300 border-b border-indigo-100 dark:border-indigo-800 focus:border-indigo-500 pb-0.5"
                              placeholder="10"
                           />
                        </div>

                        <div className="h-8 w-px bg-slate-100 dark:bg-slate-700"></div>

                        <div className="flex flex-col items-end min-w-[90px]">
                           <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                              Impacto Margem
                           </span>
                           <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
                              <TrendingDown className="w-4 h-4" />
                              <span className="text-lg font-bold">
                                 {values.roasValue > 0 ? (100 / values.roasValue).toFixed(1) : '0.0'}%
                              </span>
                           </div>
                        </div>
                    </div>
                 </div>
               </div>
            </div>

        </div>

      </div>
    </div>
  );
};