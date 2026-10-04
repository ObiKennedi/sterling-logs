import { NextRequest, NextResponse } from "next/server";
import { initiatePayment } from "@/lib/services/payment";
import { PaymentGateway } from "@/types/inventory";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, email, orderId, gateway, productTitle } = body;

    if (!amount || !email) {
      return NextResponse.json(
        { success: false, error: "Amount and customer email are required" },
        { status: 400 }
      );
    }

    const paymentResult = await initiatePayment({
      amount: Number(amount),
      email: String(email),
      orderId: String(orderId || `STL-${Date.now().toString().slice(-6)}`),
      gateway: (gateway as PaymentGateway) || "palmpay",
      productTitle: String(productTitle || "Verified Log"),
    });

    return NextResponse.json(
      {
        success: true,
        data: paymentResult,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
