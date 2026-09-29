import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PaymentPoint Webhook Handler
 * Endpoint: POST /api/webhooks/paymentpoint
 *
 * Receives real-time payment notifications from PaymentPoint (https://paymentpoint.co)
 * when a customer transfers funds to a virtual account or completes card checkout.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: Record<string, unknown> = {};

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    console.log("[PaymentPoint Webhook] Received event payload:", JSON.stringify(payload));

    // Extract transaction details across standard PaymentPoint schema variants
    const data = (payload.data as Record<string, unknown>) || payload;
    const status = String(data.status || payload.status || "").toLowerCase();
    const reference = String(
      data.reference ||
      data.transactionReference ||
      payload.reference ||
      ""
    );
    const amount = Number(data.amount || payload.amount || 0);

    const isSuccessful =
      status === "success" ||
      status === "successful" ||
      status === "paid" ||
      status === "complete";

    if (!isSuccessful) {
      console.log(`[PaymentPoint Webhook] Transaction ${reference} is not successful (status: ${status}).`);
      return NextResponse.json({ received: true, status: "ignored" });
    }

    // 1. Check if this is an Order payment
    const matchingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { paymentReference: reference },
          { orderNumber: reference },
        ],
      },
    });

    if (matchingOrder) {
      if (matchingOrder.status !== "COMPLETED") {
        await prisma.order.update({
          where: { id: matchingOrder.id },
          data: {
            status: "COMPLETED",
            notes: matchingOrder.notes
              ? `${matchingOrder.notes} • Auto-verified via PaymentPoint webhook`
              : "Auto-verified via PaymentPoint webhook",
          },
        });
        console.log(`[PaymentPoint Webhook] Order #${matchingOrder.orderNumber} successfully auto-verified and completed.`);
      }

      return NextResponse.json({
        success: true,
        message: "Order verified and updated",
        orderId: matchingOrder.orderNumber,
      });
    }

    // 2. Check if this is a Wallet Top-up Transaction
    const matchingWalletTx = await prisma.walletTransaction.findFirst({
      where: { reference },
    });

    if (matchingWalletTx) {
      if (matchingWalletTx.status !== "SUCCESS") {
        // Mark transaction as SUCCESS and increment user's balance
        await prisma.$transaction([
          prisma.walletTransaction.update({
            where: { id: matchingWalletTx.id },
            data: { status: "SUCCESS" },
          }),
          prisma.user.update({
            where: { id: matchingWalletTx.userId },
            data: {
              balance: {
                increment: matchingWalletTx.amount || amount,
              },
            },
          }),
        ]);
        console.log(`[PaymentPoint Webhook] Wallet funded with ₦${matchingWalletTx.amount} for user ID ${matchingWalletTx.userId}`);
      }

      return NextResponse.json({
        success: true,
        message: "Wallet transaction verified and credited",
      });
    }

    console.warn(`[PaymentPoint Webhook] No matching order or wallet transaction found for reference: ${reference}`);
    return NextResponse.json({
      received: true,
      message: "Webhook processed, reference not matched",
      reference,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Webhook processing error";
    console.error("[PaymentPoint Webhook] Error processing event:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * Health check endpoint for PaymentPoint Webhook URL verification
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    gateway: "paymentpoint",
    endpoint: "/api/webhooks/paymentpoint",
    timestamp: new Date().toISOString(),
  });
}
