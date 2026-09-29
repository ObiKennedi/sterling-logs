/**
 * Currency and Pricing Utilities for Nigerian Naira (NGN / ₦)
 */

export const NAIRA_SYMBOL = "₦";

/**
 * Formats a numeric price into Nigerian Naira currency format.
 * Example: 25000 -> ₦25,000
 */
export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${NAIRA_SYMBOL}0`;
  }
  return `${NAIRA_SYMBOL}${Math.round(amount).toLocaleString("en-NG")}`;
}

/**
 * Calculates selling price with markup multiplier.
 * Example: cost 18,000 * 1.5 = 27,000 selling price
 */
export function calculateSellingPrice(
  originalCost: number,
  multiplier: number = 1.5
): number {
  if (isNaN(originalCost) || originalCost <= 0) return 0;
  return Math.round(originalCost * (multiplier || 1.5));
}
