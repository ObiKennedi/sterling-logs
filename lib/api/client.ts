import {
  AccountCategory,
  ApiResponse,
  InventoryProduct,
  OrderRequest,
  OrderResult,
  UserProfile,
  PaymentGateway,
} from "@/types/inventory";
import { PaymentInitiationResult } from "@/lib/services/payment";

/**
 * Client-side helper methods to interact with internal API gateway routes
 */

export async function fetchInventoryWithMeta(
  category?: AccountCategory,
  refresh?: boolean
): Promise<{ products: InventoryProduct[]; source: "mock" | "external" | "database" }> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (refresh) params.set("refresh", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`/api/inventory${query}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load products (HTTP ${res.status})`);
  }

  const payload = (await res.json()) as ApiResponse<InventoryProduct[]>;
  return {
    products: payload.data || [],
    source: payload.source || "mock",
  };
}

export async function fetchProducts(
  category?: AccountCategory
): Promise<InventoryProduct[]> {
  const result = await fetchInventoryWithMeta(category);
  return result.products;
}

export async function fetchProduct(id: string): Promise<InventoryProduct | null> {
  const res = await fetch(`/api/inventory/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to load product ${id}`);
  }

  const payload = (await res.json()) as ApiResponse<InventoryProduct>;
  return payload.data || null;
}

export async function fetchProfile(): Promise<UserProfile | null> {
  const res = await fetch("/api/profile", {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    return null;
  }

  const payload = (await res.json()) as ApiResponse<UserProfile>;
  return payload.data || null;
}

export async function initiateCheckout(params: {
  amount: number;
  email: string;
  orderId?: string;
  gateway: PaymentGateway;
  productTitle: string;
}): Promise<PaymentInitiationResult> {
  const res = await fetch("/api/checkout/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(payload.error || "Failed to initiate payment");
  }

  return payload.data as PaymentInitiationResult;
}

export async function submitOrder(order: OrderRequest): Promise<OrderResult> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  const payload = (await res.json()) as ApiResponse<OrderResult>;

  if (!res.ok || !payload.success) {
    throw new Error(payload.error || "Failed to place order.");
  }

  if (!payload.data) {
    throw new Error("No order response received.");
  }

  return payload.data;
}

export async function fetchOrder(orderId: string): Promise<OrderResult | null> {
  const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return null;

  const payload = (await res.json()) as ApiResponse<OrderResult>;
  return payload.data || null;
}
