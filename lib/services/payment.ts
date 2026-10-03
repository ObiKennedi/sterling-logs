import { PaymentGateway } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import {
  createPaymentPointVirtualAccount,
  verifyPaymentPointReference,
} from "./paymentpoint";

export interface PaymentInitiationParams {
  amount: number;
  email: string;
  orderId: string;
  gateway: PaymentGateway;
  productTitle: string;
}

export interface PaymentInitiationResult {
  gateway: PaymentGateway;
  reference: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  accountDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    expiresInMinutes: number;
  };
  ussdCode?: string;
  checkoutUrl?: string;
  instructions: string;
  isLive?: boolean;
}

/**
 * Initiates checkout session for GTBank or PaymentPoint
 */
export async function initiatePayment(
  params: PaymentInitiationParams
): Promise<PaymentInitiationResult> {
  const { amount, email, orderId, gateway, productTitle } = params;
  const timestamp = Date.now().toString().slice(-6);

  const officialBank = process.env.OFFICIAL_BANK_NAME || "PalmPay";
  const officialAccountNumber = process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557";
  const officialAccountName = process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu";

  if (gateway === "palmpay" || gateway === "bank") {
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
      )} to ${officialBank} account: ${officialAccountNumber} (${officialAccountName}). Once transferred, click 'I Have Paid'. Admin is instantly alerted via Telegram to approve and dispatch your credentials.`,
    };
  }

  if (gateway === "gtb") {
    const reference = `GTB-${orderId}-${timestamp}`;
    const ussdAmount = Math.round(amount);

    return {
      gateway: "gtb",
      reference,
      amount,
      currency: "₦",
      formattedAmount: formatNaira(amount),
      accountDetails: {
        bankName: "Guaranty Trust Bank (GTBank)",
        accountNumber: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
        accountName: "Sterling Logs / Habari GTB Escrow",
        expiresInMinutes: 30,
      },
      ussdCode: `*737*2*${ussdAmount}*4401#`,
      instructions: `Transfer exactly ${formatNaira(
        amount
      )} to the dedicated GTBank account, or dial ${`*737*2*${ussdAmount}*4401#`} from your GTB-registered mobile number.`,
    };
  }

  // PaymentPoint Public API / Dynamic Account Channel
  const ppResult = await createPaymentPointVirtualAccount({
    email,
    name: email.split("@")[0],
    amount,
    orderId,
    productTitle,
  });

  return {
    gateway: "paypoint",
    reference: ppResult.reference,
    amount: ppResult.amount,
    currency: ppResult.currency,
    formattedAmount: ppResult.formattedAmount,
    accountDetails: {
      bankName: ppResult.bankName,
      accountNumber: ppResult.accountNumber,
      accountName: ppResult.accountName,
      expiresInMinutes: ppResult.expiresInMinutes,
    },
    ussdCode: ppResult.ussdCode,
    instructions: ppResult.instructions,
    isLive: ppResult.isLive,
  };
}

/**
 * Verifies payment confirmation from gateway
 */
export async function verifyPayment(
  reference: string,
  gateway: PaymentGateway
): Promise<{ verified: boolean; reference: string }> {
  if (gateway === "paypoint") {
    const isValid = verifyPaymentPointReference(reference);
    return { verified: isValid, reference };
  }

  const isValid =
    (gateway === "palmpay" && (reference.startsWith("PALM-") || reference.length >= 4)) ||
    (gateway === "bank" && reference.length >= 4) ||
    (gateway === "gtb" && reference.startsWith("GTB-")) ||
    reference.length > 5;

  return {
    verified: isValid,
    reference,
  };
}

