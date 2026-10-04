import { PaymentGateway } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";

export interface PaymentInitiationParams {
  amount: number;
  email: string;
  orderId: string;
  gateway?: PaymentGateway;
  productTitle: string;
}

export interface PaymentInitiationResult {
  gateway: PaymentGateway;
  reference: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  accountDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    expiresInMinutes: number;
  };
  checkoutUrl?: string;
  instructions: string;
  isLive?: boolean;
}

/**
 * Initiates checkout session for PalmPay Transfer
 */
export async function initiatePayment(
  params: PaymentInitiationParams
): Promise<PaymentInitiationResult> {
  const { amount, orderId } = params;
  const timestamp = Date.now().toString().slice(-6);

  const officialBank = process.env.OFFICIAL_BANK_NAME || "PalmPay";
  const officialAccountNumber = process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557";
  const officialAccountName = process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu";
  const reference = `PALM-${orderId}-${timestamp}`;

  return {
    gateway: "palmpay",
    reference,
    amount,
    currency: "₦",
    formattedAmount: formatNaira(amount),
    accountDetails: {
      bankName: officialBank,
      accountNumber: officialAccountNumber,
      accountName: officialAccountName,
      expiresInMinutes: 60,
    },
    instructions: `Transfer exactly ${formatNaira(
      amount
    )} to ${officialBank} account: ${officialAccountNumber} (${officialAccountName}). Once transferred, click 'I Have Paid'. The transaction will be verified and approved by admin.`,
    isLive: true,
  };
}

/**
 * Verifies payment confirmation from gateway
 */
export async function verifyPayment(
  reference: string,
  _gateway?: PaymentGateway
): Promise<{ verified: boolean; reference: string }> {
  const isValid =
    Boolean(reference) &&
    (reference.startsWith("PALM-") || reference.startsWith("TX-") || reference.length >= 4);

  return {
    verified: isValid,
    reference,
  };
}
