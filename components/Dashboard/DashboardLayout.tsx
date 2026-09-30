"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Lock,
  Wallet,
  Settings,
  ShoppingBag,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { OrderResult, UserProfile } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import { OverviewTab } from "./OverviewTab";
import { InventoryTab } from "./InventoryTab";
import { VaultTab } from "./VaultTab";
import { WalletTab } from "./WalletTab";
import { SettingsTab } from "./SettingsTab";
import styles from "./DashboardLayout.module.scss";

type DashboardTab = "overview" | "inventory" | "vault" | "wallet" | "settings";

const DEFAULT_PROFILE: UserProfile = {
  id: "",
  username: "User",
  email: "",
  balance: 0,
  currency: "₦",
  role: "user",
  totalOrders: 0,
};

export const DashboardLayout: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [orders, setOrders] = useState<OrderResult[]>([]);

  // Load live orders & profile from API directly from Neon DB
  useEffect(() => {
    async function loadUserData() {
      try {
        const [ordersRes, profileRes] = await Promise.all([
          fetch("/api/orders").then((r) => r.json()).catch(() => null),
          fetch("/api/profile").then((r) => r.json()).catch(() => null),
        ]);

        if (ordersRes?.data && Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        }
        if (profileRes?.data) {
          setProfile(profileRes.data);
        }
      } catch (err) {
        console.warn("Error loading dashboard state from database:", err);
      }
    }
    loadUserData();
  }, []);

  const handleReleaseEscrow = (orderId: string) => {
    if (confirm(`Confirm account is working? Funds for #${orderId} will be released from escrow.`)) {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: "COMPLETED" } : o))
      );
    }
  };

  const handleRequestReplacement = (orderId: string) => {
    const reason = prompt("Enter reason for warranty replacement (e.g. Invalid password, Checkpoint triggered):");
    if (reason) {
      alert(
        `Replacement request for #${orderId} submitted! Our automated system will review and deliver a replacement package to ${profile.email} within 15 minutes.`
      );
    }
  };

  const handleFundWallet = async (amount: number, gateway: "gtb" | "paypoint") => {
    // Simulate instant wallet credit
    await new Promise((r) => setTimeout(r, 1200));
    setProfile((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));
  };

  const handleSignOut = () => {
    router.push("/login");
  };

  const activeEscrowOrdersCount = orders.filter((o) => o.status === "ESCROW_ACTIVE").length;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.ambientBlurTop} />

      {/* Top Header Navigation */}
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          <div className={styles.navBrandGroup}>
            <Logo size="md" />
            <button
              type="button"
              className={`${styles.marketplaceLink} ${activeTab === "inventory" ? styles.marketplaceLinkActive : ""}`}
              onClick={() => setActiveTab("inventory")}
              title="Browse Logs Market & Buy Accounts"
            >
              <ShoppingBag size={15} />
              <span>Logs Market</span>
            </button>
          </div>

          <div className={styles.navActionsGroup}>
            {/* Naira Wallet Pill */}
            <div
              className={styles.walletPill}
              onClick={() => setActiveTab("wallet")}
              title="Click to add money to your Naira wallet"
            >
              <Wallet size={15} />
              <span className={styles.balanceLabel}>Wallet:</span>
              <span className={styles.walletAmount}>{formatNaira(profile.balance)}</span>
              <span className={styles.fundIconBtn} title="Add money">
                <Plus size={12} />
              </span>
            </div>

            {/* Profile Avatar Pill */}
            <div className={styles.userProfilePill}>
              <div className={styles.avatar}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <span className={styles.userName}>{profile.username}</span>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              className={styles.signOutBtn}
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Subnav Tabs Bar */}
      <nav className={styles.subNavBar} aria-label="Dashboard Navigation">
        <div className={styles.subNavInner}>
          <button
            type="button"
            className={`${styles.tabLink} ${activeTab === "overview" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`${styles.tabLink} ${activeTab === "inventory" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <ShoppingBag size={16} />
            <span>Logs Market</span>
            <span className={styles.badgeCountLive}>180+ Ready</span>
          </button>

          <button
            type="button"
            className={`${styles.tabLink} ${activeTab === "vault" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("vault")}
          >
            <Lock size={16} />
            <span>My Vault (Bought Logs)</span>
            {activeEscrowOrdersCount > 0 && (
              <span className={styles.badgeCount}>{activeEscrowOrdersCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.tabLink} ${activeTab === "wallet" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("wallet")}
          >
            <Wallet size={16} />
            <span>Add Money (Wallet)</span>
          </button>

          <button
            type="button"
            className={`${styles.tabLink} ${activeTab === "settings" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Main Dashboard Body */}
      <main className={styles.dashboardBody}>
        {activeTab === "overview" && (
          <OverviewTab
            profile={profile}
            orders={orders}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onFundWallet={handleFundWallet}
            onOrderCreated={(newOrder) => {
              setOrders((prev) => [newOrder, ...prev]);
            }}
            onBalanceUpdate={(newBal) => {
              setProfile((prev) => ({ ...prev, balance: newBal }));
            }}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryTab
            profile={profile}
            onNavigateToWallet={() => setActiveTab("wallet")}
            onNavigateToVault={() => setActiveTab("vault")}
            onOrderCreated={(newOrder) => {
              setOrders((prev) => [newOrder, ...prev]);
            }}
            onBalanceUpdate={(newBal) => {
              setProfile((prev) => ({ ...prev, balance: newBal }));
            }}
          />
        )}

        {activeTab === "vault" && (
          <VaultTab
            orders={orders}
            onReleaseEscrow={handleReleaseEscrow}
            onRequestReplacement={handleRequestReplacement}
            onNavigateToMarketplace={() => setActiveTab("inventory")}
          />
        )}

        {activeTab === "wallet" && (
          <WalletTab
            balance={profile.balance}
            onFundWallet={handleFundWallet}
          />
        )}

        {activeTab === "settings" && <SettingsTab profile={profile} />}
      </main>
    </div>
  );
};

export default DashboardLayout;
