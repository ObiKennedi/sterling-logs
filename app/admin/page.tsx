import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayout } from "@/components/Admin";

export const metadata: Metadata = {
  title: "Admin Command Center | Sterling Logs",
  description:
    "Administrator control center for managing orders, escrow warranty claims, reseller user balances, and vendor API integrations.",
};

export default async function AdminPage() {
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
        console.warn("[AdminPage] DB query warning:", err);
      }

      // If user is a regular customer, separate them to /dashboard
      if (role !== "admin") {
        redirect("/dashboard");
      }
    }
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.warn("[AdminPage] Session verification warning:", err);
  }

  return <AdminLayout />;
}
