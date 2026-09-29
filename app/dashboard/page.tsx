import { Metadata } from "next";
import { DashboardLayout } from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "User Dashboard & Vault | Sterling Logs",
  description:
    "Manage your verified social media logs, download session cookies, view 2FA backup codes, fund your Naira wallet, and manage 24h escrow protections.",
};

export default function DashboardPage() {
  return <DashboardLayout />;
}
