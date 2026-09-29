import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, UserProfile } from "@/types/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let session = null;
    try {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    } catch {
      // Unauthenticated caller
    }

    if (session?.user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          orders: { select: { id: true } },
        },
      });

      if (dbUser) {
        const userProfile: UserProfile = {
          id: dbUser.id,
          username: dbUser.name || dbUser.email.split("@")[0],
          email: dbUser.email,
          balance: dbUser.balance || 0,
          currency: dbUser.currency || "₦",
          role: dbUser.role || "user",
          totalOrders: dbUser.orders.length,
        };

        const responsePayload: ApiResponse<UserProfile> = {
          success: true,
          data: userProfile,
          source: "database",
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json(responsePayload, { status: 200 });
      }
    }

    // Default guest profile
    const guestProfile: UserProfile = {
      id: "guest",
      username: "Guest",
      email: "guest@sterlinglogs.com",
      balance: 0,
      currency: "₦",
      role: "guest",
      totalOrders: 0,
    };

    return NextResponse.json({
      success: true,
      data: guestProfile,
      source: "database",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve profile";

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
