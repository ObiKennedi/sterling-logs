import { Metadata } from "next";
import { AdminLayout } from "@/components/Admin";

export const metadata: Metadata = {
  title: "Admin Command Center | Sterling Logs",
  description:
    "Administrator control center for managing orders, escrow warranty claims, reseller user balances, and vendor API integrations.",
};

export default function AdminPage() {
  return <AdminLayout />;
}
