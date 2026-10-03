export type AccountCategory =
  | "all"
  | "facebook"
  | "instagram"
  | "working_tools"
  | "twitter"
  | "tiktok"
  | "telegram"
  | "reddit"
  | "proxies"
  | "rdp"
  | "numbers"
  | "software"
  | "mail"
  | "finance"
  | "other";

export type PaymentGateway = "palmpay" | "bank" | "gtb" | "paypoint";

export type ProductType = "log" | "proxy" | "rdp" | "number" | "software" | "tool";

export interface InventoryProduct {
  id: string;
  title: string;
  category: AccountCategory;
  itemType?: ProductType;
  platform: string;
  year: string;
  followers: string;
  tags: string[];
  originalPrice: number;
  sellingPrice: number;
  currency: string;
  stock: number;
  isPopular?: boolean;
  format: string;
  warrantyHours: number;
  verificationSnippet: string;
  description?: string;
  link?: string;
  raw?: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  currency: string;
  role: string;
  totalOrders: number;
}

export interface OrderRequest {
  productId: string;
  quantity: number;
  customerEmail: string;
  customerTelegram?: string;
  phoneNumber?: string;
  paymentGateway?: PaymentGateway;
  paymentReference?: string;
  senderName?: string;
  senderBank?: string;
  notes?: string;
}

export interface DeliveredItem {
  id: string;
  username?: string;
  credentials?: string;
  token?: string;
  cookies?: string;
  ogeEmail?: string;
  twoFactorSecret?: string;
}

export interface EmailDeliveryStatus {
  sent: boolean;
  recipient: string;
  subject: string;
  dispatchedAt: string;
  messageId: string;
  bundleSummary: string;
}

export interface OrderResult {
  orderId: string;
  productId: string;
  productTitle: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  paymentGateway: PaymentGateway;
  paymentReference: string;
  status: "COMPLETED" | "ESCROW_ACTIVE" | "PROCESSING" | "FAILED" | "PENDING_APPROVAL" | "REFUNDED" | "DISPUTED";
  escrowHours: number;
  customerEmail?: string;
  deliveryItems: DeliveredItem[];
  emailDelivery: EmailDeliveryStatus;
  createdAt: string;
  escrowExpiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: "mock" | "external" | "database";
  timestamp: string;
}
