"use client";

import React, { useState, useEffect } from "react";
import {
  LogOut,
  LayoutDashboard,
  Lock,
  Wallet,
  Settings,
  ShoppingBag,
  Plus,
  Bell,
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
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [orders, setOrders] = useState<OrderResult[]>([]);

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
        console.warn("Error loading dashboard state:", err);
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

  const handleFundWallet = async (amount: number, gateway: "palmpay" | "gtb" | "paypoint") => {
    try {
      await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, gateway }),
      });
    } catch (err) {
      console.warn("Wallet deposit sync warning:", err);
    }
  };

  const handleSignOut = () => {
    window.location.href = "/login";
  };

  const activeEscrowOrdersCount = orders.filter((o) => o.status === "ESCROW_ACTIVE").length;

  const NAV_ITEMS: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Home", icon: <LayoutDashboard size={20} /> },
    { id: "inventory", label: "Market", icon: <ShoppingBag size={20} /> },
    { id: "wallet", label: "Fund", icon: <Plus size={20} /> },
    { id: "vault", label: "My Vault", icon: <Lock size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Top Header */}
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          {/* Greeting + Avatar */}
          <div className={styles.greetingGroup}>
            <div className={styles.avatarCircle}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.greetingText}>
              <span className={styles.greetingHi}>
                Good {getTimeOfDay()}, {profile.username} 👋
              </span>
              <span className={styles.greetingSub}>Sterling Logs Dashboard</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.bellBtn}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {activeEscrowOrdersCount > 0 && (
                <span className={styles.bellDot} />
              )}
            </button>
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

      {/* Main Scrollable Body */}
      <main className={styles.dashboardBody}>
        {activeTab === "overview" && (
          <OverviewTab
            profile={profile}
            orders={orders}
            onNavigateToTab={(tab) => setActiveTab(tab)}
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

      {/* Bottom Footer Navigation */}
      <nav className={styles.bottomNav} aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            id={`nav-${item.id}`}
            className={`${styles.bottomNavBtn} ${activeTab === item.id ? styles.bottomNavActive : ""}`}
            onClick={() => setActiveTab(item.id)}
            aria-label={item.label}
          >
            <span className={styles.bottomNavIcon}>
              {item.icon}
              {item.id === "vault" && activeEscrowOrdersCount > 0 && (
                <span className={styles.bottomNavBadge}>{activeEscrowOrdersCount}</span>
              )}
              {item.id === "inventory" && (
                <span className={styles.liveIndicator} />
              )}
            </span>
            <span className={styles.bottomNavLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export default DashboardLayout;
