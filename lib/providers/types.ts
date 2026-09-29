import {
  InventoryProduct,
  UserProfile,
  OrderRequest,
  OrderResult,
  AccountCategory,
} from "@/types/inventory";

/**
 * LogProvider Interface
 * Any inventory backend (mock, local database, or external vendor API)
 * must implement this contract.
 */
export interface LogProvider {
  readonly name: string;
  readonly isMock: boolean;

  /**
   * Retrieves current authenticated user or reseller profile and balance
   */
  getProfile(): Promise<UserProfile>;

  /**
   * Retrieves list of products/logs, optionally filtered by category
   */
  getProducts(category?: AccountCategory, forceRefresh?: boolean): Promise<InventoryProduct[]>;

  /**
   * Retrieves specific product details by ID
   */
  getProduct(id: string): Promise<InventoryProduct | null>;

  /**
   * Executes a purchase order with escrow guarantee
   */
  placeOrder(order: OrderRequest): Promise<OrderResult>;

  /**
   * Fetches status and delivery credentials of a past order
   */
  getOrder(orderId: string): Promise<OrderResult | null>;
}
