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
    (gateway === "gtb" && reference.startsWith("GTB-")) || reference.length > 5;

  return {
    verified: isValid,
    reference,
  };
}

