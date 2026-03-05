

## Analysis

The ML shipping table values in `utils/mlShipping.ts` already match the uploaded images exactly -- no changes needed there.

The real problem: **Mercado Livre has a separate `fixedFee` of R$6.50** being added on top of the shipping table cost for products under R$79. According to the user's explanation, the shipping table IS the total operational cost -- there is no additional fixed fee. The table already includes everything the seller pays.

Current incorrect behavior in `components/MarketplaceCard.tsx` (lines 88-93):
- Products < R$79: sets `fixedFee = 6.50` (WRONG -- this doesn't exist)
- Products >= R$79: sets `fixedFee = 0`

This means sellers are being overcharged by R$6.50 on products under R$79.

Also: `constants.ts` line 29 has `fixedFee: 6.50` as default for ML.

Additionally, the build error "Script not found build:dev" needs fixing by adding the script to `package.json`.

## Plan

1. **Fix `constants.ts`**: Change ML default `fixedFee` from `6.50` to `0`.

2. **Fix `components/MarketplaceCard.tsx`** (lines 88-93): Remove the fixedFee logic for non-Full Super ML. For standard ML, `fixedFee` should always be `0` -- the shipping table cost is the only operational cost.

3. **Fix `package.json`**: Add `"build:dev": "vite build"` script to resolve the build error.

