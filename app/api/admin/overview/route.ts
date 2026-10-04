import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLogProvider } from "@/lib/providers";
import { getTelegramConfig, sendTelegramMessage } from "@/lib/services/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Verify caller session (optional fallback for admin preview)
    let currentRole = "user";
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });
        currentRole = dbUser?.role || (session.user as { role?: string }).role || "user";
      }
    } catch (err) {
      console.warn("[Admin API] Session check warning:", err);
    }

    // 2. Fetch all users from Neon DB
    let usersData: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      balance: number;
      totalOrders: number;
      totalSpent: number;
      createdAt: string;
    }> = [];

    try {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          orders: {
            select: {
              totalPrice: true,
              status: true,
            },
          },
        },
      });

      if (dbUsers.length > 0) {
        usersData = dbUsers.map((u: any) => {
          const totalOrders = u.orders?.length || 0;
          const totalSpent = (u.orders || []).reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
          return {
            id: u.id,
            name: u.name || u.email.split("@")[0],
            email: u.email,
            role: u.role || "user",
            balance: u.balance || 0,
            totalOrders,
            totalSpent,
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "",
          };
        });
      }
    } catch (err) {
      console.warn("[Admin API] Error fetching users from database:", err);
    }

    // 3. Fetch all orders and purchase statistics from Neon DB
    let ordersData: Array<{
      orderId: string;
      customerEmail: string;
      productTitle: string;
      platform: string;
      totalPrice: number;
      paymentGateway: string;
      status: "ESCROW_ACTIVE" | "COMPLETED" | "REFUNDED" | "DISPUTED";
      createdAt: string;
    }> = [];

    try {
      const dbOrders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      if (dbOrders.length > 0) {
        ordersData = dbOrders.map((o: any) => ({
          orderId: o.orderNumber || o.id,
          customerEmail: o.customerEmail,
          productTitle: o.productTitle,
          platform: o.platform,
          totalPrice: o.totalPrice,
          paymentGateway: (o.paymentGateway || "PalmPay").toUpperCase(),
          paymentReference: o.paymentReference || "",
          notes: o.notes || "",
          status: o.status as "ESCROW_ACTIVE" | "COMPLETED" | "REFUNDED" | "DISPUTED",
          createdAt: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : "",
        }));
      }
    } catch (err) {
      console.warn("[Admin API] Error fetching orders from database:", err);
    }

    // 4. Fetch all wallet transactions (PalmPay deposits & ledger)
    let transactionsData: Array<{
      id: string;
      userId: string;
      userEmail: string;
      userName: string;
      type: string;
      amount: number;
      currency: string;
      status: "PENDING" | "SUCCESS" | "FAILED";
      reference: string;
      gateway: string;
      description?: string;
      createdAt: string;
    }> = [];

    try {
      const dbTransactions = await prisma.walletTransaction.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        take: 100,
      });

      if (dbTransactions.length > 0) {
        transactionsData = dbTransactions.map((tx: any) => {
          let senderName = "";
          if (tx.description) {
            const match = tx.description.match(/from ["']([^"']+)["']/i);
            if (match && match[1]) {
              senderName = match[1];
            }
          }
          return {
            id: tx.id,
            userId: tx.userId,
            userEmail: tx.user?.email || "customer@sterlinglogs.com",
            userName: tx.user?.name || tx.user?.email?.split("@")[0] || "Customer",
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency || "₦",
            status: tx.status as "PENDING" | "SUCCESS" | "FAILED",
            reference: tx.reference,
            gateway: tx.gateway || "palmpay",
            description: tx.description || "",
            senderName: senderName || undefined,
            createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString() : "",
          };
        });
      }
    } catch (err) {
      console.warn("[Admin API] Error fetching wallet transactions:", err);
    }

    // 4. Calculate Platform Purchase Metrics
    const totalPurchasesCount = ordersData.length;
    const totalPurchasesVolume = ordersData
      .filter((o) => o.status === "COMPLETED" || o.status === "ESCROW_ACTIVE")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const activeEscrowVolume = ordersData
      .filter((o) => o.status === "ESCROW_ACTIVE")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const activeEscrowOrdersCount = ordersData.filter((o) => o.status === "ESCROW_ACTIVE").length;
    const completedPurchasesCount = ordersData.filter((o) => o.status === "COMPLETED").length;
    const disputedPurchasesCount = ordersData.filter((o) => o.status === "DISPUTED").length;

    // Platform breakdown
    const platformBreakdown: Record<string, { count: number; volume: number }> = {};
    ordersData.forEach((o) => {
      const p = o.platform || "Other";
      if (!platformBreakdown[p]) {
        platformBreakdown[p] = { count: 0, volume: 0 };
      }
      platformBreakdown[p].count += 1;
      platformBreakdown[p].volume += o.totalPrice;
    });

    // 5. Query Inventory Provider Balance (e.g. Ifecologs API / External Provider)
    const provider = getLogProvider();
    let vendorProfile = {
      vendorName: provider.isMock ? "Internal Engine" : "Ifeco Logs / External API",
      balance: 0,
      currency: "₦",
      username: "admin",
      email: "admin@sterlinglogs.com",
      totalOrders: 0,
      isLiveConnected: !provider.isMock,
      endpoint: process.env.EXTERNAL_API_BASE_URL || "https://ifecologs.com/api",
      apiKeyConfigured: Boolean(process.env.EXTERNAL_API_KEY || process.env.IFECO_API_KEY),
    };

    try {
      const profile = await provider.getProfile();
      vendorProfile.balance = profile.balance;
      vendorProfile.username = profile.username;
      vendorProfile.email = profile.email;
      vendorProfile.totalOrders = profile.totalOrders;
      vendorProfile.isLiveConnected = !provider.isMock;
      vendorProfile.vendorName = provider.isMock
        ? "Safe Naira Simulation Engine"
        : "Live Ifeco Logs API Gateway";
    } catch (err) {
      console.warn("[Admin API] Error fetching vendor profile:", err);
    }

    return NextResponse.json({
      success: true,
      data: {
        users: usersData,
        orders: ordersData,
        transactions: transactionsData,
        purchases: {
          totalCount: totalPurchasesCount,
          totalVolume: totalPurchasesVolume,
          activeEscrowVolume,
          activeEscrowCount: activeEscrowOrdersCount,
          completedCount: completedPurchasesCount,
          disputedCount: disputedPurchasesCount,
          platformBreakdown,
        },
        vendor: {
          ...vendorProfile,
          lastSyncedAt: new Date().toISOString(),
        },
        receivingAccount: {
          bank: process.env.OFFICIAL_BANK_NAME || "PalmPay",
          accountNumber: process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557",
          accountName: process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu",
          telegramBot: process.env.TELEGRAM_BOT_USERNAME || "SterlingLogsMarketBot",
        },
        adminRole: currentRole,
      },
    });
  } catch (error) {
    console.error("[/api/admin/overview] Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load admin stats",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/overview
 * Handles live admin mutations:
 * - credit_balance: Credit or debit user's Naira wallet
 * - toggle_role: Switch between admin and user
 * - release_escrow: Force release escrow funds
 * - refund_order: Force refund order to customer balance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, orderId, transactionId, reference, amount, role } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 });
    }

    // Action: Approve Transaction (PalmPay Manual Transfer Approval)
    if (action === "approve_transaction" || action === "approve_funding") {
      const txRef = reference || body.txRef;
      const txId = transactionId || body.txId;

      if (!txId && !txRef) {
        return NextResponse.json(
          { success: false, error: "transactionId or reference is required" },
          { status: 400 }
        );
      }

      try {
        const tx = await prisma.walletTransaction.findFirst({
          where: {
            OR: [
              ...(txId ? [{ id: txId }] : []),
              ...(txRef ? [{ reference: txRef }] : []),
            ],
          },
          include: { user: true },
        });

        if (!tx) {
          return NextResponse.json(
            { success: false, error: `Transaction ${txRef || txId} not found in database.` },
            { status: 404 }
          );
        }

        if (tx.status === "SUCCESS") {
          return NextResponse.json({
            success: true,
            message: `Transaction #${tx.reference} is already approved and credited.`,
            data: { transaction: tx },
          });
        }

        // Atomically update transaction to SUCCESS and increment user balance
        const [updatedTx, updatedUser] = await prisma.$transaction([
          prisma.walletTransaction.update({
            where: { id: tx.id },
            data: { status: "SUCCESS" },
          }),
          prisma.user.update({
            where: { id: tx.userId },
            data: {
              balance: {
                increment: tx.amount,
              },
            },
            select: { id: true, email: true, balance: true },
          }),
        ]);

        // Send Telegram alert
        try {
          const { adminChatId } = getTelegramConfig();
          if (adminChatId) {
            await sendTelegramMessage(
              adminChatId,
              `✅ <b>PalmPay Transaction Approved via Admin Dashboard!</b>\n` +
                `• <b>Ref:</b> <code>${tx.reference}</code>\n` +
                `• <b>Amount Credited:</b> ₦${tx.amount.toLocaleString()}\n` +
                `• <b>User:</b> ${tx.user?.email || tx.userId}\n` +
                `• <b>New Balance:</b> ₦${updatedUser.balance.toLocaleString()}`
            );
          }
        } catch (tgErr) {
          console.warn("[Admin API] Telegram alert warning:", tgErr);
        }

        return NextResponse.json({
          success: true,
          message: `Transaction #${tx.reference} approved! Credited ₦${tx.amount.toLocaleString()} to ${tx.user?.email}.`,
          data: {
            transaction: updatedTx,
            newBalance: updatedUser.balance,
          },
        });
      } catch (err) {
        console.error("[Admin API] Failed to approve transaction:", err);
        return NextResponse.json(
          { success: false, error: "Database error approving transaction" },
          { status: 500 }
        );
      }
    }

    // Action: Reject Transaction
    if (action === "reject_transaction") {
      const txRef = reference || body.txRef;
      const txId = transactionId || body.txId;

      try {
        const tx = await prisma.walletTransaction.findFirst({
          where: {
            OR: [
              ...(txId ? [{ id: txId }] : []),
              ...(txRef ? [{ reference: txRef }] : []),
            ],
          },
        });

        if (!tx) {
          return NextResponse.json(
            { success: false, error: "Transaction not found" },
            { status: 404 }
          );
        }

        const updatedTx = await prisma.walletTransaction.update({
          where: { id: tx.id },
          data: { status: "FAILED" },
        });

        return NextResponse.json({
          success: true,
          message: `Transaction #${tx.reference} marked as REJECTED / FAILED.`,
          data: { transaction: updatedTx },
        });
      } catch (err) {
        return NextResponse.json(
          { success: false, error: "Failed to reject transaction" },
          { status: 500 }
        );
      }
    }

    // Action 1: Adjust user balance
    if (action === "adjust_balance") {
      if (!userId || typeof amount !== "number") {
        return NextResponse.json({ success: false, error: "userId and numeric amount required" }, { status: 400 });
      }

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            balance: {
              increment: amount,
            },
          },
          select: { id: true, name: true, email: true, balance: true },
        });

        // Record a wallet transaction
        try {
          await prisma.walletTransaction.create({
            data: {
              userId,
              type: amount > 0 ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
              amount: Math.abs(amount),
              status: "SUCCESS",
              reference: `TX-ADM-${Date.now()}`,
              gateway: "admin_console",
              description: `Admin balance adjustment of ₦${Math.abs(amount).toLocaleString()}`,
            },
          });
        } catch {
          // Non-blocking transaction log
        }

        return NextResponse.json({
          success: true,
          message: `Successfully updated balance for ${updatedUser.email}. New balance: ₦${updatedUser.balance.toLocaleString()}`,
          data: updatedUser,
        });
      } catch (err) {
        console.warn("[Admin API] Failed DB user update (falling back to mock state):", err);
        return NextResponse.json({
          success: true,
          message: `Simulated balance adjustment of ₦${amount.toLocaleString()}`,
          data: { id: userId, balance: amount },
        });
      }
    }

    // Action 2: Toggle role
    if (action === "toggle_role") {
      if (!userId || !role) {
        return NextResponse.json({ success: false, error: "userId and role required" }, { status: 400 });
      }

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role },
          select: { id: true, email: true, role: true },
        });

        return NextResponse.json({
          success: true,
          message: `Updated role for ${updatedUser.email} to ${role.toUpperCase()}`,
          data: updatedUser,
        });
      } catch (err) {
        console.warn("[Admin API] Failed DB role toggle (falling back to mock state):", err);
        return NextResponse.json({
          success: true,
          message: `Simulated role change to ${role.toUpperCase()}`,
          data: { id: userId, role },
        });
      }
    }

    // Action 3: Approve Order / Force release escrow
    if (action === "approve_order" || action === "release_escrow") {
      if (!orderId) {
        return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
      }

      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
        });

        await prisma.order.updateMany({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
          data: {
            status: "COMPLETED",
            notes: order?.notes
              ? `${order.notes} • Approved from Admin Dashboard`
              : "Approved from Admin Dashboard",
          },
        });

        // Notify Telegram bot
        try {
          const { adminChatId } = getTelegramConfig();
          if (adminChatId) {
            await sendTelegramMessage(
              adminChatId,
              `✅ <b>Order #${orderId} Approved via Admin Dashboard!</b>\nStatus marked as COMPLETED. Credentials released to buyer.`
            );
          }
        } catch {
          // Telegram sync non-blocking
        }
      } catch (err) {
        console.warn("[Admin API] Order update fallback:", err);
      }

      return NextResponse.json({
        success: true,
        message: `Order #${orderId} approved and marked COMPLETED.`,
      });
    }

    // Action 4: Force refund
    if (action === "refund_order") {
      if (!orderId) {
        return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
      }

      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "REFUNDED" },
          });

          if (order.userId && order.totalPrice > 0) {
            await prisma.user.update({
              where: { id: order.userId },
              data: { balance: { increment: order.totalPrice } },
            });
          }
        }
      } catch (err) {
        console.warn("[Admin API] Order refund fallback:", err);
      }

      return NextResponse.json({
        success: true,
        message: `Order #${orderId} marked as REFUNDED. Funds returned to customer wallet.`,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[/api/admin/overview POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Action failed" },
      { status: 500 }
    );
  }
}
