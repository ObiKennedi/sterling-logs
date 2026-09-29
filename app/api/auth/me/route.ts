import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        role: null,
      });
    }

    // Fetch fresh user data from database including role and balance
    let role = "user";
    let balance = 0;

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, role: true, balance: true },
      });

      if (dbUser) {
        role = dbUser.role || "user";
        balance = dbUser.balance || 0;
      }
    } catch (err) {
      console.warn("[/api/auth/me] Database query warning:", err);
      // Fallback to session user properties if available
      role = (session.user as { role?: string }).role || "user";
    }

    return NextResponse.json({
      authenticated: true,
      role,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role,
        balance,
      },
    });
  } catch (error) {
    console.error("[/api/auth/me] Error:", error);
    return NextResponse.json(
      { authenticated: false, user: null, role: null },
      { status: 500 }
    );
  }
}
