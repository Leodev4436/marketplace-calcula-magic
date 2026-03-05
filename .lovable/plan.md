

## Analysis

### Mercado Livre Table
Comparing the uploaded image with `utils/mlShipping.ts`, the values already match exactly. The table has the correct 8 price columns and 29 weight ranges with all values aligned. No changes needed here.

### Shopee Pix Subsidy - The Problem
The current code subtracts the Pix subsidy from `grossCommission` (line 162), which **increases the seller's profit**. This is wrong.

Per the user's corrected explanation: the Pix subsidy is a discount the **buyer** gets on the price. The Shopee absorbs this discount from their own commission. **The seller receives the same net amount regardless of whether payment is via Pix or not.**

So the subsidy should:
- NOT change the seller's profit calculation at all
- Only be shown as informational (what the client pays, what discount Shopee gives)
- Display the effective commission rate for reference only

### Plan

1. **`components/MarketplaceCard.tsx`** - Remove the subsidy discount from the profit calculation
   - Remove lines 158-163 where `pixSubsidyDiscount` reduces `grossCommission`
   - The subsidy info box (lines 498-529) stays as display-only information
   - "Cliente paga" line should show the discounted price the buyer pays
   - The seller's profit remains unchanged whether Pix is on or off

2. **No changes to `utils/mlShipping.ts`** - Values already match the provided table exactly.

3. **No changes to `utils/shopeeShipping.ts`** - The fee calculation function itself is fine; the issue was only in how MarketplaceCard used the subsidy value.

### Result
When the user toggles Pix subsidy ON, the info box will show the effective rate and what the client pays, but the seller's margin/profit numbers will remain identical. The subsidy becomes purely informational.

