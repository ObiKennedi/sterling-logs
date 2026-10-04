import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "User Dashboard & Vault | Sterling Logs",
  description:
    "Manage your verified social media logs, download session cookies, view 2FA backup codes, fund your Naira wallet, and manage 24h escrow protections.",
};

export default async function DashboardPage() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user) {
      let role = (session.user as { role?: string }).role || "user";
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });
        if (dbUser?.role) {
          role = dbUser.role;
        }
      } catch (err) {
        console.warn("[DashboardPage] DB query warning:", err);
      }

      // If user is admin, separate them to /admin
      if (role === "admin") {
        redirect("/admin");
      }
    }
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.warn("[DashboardPage] Session verification warning:", err);
  }

  return <DashboardLayout />;
}
