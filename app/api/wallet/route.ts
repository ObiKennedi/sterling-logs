import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWalletFundingAlertToAdmin } from "@/lib/services/telegram";
import { formatNaira } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

/**
 * POST /api/wallet
 * Initiates a wallet deposit request, persists pending transaction,
 * and alerts Nathaniel on Telegram with interactive 1-click credit buttons.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, gateway = "palmpay", senderName, senderBank } = body;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid numeric deposit amount is required." },
        { status: 400 }
      );
    }

    const cleanSenderName = typeof senderName === "string" ? senderName.trim() : "";
    if (!cleanSenderName) {
      return NextResponse.json(
        { success: false, error: "Sender account name is required so we know who sent what." },
        { status: 400 }
      );
    }

    // Determine current user
    let userId: string | null = null;
    let userEmail: string = "user@sterlinglogs.com";

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user) {
        userId = session.user.id;
        userEmail = session.user.email || userEmail;
      }
    } catch {
      // Unauthenticated caller
    }

    // If no session, find or create guest user
    if (!userId) {
      const existingUser = await prisma.user.findFirst({
        where: { email: userEmail },
      });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: userEmail,
            name: cleanSenderName || "Sterling Customer",
            balance: 0,
          },
        });
        userId = newUser.id;
      }
    }

    const txRef = `TX-WAL-${Date.now().toString().slice(-6)}`;
    const officialBank = process.env.OFFICIAL_BANK_NAME || "PalmPay";
    const officialAccountNum = process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557";
    const officialAccountName = process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu";

    // Create pending wallet transaction with sender name recorded in description
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        type: "FUNDING",
        amount: numericAmount,
        currency: "₦",
        status: "PENDING",
        reference: txRef,
        gateway: String(gateway).toLowerCase(),
        description: `PalmPay transfer of ${formatNaira(numericAmount)} from "${cleanSenderName}" to ${officialBank} (${officialAccountNum})`,
      },
    });

    // Alert Nathaniel Chinwendu on Telegram
    try {
      await sendWalletFundingAlertToAdmin({
        reference: txRef,
        amount: numericAmount,
        userEmail,
        senderName: cleanSenderName,
        senderBank: senderBank || officialBank,
      });
    } catch (tgErr) {
      console.warn("[Wallet API] Telegram funding alert error:", tgErr);
    }

    return NextResponse.json({
      success: true,
      message: `Deposit request of ${formatNaira(numericAmount)} submitted. Admin alerted on Telegram to verify.`,
      data: {
        reference: txRef,
        amount: numericAmount,
        status: "PENDING",
        accountDetails: {
          bankName: officialBank,
          accountNumber: officialAccountNum,
          accountName: officialAccountName,
        },
      },
    });
  } catch (error) {
    console.error("[Wallet API] Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initiate deposit",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet
 * Returns user's transaction history
 */
export async function GET() {
  try {
    let session = null;
    try {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    } catch {
      // Unauthenticated
    }

    if (!session?.user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load transactions",
      },
      { status: 500 }
    );
  }
}
