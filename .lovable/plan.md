

# Calculadora de Precificação para Marketplaces

Uma calculadora avançada para comparar margem de lucro entre múltiplos marketplaces brasileiros (Mercado Livre, Shopee, Amazon, Magalu, Shein, TikTok).

## Funcionalidades

### 1. Formulário de Dados do Produto
- Campos para: nome do produto, custo de produção, custo de embalagem, quantidade, taxa de imposto (%), preço de venda e lucro desejado (% ou R$)
- Validação dos campos e formatação em moeda brasileira (R$)

### 2. Painel de Configuração dos Marketplaces
- Cards para cada marketplace (Mercado Livre, Shopee, Amazon, Magalu, Shein, TikTok) com cores de marca distintas
- Toggle para ativar/desativar cada marketplace
- Campos editáveis: comissão (%), taxa fixa (R$), frete (R$), taxa de antecipação (%)
- Opções específicas por marketplace:
  - **Mercado Livre**: Clássico vs Premium (altera comissão)
  - **Shopee**: Frete Grátis vs padrão (altera comissão)
  - **Amazon**: FBA vs DBA (altera taxa fixa)
  - **TikTok**: Standard vs Afiliado (altera comissão)

### 3. Resultados Comparativos
- Tabela/cards de comparação lado a lado com os resultados de cada marketplace habilitado
- Métricas exibidas: taxas totais do marketplace, valor líquido a receber, custo total, lucro real, margem de lucro (%), ROI (%), markup
- Indicador visual de meta atingida (lucro desejado vs lucro real)
- Destaque para o marketplace mais lucrativo

### 4. Recursos Adicionais
- Modo escuro/claro com toggle
- Histórico de cálculos salvos no localStorage
- Design responsivo (mobile-friendly)
- Cores de marca para cada marketplace para fácil identificação

