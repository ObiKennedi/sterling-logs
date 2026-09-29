/**
 * Ifeco API Client & Utility Functions
 */

export interface IfecoRawItem {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  platform?: string;
  price: number | string;
  stock?: number;
  description?: string;
  [key: string]: unknown;
}

export interface InventoryListing {
  id: string;
  platform: string;
  title: string;
  originalPrice: number;
  sellingPrice: number;
  stock: number;
  description?: string;
  raw: IfecoRawItem;
}

/**
 * Calculates the final selling price with a 50% markup.
 * Example: 1,000 cost -> 1,500 selling price.
 */
export function calculateSellingPrice(originalPrice: number): number {
  if (isNaN(originalPrice) || originalPrice <= 0) return 0;
  return Math.round(originalPrice * 1.5);
}

/**
 * Formats numeric price into formatted currency string.
 */
export function formatCurrency(amount: number, currency: string = "₦"): string {
  return `${currency}${amount.toLocaleString()}`;
}
