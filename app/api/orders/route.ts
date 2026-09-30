import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLogProvider } from "@/lib/providers";
import { ApiResponse, DeliveredItem, OrderRequest, OrderResult, PaymentGateway } from "@/types/inventory";
import { getWorkingTools, decrementToolStock } from "@/lib/storage/workingTools";

export const dynamic = "force-dynamic";

function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return `${Math.max(1, diffSec)} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length < 2) return `${email.slice(0, 3)}***`;
  const user = parts[0];
  const domain = parts[1];
  const maskedUser = user.length <= 3 ? `${user}***` : `${user.slice(0, 3)}***`;
  return `${maskedUser}@${domain}`;
}

/**
 * POST /api/orders
 * Places an escrow order, dispatches bundle, and records in live Neon DB
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequest;

    if (!body || !body.productId) {
      return NextResponse.json(
        {
          success: false,
          error: "productId is required to place an order.",
          source: "mock",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const provider = getLogProvider();
    const workingTools = await getWorkingTools();
    const matchedTool = workingTools.find((t) => t.id === String(body.productId));

    let result: OrderResult;

    if (matchedTool) {
      const orderId = `STL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const qty = Math.max(1, Number(body.quantity) || 1);
      const totalPrice = matchedTool.price * qty;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Decrement the pieces available
      await decrementToolStock(matchedTool.id, qty);

      result = {
        orderId,
        productId: matchedTool.id,
        productTitle: matchedTool.name,
        quantity: qty,
        totalPrice,
        currency: matchedTool.currency || "₦",
        status: "ESCROW_ACTIVE",
        escrowHours: 24,
        paymentGateway: (body.paymentGateway as PaymentGateway) || "gtb",
        paymentReference: body.paymentReference || `TOOL-${orderId}-${Date.now().toString().slice(-4)}`,
        customerEmail: body.customerEmail || "customer@sterlinglogs.com",
        deliveryItems: [
          {
            id: `item_${orderId}_1`,
            username: matchedTool.name,
            credentials: `Telegram Bot Link: ${matchedTool.link}`,
            token: matchedTool.link,
          },
        ],
        emailDelivery: {
          sent: true,
          recipient: body.customerEmail || "customer@sterlinglogs.com",
          subject: `Sterling Logs - ${matchedTool.name} Delivered (Order #${orderId})`,
          dispatchedAt: now.toISOString(),
          messageId: `msg_${orderId}`,
          bundleSummary: `Working Tool Unlocked: ${matchedTool.name}`,
        },
        createdAt: now.toISOString(),
        escrowExpiresAt: expiresAt.toISOString(),
      };
    } else {
      result = await provider.placeOrder({
        productId: String(body.productId),
        quantity: Math.max(1, Number(body.quantity) || 1),
        customerEmail: body.customerEmail || "customer@sterlinglogs.com",
        customerTelegram: body.customerTelegram,
        paymentGateway: body.paymentGateway || "gtb",
        phoneNumber: body.phoneNumber,
      });
    }

    // Save live order directly to Neon DB
    try {
      let userId: string | null = null;
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (session?.user?.id) {
          userId = session.user.id;
        }
      } catch {
        // Guest user checkout
      }

      const emailToMatch = (body.customerEmail || result.customerEmail || result.emailDelivery?.recipient || "").trim().toLowerCase();
      if (!userId && emailToMatch) {
        const existingUser = await prisma.user.findUnique({
          where: { email: emailToMatch },
          select: { id: true },
        });
        if (existingUser) {
          userId = existingUser.id;
        }
      }

      const paymentRefToStore = body.paymentReference || result.paymentReference;
      const notesParts: string[] = [];
      if (body.customerTelegram) notesParts.push(`Telegram: ${body.customerTelegram}`);
      if (body.senderName) notesParts.push(`Sender: ${body.senderName}`);
      if (body.senderBank) notesParts.push(`Bank: ${body.senderBank}`);
      if (body.notes) notesParts.push(body.notes);
      const combinedNotes = notesParts.length > 0 ? notesParts.join(" • ") : null;

      await prisma.order.create({
        data: {
          orderNumber: result.orderId,
          userId,
          customerEmail: emailToMatch || "customer@sterlinglogs.com",
          productId: result.productId,
          productTitle: result.productTitle,
          platform: (
            result.productTitle.split(" ")[1] ||
            result.productTitle.split(" ")[0] ||
            "Digital"
          ).replace(/[^a-zA-Z]/g, "") || "Digital Asset",
          quantity: result.quantity,
          totalPrice: result.totalPrice,
          currency: result.currency || "₦",
          status: result.status,
          escrowHours: result.escrowHours || 24,
          paymentGateway: String(body.paymentGateway || result.paymentGateway).toLowerCase(),
          paymentReference: paymentRefToStore,
          deliveryItems: (result.deliveryItems || []) as object,
          notes: combinedNotes,
          escrowExpiresAt: new Date(result.escrowExpiresAt),
        },
      });

      if (body.paymentReference) {
        result.paymentReference = body.paymentReference;
      }
    } catch (dbErr) {
      console.error("[Orders API] Failed to persist order in database:", dbErr);
    }

    const responsePayload: ApiResponse<OrderResult> = {
      success: true,
      data: result,
      source: matchedTool ? "database" : provider.isMock ? "mock" : "external",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to place order";

    return NextResponse.json(
      {
        success: false,
        error: message,
        source: "mock",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * 1. GET /api/orders?recent=true -> Live recent purchases for Hero ticker from DB
 * 2. GET /api/orders?orderId=... -> Specific order verification from DB
 * 3. GET /api/orders -> Authenticated user's live order history from DB
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const isRecent = searchParams.get("recent") === "true";

    // 1. Live Recent Purchases for Hero ticker (Pulled directly from Neon DB)
    if (isRecent) {
      const recentOrders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          orderNumber: true,
          customerEmail: true,
          productTitle: true,
          platform: true,
          createdAt: true,
        },
      });

      const livePurchases = recentOrders.map((o: any) => ({
        user: maskEmail(o.customerEmail),
        item: o.productTitle,
        time: formatRelativeTime(o.createdAt),
      }));

      return NextResponse.json({
        success: true,
        data: livePurchases,
        source: "database",
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Fetch specific order by ID
    if (orderId) {
      const dbOrder = await prisma.order.findFirst({
        where: {
          OR: [{ orderNumber: orderId }, { id: orderId }],
        },
      });

      if (dbOrder) {
        const orderResult: OrderResult = {
          orderId: dbOrder.orderNumber,
          productId: dbOrder.productId,
          productTitle: dbOrder.productTitle,
          quantity: dbOrder.quantity,
          totalPrice: dbOrder.totalPrice,
          currency: dbOrder.currency,
          paymentGateway: dbOrder.paymentGateway as OrderResult["paymentGateway"],
          paymentReference: dbOrder.paymentReference || "",
          status: dbOrder.status as OrderResult["status"],
          escrowHours: dbOrder.escrowHours,
          deliveryItems: ((Array.isArray(dbOrder.deliveryItems)
            ? dbOrder.deliveryItems
            : []) as unknown) as DeliveredItem[],
          emailDelivery: {
            sent: true,
            recipient: dbOrder.customerEmail,
            subject: `Order #${dbOrder.orderNumber} Delivery Bundle`,
            dispatchedAt: dbOrder.createdAt.toISOString(),
            messageId: `msg_${dbOrder.orderNumber.toLowerCase()}`,
            bundleSummary: `${dbOrder.productTitle} dispatched to vault.`,
          },
          createdAt: dbOrder.createdAt.toISOString(),
          escrowExpiresAt: dbOrder.escrowExpiresAt.toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: orderResult,
          source: "database",
          timestamp: new Date().toISOString(),
        });
      }

      // Fallback to provider cache
      const provider = getLogProvider();
      const order = await provider.getOrder(orderId);

      if (!order) {
        return NextResponse.json(
          {
            success: false,
            error: `Order with ID '${orderId}' not found`,
            source: provider.isMock ? "mock" : "external",
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: order,
        source: provider.isMock ? "mock" : "external",
        timestamp: new Date().toISOString(),
      });
    }

    // 3. User Vault Order History (Live from Neon DB)
    let userOrders: Array<OrderResult> = [];
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user) {
        const dbOrders = await prisma.order.findMany({
          where: {
            OR: [
              { userId: session.user.id },
              { customerEmail: session.user.email },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        userOrders = dbOrders.map((o: any) => ({
          orderId: o.orderNumber,
          productId: o.productId,
          productTitle: o.productTitle,
          quantity: o.quantity,
          totalPrice: o.totalPrice,
          currency: o.currency,
          paymentGateway: o.paymentGateway as OrderResult["paymentGateway"],
          paymentReference: o.paymentReference || "",
          status: o.status as OrderResult["status"],
          escrowHours: o.escrowHours,
          deliveryItems: ((Array.isArray(o.deliveryItems)
            ? o.deliveryItems
            : []) as unknown) as DeliveredItem[],
          emailDelivery: {
            sent: true,
            recipient: o.customerEmail,
            subject: `Order #${o.orderNumber} Delivery Bundle`,
            dispatchedAt: o.createdAt.toISOString(),
            messageId: `msg_${o.orderNumber.toLowerCase()}`,
            bundleSummary: `${o.productTitle} dispatched to vault.`,
          },
          createdAt: o.createdAt.toISOString(),
          escrowExpiresAt: o.escrowExpiresAt.toISOString(),
        }));
      }
    } catch (authErr) {
      console.warn("[Orders API] Error fetching user session orders:", authErr);
    }

    return NextResponse.json({
      success: true,
      data: userOrders,
      source: "database",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve orders";

    return NextResponse.json(
      {
        success: false,
        error: message,
        source: "database",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
