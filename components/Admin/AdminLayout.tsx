"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Package,
  TrendingUp,
  Server,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LogOut,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
  Plus,
  Globe,
  PhoneCall,
  Search,
  Trash2,
  Wrench,
  Link2,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaTiktok,
  FaTelegram,
  FaRedditAlien,
} from "react-icons/fa6";
import { Logo } from "@/components/Logo";
import { Loader } from "@/components/Loader";
import { formatNaira } from "@/lib/utils/format";
import styles from "./AdminLayout.module.scss";

type AdminTab = "overview" | "transactions" | "orders" | "users" | "vendor" | "tools";

export interface AdminTransaction {
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
}

export interface AdminTool {
  id: string;
  name: string;
  description: string;
  link: string;
  category: string;
  platform: string;
  price: number;
  stock?: number;
  currency?: string;
  tags: string[];
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

interface AdminOrder {
  orderId: string;
  customerEmail: string;
  productTitle: string;
  platform: string;
  totalPrice: number;
  paymentGateway: string;
  paymentReference?: string;
  notes?: string;
  status: "ESCROW_ACTIVE" | "COMPLETED" | "REFUNDED" | "DISPUTED";
  createdAt: string;
}

interface PurchasesMetrics {
  totalCount: number;
  totalVolume: number;
  activeEscrowVolume: number;
  activeEscrowCount: number;
  completedCount: number;
  disputedCount: number;
  platformBreakdown: Record<string, { count: number; volume: number }>;
}

interface VendorProfile {
  vendorName: string;
  balance: number;
  currency: string;
  username: string;
  email: string;
  totalOrders: number;
  isLiveConnected: boolean;
  endpoint: string;
  apiKeyConfigured: boolean;
  lastSyncedAt?: string;
}

function getPlatformIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("working_tools") || p.includes("tool") || p.includes("bot"))
    return {
      icon: (
        <img
          src="/working-tools.png"
          alt="Tool"
          style={{ width: "16px", height: "16px", objectFit: "contain", verticalAlign: "middle" }}
        />
      ),
      color: "#0f172a",
    };
  if (p.includes("proxy") || p.includes("vpn") || p.includes("socks")) return { icon: <Globe size={16} />, color: "#0ea5e9" };
  if (p.includes("rdp") || p.includes("vps") || p.includes("server")) return { icon: <Server size={16} />, color: "#8b5cf6" };
  if (p.includes("voice") || p.includes("phone") || p.includes("otp") || p.includes("number")) return { icon: <PhoneCall size={16} />, color: "#10b981" };
  if (p.includes("instagram")) return { icon: <FaInstagram />, color: "#E1306C" };
  if (p.includes("facebook") || p.includes("meta")) return { icon: <FaFacebookF />, color: "#1877F2" };
  if (p.includes("twitter") || p.includes(" x")) return { icon: <FaXTwitter />, color: "#38bdf8" };
  if (p.includes("tiktok")) return { icon: <FaTiktok />, color: "#f43f5e" };
  if (p.includes("telegram")) return { icon: <FaTelegram />, color: "#229ED9" };
  if (p.includes("reddit")) return { icon: <FaRedditAlien />, color: "#FF4500" };
  return { icon: <Package size={16} />, color: "#38bdf8" };
}

function getStatusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return styles.statusCompleted;
    case "DISPUTED":
      return styles.statusDisputed;
    case "REFUNDED":
      return styles.statusRefunded;
    default:
      return styles.statusEscrow;
  }
}

export const AdminLayout: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingVendor, setIsSyncingVendor] = useState<boolean>(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [purchases, setPurchases] = useState<PurchasesMetrics>({
    totalCount: 0,
    totalVolume: 0,
    activeEscrowVolume: 0,
    activeEscrowCount: 0,
    completedCount: 0,
    disputedCount: 0,
    platformBreakdown: {},
  });
  const [vendor, setVendor] = useState<VendorProfile>({
    vendorName: "Ifeco Logs / External API",
    balance: 0,
    currency: "₦",
    username: "Admin",
    email: "admin@sterlinglogs.com",
    totalOrders: 0,
    isLiveConnected: false,
    endpoint: "https://ifecologs.com/api",
    apiKeyConfigured: false,
  });
  const [markupMultiplier, setMarkupMultiplier] = useState<number>(1.5);
  const [flashMessage, setFlashMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [receivingAccount, setReceivingAccount] = useState<{
    bank: string;
    accountNumber: string;
    accountName: string;
    telegramBot: string;
  }>({
    bank: "PalmPay",
    accountNumber: "7061449557",
    accountName: "Nathaniel Chinwendu",
    telegramBot: "SterlingLogsMarketBot",
  });
  const [isSendingTestTelegram, setIsSendingTestTelegram] = useState<boolean>(false);

  // Working Tools State
  const [workingTools, setWorkingTools] = useState<AdminTool[]>([]);
  const [isAddToolOpen, setIsAddToolOpen] = useState(false);
  const [isSubmittingTool, setIsSubmittingTool] = useState(false);
  const [newToolForm, setNewToolForm] = useState({
    name: "",
    link: "",
    description: "",
    price: "8500",
    stock: "",
    tags: "Telegram Bot, Direct Access, Verified",
    platform: "Telegram Bot",
  });

  // Transactions state
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [transactionSearchQuery, setTransactionSearchQuery] = useState("");
  const [transactionStatusFilter, setTransactionStatusFilter] = useState("all");
  const [isApprovingTxId, setIsApprovingTxId] = useState<string | null>(null);

  // Filters & search state
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFlashMessage({ type, text });
    setTimeout(() => {
      setFlashMessage(null);
    }, 4500);
  };

  // Load live admin stats from database and vendor API
  const loadAdminData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      const json = await res.json();

      if (json.success && json.data) {
        setUsers(json.data.users || []);
        setOrders(json.data.orders || []);
        if (json.data.transactions) setTransactions(json.data.transactions);
        if (json.data.purchases) setPurchases(json.data.purchases);
        if (json.data.vendor) setVendor(json.data.vendor);
        if (json.data.receivingAccount) setReceivingAccount(json.data.receivingAccount);
      }

      // Fetch working tools
      try {
        const toolsRes = await fetch("/api/admin/tools", { cache: "no-store" });
        const toolsJson = await toolsRes.json();
        if (toolsJson.success && toolsJson.data) {
          setWorkingTools(toolsJson.data);
        }
      } catch (toolsErr) {
        console.warn("[AdminLayout] Error fetching tools:", toolsErr);
      }
    } catch (err) {
      console.warn("[AdminLayout] Error fetching admin overview:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Create new working tool
  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolForm.name.trim()) {
      alert("Please enter a tool name.");
      return;
    }
    if (!newToolForm.link.trim()) {
      alert("Please enter a Telegram bot link or tool URL.");
      return;
    }

    try {
      setIsSubmittingTool(true);
      const res = await fetch("/api/admin/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newToolForm.name,
          link: newToolForm.link,
          description: newToolForm.description,
          price: Number(newToolForm.price) || 0,
          stock: newToolForm.stock ? Number(newToolForm.stock) : undefined,
          tags: newToolForm.tags,
          platform: newToolForm.platform || "Telegram Bot",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setWorkingTools((prev) => [data.data, ...prev]);
        showNotification(data.message || `Tool "${data.data.name}" added successfully!`);
        setIsAddToolOpen(false);
        setNewToolForm({
          name: "",
          link: "",
          description: "",
          price: "8500",
          stock: "",
          tags: "Telegram Bot, Direct Access, Verified",
          platform: "Telegram Bot",
        });
      } else {
        showNotification(data.error || "Failed to add tool", "error");
      }
    } catch {
      showNotification("Error saving tool", "error");
    } finally {
      setIsSubmittingTool(false);
    }
  };

  // Delete working tool
  const handleDeleteTool = async (toolId: string, toolName: string) => {
    if (!confirm(`Are you sure you want to delete tool "${toolName}"? It will be removed from the Working tools category.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/tools?id=${encodeURIComponent(toolId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setWorkingTools((prev) => prev.filter((t) => t.id !== toolId));
        showNotification(`Tool "${toolName}" deleted.`);
      } else {
        showNotification(data.error || "Failed to delete tool", "error");
      }
    } catch {
      showNotification("Error deleting tool", "error");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Sync Inventory Platform Balance in real-time
  const handleRefreshVendor = async () => {
    try {
      setIsSyncingVendor(true);
      await loadAdminData(true);
      showNotification(`Inventory platform balance synced! Live balance: ${formatNaira(vendor.balance)}`);
    } catch {
      showNotification("Failed to re-sync inventory provider", "error");
    } finally {
      setIsSyncingVendor(false);
    }
  };

  // Approve PalmPay Transaction & credit user wallet
  const handleApproveTransaction = async (
    txId: string,
    reference: string,
    amount: number,
    userEmail: string
  ) => {
    if (
      !confirm(
        `Admin Action: Confirm manual approval of PalmPay deposit?\n\n• Reference: ${reference}\n• User: ${userEmail}\n• Amount: ${formatNaira(
          amount
        )}\n\nThis will immediately credit the user's wallet balance.`
      )
    ) {
      return;
    }

    try {
      setIsApprovingTxId(txId);
      const res = await fetch("/api/admin/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_transaction", transactionId: txId, reference }),
      });
      const data = await res.json();
      if (data.success) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === txId || t.reference === reference ? { ...t, status: "SUCCESS" } : t))
        );
        if (data.data?.newBalance !== undefined) {
          setUsers((prev) =>
            prev.map((u) => (u.email === userEmail ? { ...u, balance: data.data.newBalance } : u))
          );
        }
        showNotification(data.message || `Transaction #${reference} approved & credited!`);
      } else {
        showNotification(data.error || "Failed to approve transaction", "error");
      }
    } catch {
      showNotification("Error approving transaction", "error");
    } finally {
      setIsApprovingTxId(null);
    }
  };

  // Force release escrow / approve order
  const handleForceReleaseEscrow = async (orderId: string) => {
    if (!confirm(`Admin Action: Confirm manual approval of order #${orderId}? Credentials will be unlocked for the buyer.`)) return;

    try {
      const res = await fetch("/api/admin/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_order", orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: "COMPLETED" } : o))
        );
        showNotification(data.message || `Order #${orderId} approved and completed.`);
      }
    } catch {
      showNotification("Failed to approve order", "error");
    }
  };

  // Test Telegram ping to Nathaniel's Telegram chat
  const handleTestTelegramPing = async () => {
    try {
      setIsSendingTestTelegram(true);
      const res = await fetch("/api/webhooks/telegram?test=true");
      const data = await res.json();
      if (data.success) {
        showNotification("Test alert dispatched to Nathaniel Chinwendu's Telegram!");
      } else {
        showNotification(data.message || "Failed to send message. Make sure to click /start on @SterlingLogsMarketBot in Telegram.", "error");
      }
    } catch {
      showNotification("Error testing Telegram bot.", "error");
    } finally {
      setIsSendingTestTelegram(false);
    }
  };

  // Force refund order
  const handleForceRefund = async (orderId: string) => {
    if (!confirm(`Admin Action: Refund order #${orderId} to customer's wallet balance?`)) return;

    try {
      const res = await fetch("/api/admin/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refund_order", orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: "REFUNDED" } : o))
        );
        showNotification(data.message || `Order #${orderId} refunded.`);
      }
    } catch {
      showNotification("Failed to process refund", "error");
    }
  };

  // Adjust user balance
  const handleAdjustBalance = async (userId: string, currentBalance: number, userEmail: string) => {
    const input = prompt(
      `Adjust Naira Wallet for ${userEmail}\n(Current: ${formatNaira(currentBalance)}):\nEnter amount in ₦ to add (or negative to debit):`,
      "10000"
    );
    if (!input) return;

    const amount = Number(input.replace(/[^0-9.-]/g, ""));
    if (isNaN(amount) || amount === 0) {
      alert("Please enter a valid non-zero amount in Naira.");
      return;
    }

    try {
      const res = await fetch("/api/admin/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adjust_balance", userId, amount }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, balance: u.balance + amount } : u))
        );
        showNotification(data.message || `Updated balance by ${formatNaira(amount)}`);
      }
    } catch {
      showNotification("Failed to adjust user balance", "error");
    }
  };

  // Toggle user role
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Change account permission to ${nextRole.toUpperCase()}?`)) return;

    try {
      const res = await fetch("/api/admin/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_role", userId, role: nextRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
        );
        showNotification(data.message || `User permission updated to ${nextRole.toUpperCase()}`);
      }
    } catch {
      showNotification("Failed to toggle user role", "error");
    }
  };

  const handleSignOut = () => {
    router.push("/login");
  };

  const disputedOrdersCount = orders.filter((o) => o.status === "DISPUTED").length;
  const pendingTransactionsCount = transactions.filter((t) => t.status === "PENDING").length;

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesStatus = transactionStatusFilter === "all" || t.status === transactionStatusFilter;
      const q = transactionSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.reference.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        String(t.amount).includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [transactions, transactionStatusFilter, transactionSearchQuery]);
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const q = orderSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderId.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.productTitle.toLowerCase().includes(q) ||
        o.platform.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, userSearchQuery]);

  return (
    <div className={styles.adminContainer}>
      <div className={styles.ambientBlurTop} />

      {/* Admin Top Navigation */}
      <header className={styles.adminTopBar}>
        <div className={styles.topBarInner}>
          <div className={styles.brandGroup}>
            <Logo size="md" variant="white" />
            <span className={styles.adminBadge}>
              <ShieldAlert size={12} />
              <span className={styles.badgeTextFull}>Admin Command Center</span>
              <span className={styles.badgeTextShort}>Admin</span>
            </span>
          </div>

          <div className={styles.topBarActions}>
            <button
              type="button"
              id="admin-add-tools-top-btn"
              className={styles.addToolsTopBtn}
              onClick={() => setIsAddToolOpen(true)}
              title="Upload new tool or Telegram bot link"
            >
              <Plus size={15} />
              <span>Add tools</span>
            </button>

            <Link href="/" className={styles.homeLinkBtn} title="Public Marketplace Site">
              <ExternalLink size={14} />
              <span className={styles.btnText}>Public Site</span>
            </Link>

            <Link href="/dashboard" className={styles.homeLinkBtn} title="User Account View">
              <ArrowUpRight size={14} />
              <span className={styles.btnText}>User View</span>
            </Link>

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

      {/* Admin Subnav Tabs */}
      <nav className={styles.adminTabsBar} aria-label="Admin Navigation">
        <div className={styles.tabsInner}>
          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "overview" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <TrendingUp size={16} />
            <span className={styles.tabLabelFull}>Platform Overview</span>
            <span className={styles.tabLabelShort}>Overview</span>
          </button>

          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "transactions" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <DollarSign size={16} />
            <span className={styles.tabLabelFull}>PalmPay Transactions ({transactions.length})</span>
            <span className={styles.tabLabelShort}>Transactions ({transactions.length})</span>
            {pendingTransactionsCount > 0 && (
              <span className={styles.badgeAlert}>{pendingTransactionsCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "tools" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("tools")}
          >
            <img
              src="/working-tools.png"
              alt="Tools"
              style={{ width: "16px", height: "16px", objectFit: "contain", verticalAlign: "middle" }}
            />
            <span className={styles.tabLabelFull}>Working Tools &amp; Bots ({workingTools.length})</span>
            <span className={styles.tabLabelShort}>Tools ({workingTools.length})</span>
          </button>

          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "orders" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <Package size={16} />
            <span className={styles.tabLabelFull}>Global Purchases &amp; Escrow ({orders.length})</span>
            <span className={styles.tabLabelShort}>Orders ({orders.length})</span>
            {disputedOrdersCount > 0 && (
              <span className={styles.badgeAlert}>{disputedOrdersCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "users" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} />
            <span className={styles.tabLabelFull}>User Directory &amp; Purchases ({users.length})</span>
            <span className={styles.tabLabelShort}>Users ({users.length})</span>
          </button>

          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "vendor" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("vendor")}
          >
            <Server size={16} />
            <span className={styles.tabLabelFull}>Inventory Platform Balance (Ifeco)</span>
            <span className={styles.tabLabelShort}>Vendor API</span>
          </button>
        </div>
      </nav>

      {/* Flash Banner for Admin Mutations */}
      {flashMessage && (
        <div
          style={{ maxWidth: "1320px", width: "100%", margin: "16px auto 0", padding: "0 24px", boxSizing: "border-box" }}
        >
          <div
            className={`${styles.flashBanner} ${
              flashMessage.type === "success" ? styles.flashBannerSuccess : styles.flashBannerError
            }`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {flashMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{flashMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFlashMessage(null)}
              style={{ color: "inherit", opacity: 0.8, background: "none", border: "none", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Body */}
      <main className={styles.adminBody}>
        {isLoading ? (
          <div style={{ padding: "80px 0" }}>
            <Loader
              variant="orbital"
              size="lg"
              theme="dark"
              text="Loading Sterling Command Center..."
              subtext="Fetching live user directories, purchase metrics, and external vendor balances..."
            />
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* TAB 1: PLATFORM OVERVIEW & PURCHASE VOLUME */}
            {/* ========================================================================= */}
            {activeTab === "overview" && (
              <>
                {/* 4 Top Highlight Metrics */}
                <div className={styles.metricsGrid}>
                  {/* Metric 1: Total Purchases Volume */}
                  <div className={styles.metricCard}>
                    <div className={styles.metricInfo}>
                      <span className={styles.label}>Total Purchases Volume</span>
                      <span className={styles.value}>{formatNaira(purchases.totalVolume)}</span>
                      <span className={styles.subtext}>
                        <TrendingUp size={12} />
                        {purchases.totalCount} Orders Total ({purchases.completedCount} Settled)
                      </span>
                    </div>
                    <div className={styles.iconBox}>
                      <DollarSign size={22} />
                    </div>
                  </div>

                  {/* Metric 2: Escrow Vault Hold */}
                  <div className={styles.metricCard}>
                    <div className={styles.metricInfo}>
                      <span className={styles.label}>24h Escrow Protection Hold</span>
                      <span className={styles.value}>{formatNaira(purchases.activeEscrowVolume)}</span>
                      <span className={styles.subtext} style={{ color: "#38bdf8" }}>
                        <ShieldCheck size={12} />
                        {purchases.activeEscrowCount} Active Under Warranty
                      </span>
                    </div>
                    <div
                      className={styles.iconBox}
                      style={{ background: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" }}
                    >
                      <Package size={22} />
                    </div>
                  </div>

                  {/* Metric 3: Registered Users */}
                  <div className={styles.metricCard}>
                    <div className={styles.metricInfo}>
                      <span className={styles.label}>Registered Accounts</span>
                      <span className={styles.value}>{users.length} Users</span>
                      <span className={styles.subtext}>
                        <Users size={12} />
                        {users.filter((u) => u.role === "admin").length} Admins •{" "}
                        {users.filter((u) => u.role !== "admin").length} Resellers
                      </span>
                    </div>
                    <div
                      className={styles.iconBox}
                      style={{ background: "rgba(168, 85, 247, 0.12)", color: "#c084fc" }}
                    >
                      <Users size={22} />
                    </div>
                  </div>

                  {/* Metric 4: Inventory Platform Balance (Ifeco) */}
                  <div className={styles.metricCard}>
                    <div className={styles.metricInfo}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span className={styles.label}>Inventory Balance (Ifeco)</span>
                        <button
                          type="button"
                          className={styles.vendorSyncBtn}
                          onClick={handleRefreshVendor}
                          disabled={isSyncingVendor}
                          title="Click to re-sync live balance from vendor API"
                        >
                          <RefreshCw
                            size={10}
                            className={isSyncingVendor ? styles.refreshIconSpin : ""}
                          />
                          <span>{isSyncingVendor ? "Syncing..." : "Sync"}</span>
                        </button>
                      </div>
                      <span className={styles.value} style={{ color: "#4ade80" }}>
                        {formatNaira(vendor.balance)}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          className={`${styles.connectionBadge} ${
                            vendor.isLiveConnected ? styles.live : styles.simulated
                          }`}
                        >
                          {vendor.isLiveConnected ? "🟢 Live API Connected" : "🟡 Simulation / Standby"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={styles.iconBox}
                      style={{ background: "rgba(34, 197, 94, 0.12)", color: "#4ade80" }}
                    >
                      <Server size={22} />
                    </div>
                  </div>
                </div>

                {/* PalmPay & Telegram Bot Synchronization Status Banner */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(30, 27, 75, 0.35) 100%)",
                    border: "1px solid rgba(124, 58, 237, 0.28)",
                    borderRadius: "14px",
                    padding: "18px 22px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "12px",
                        background: "rgba(124, 58, 237, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#a78bfa",
                        fontSize: "22px",
                      }}
                    >
                      <FaTelegram />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                          PalmPay Direct Account &amp; Telegram Approval Sync
                        </h4>
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            background: "rgba(34, 197, 94, 0.15)",
                            color: "#4ade80",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                          }}
                        >
                          🟢 Bot Active
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.825rem", color: "#cbd5e1" }}>
                        Receiving Bank: <strong style={{ color: "#ffffff" }}>{receivingAccount.bank}</strong> • Account: <strong style={{ color: "#38bdf8" }}>{receivingAccount.accountNumber}</strong> ({receivingAccount.accountName}) • Bot: <strong style={{ color: "#a78bfa" }}>@{receivingAccount.telegramBot}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      className={styles.actionBtnSmall}
                      style={{
                        background: "rgba(124, 58, 237, 0.25)",
                        color: "#c4b5fd",
                        border: "1px solid rgba(124, 58, 237, 0.4)",
                        padding: "8px 14px",
                        fontSize: "0.8rem",
                      }}
                      onClick={handleTestTelegramPing}
                      disabled={isSendingTestTelegram}
                    >
                      <FaTelegram size={14} />
                      <span>{isSendingTestTelegram ? "Sending Ping..." : "Send Test Telegram Ping"}</span>
                    </button>
                    <a
                      href={`https://t.me/${receivingAccount.telegramBot}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.actionBtnSmall}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "#ffffff",
                        padding: "8px 14px",
                        fontSize: "0.8rem",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>Open Bot</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Pending PalmPay Deposits & Quick Approval Section */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.65)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    padding: "20px 24px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "rgba(16, 185, 129, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#34d399",
                        }}
                      >
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                          PalmPay Direct Deposits &amp; Approvals
                        </h4>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          Transfer verification for official account (PalmPay • {receivingAccount.accountNumber} • {receivingAccount.accountName})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("transactions")}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#38bdf8",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>View All ({transactions.length})</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>

                  {transactions.filter((t) => t.status === "PENDING").length === 0 ? (
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "10px",
                        border: "1px dashed rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <CheckCircle2 size={24} color="#10b981" style={{ margin: "0 auto 8px" }} />
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>
                        All PalmPay deposits are cleared! No pending transactions requiring approval.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {transactions
                        .filter((t) => t.status === "PENDING")
                        .slice(0, 5)
                        .map((tx) => (
                          <div
                            key={tx.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              background: "rgba(245, 158, 11, 0.05)",
                              border: "1px solid rgba(245, 158, 11, 0.2)",
                              flexWrap: "wrap",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.9rem" }}>
                                  {formatNaira(tx.amount)}
                                </span>
                                <span className={styles.pendingBadge}>
                                  ● PENDING APPROVAL
                                </span>
                                <span style={{ fontSize: "0.75rem", color: "#cbd5e1", fontFamily: "monospace" }}>
                                  {tx.reference}
                                </span>
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                                Buyer: <strong style={{ color: "#e2e8f0" }}>{tx.userEmail}</strong> • PalmPay Transfer
                              </div>
                            </div>

                            <button
                              type="button"
                              className={styles.approveTxBtn}
                              onClick={() =>
                                handleApproveTransaction(tx.id, tx.reference, tx.amount, tx.userEmail)
                              }
                              disabled={isApprovingTxId === tx.id}
                            >
                              <CheckCircle2 size={15} />
                              <span>{isApprovingTxId === tx.id ? "Approving..." : "Approve Transaction"}</span>
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Working Tools Quick Banner */}
                <div className={styles.toolsQuickCard}>
                  <div className={styles.toolsQuickLeft}>
                    <div className={styles.toolsQuickIcon}>
                      <img
                        src="/working-tools.png"
                        alt="Working Tools"
                        style={{ width: "28px", height: "28px", objectFit: "contain" }}
                      />
                    </div>
                    <div>
                      <h4 className={styles.toolsQuickTitle}>
                        Working Tools &amp; Telegram Bots ({workingTools.length} Active)
                      </h4>
                      <p className={styles.toolsQuickDesc}>
                        Manage external Telegram bot links and direct tools uploaded to the <strong>Working tools</strong> dashboard category (positioned next to Instagram).
                      </p>
                    </div>
                  </div>
                  <div className={styles.toolsQuickActions}>
                    <button
                      type="button"
                      className={styles.addToolsPrimaryBtn}
                      onClick={() => setIsAddToolOpen(true)}
                    >
                      <Plus size={15} />
                      <span>Add tools</span>
                    </button>
                    <button
                      type="button"
                      className={styles.toolsViewAllBtn}
                      onClick={() => setActiveTab("tools")}
                    >
                      <span>Manage All ({workingTools.length})</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Purchases Breakdown By Platform */}
                <div className={styles.adminCard}>
                  <div className={styles.cardHeader}>
                    <h3>
                      <TrendingUp size={18} color="#38bdf8" />
                      Purchases Breakdown by Platform &amp; Inventory Type
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      Gross Volume: {formatNaira(purchases.totalVolume)}
                    </span>
                  </div>

                  <div style={{ padding: "18px 20px" }}>
                    <div className={styles.purchasesBreakdownGrid}>
                      {Object.keys(purchases.platformBreakdown).length === 0 ? (
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
                          No purchases recorded yet.
                        </p>
                      ) : (
                        Object.entries(purchases.platformBreakdown).map(([platform, data]) => {
                          const iconObj = getPlatformIcon(platform);
                          const percentage = purchases.totalVolume > 0
                            ? Math.round((data.volume / purchases.totalVolume) * 100)
                            : 0;

                          return (
                            <div key={platform} className={styles.platformCard}>
                              <div className={styles.platformCardTop}>
                                <div className={styles.platformName}>
                                  <span style={{ color: iconObj.color }}>{iconObj.icon}</span>
                                  <span>{platform}</span>
                                </div>
                                <span className={styles.platformCountBadge}>
                                  {data.count} {data.count === 1 ? "order" : "orders"}
                                </span>
                              </div>

                              <div className={styles.platformVolume}>
                                {formatNaira(data.volume)}
                              </div>

                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8" }}>
                                <span>Share of Purchases</span>
                                <strong style={{ color: "#ffffff" }}>{percentage}%</strong>
                              </div>

                              <div className={styles.platformProgressTrack}>
                                <div
                                  className={styles.platformProgressBar}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Purchases Table */}
                <div className={styles.adminCard}>
                  <div className={styles.cardHeader}>
                    <h3>
                      <Package size={18} color="#38bdf8" />
                      Recent Purchases &amp; Orders Stream
                    </h3>
                    <button
                      type="button"
                      className={styles.actionBtnSmall}
                      onClick={() => setActiveTab("orders")}
                    >
                      Manage All ({orders.length}) &rarr;
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
                      No purchases recorded yet in database.
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className={styles.tableDesktopView}>
                        <table className={styles.dataTable}>
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Product Title</th>
                              <th>Amount</th>
                              <th>Gateway</th>
                              <th>Escrow Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0, 6).map((o) => (
                              <tr key={o.orderId}>
                                <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#38bdf8" }}>
                                  #{o.orderId}
                                </td>
                                <td>{o.customerEmail}</td>
                                <td>{o.productTitle}</td>
                                <td style={{ fontWeight: 800, color: "#ffffff" }}>
                                  {formatNaira(o.totalPrice)}
                                </td>
                                <td>
                                  <span style={{ textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 700 }}>
                                    {o.paymentGateway}
                                  </span>
                                </td>
                                <td>
                                  <span className={`${styles.statusPill} ${getStatusClass(o.status)}`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    {o.status === "ESCROW_ACTIVE" && (
                                      <button
                                        type="button"
                                        className={styles.actionBtnSmall}
                                        style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}
                                        title="Approve Order & Release"
                                        onClick={() => handleForceReleaseEscrow(o.orderId)}
                                      >
                                        <CheckCircle2 size={12} />
                                        Approve
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className={`${styles.actionBtnSmall} ${styles.actionBtnDanger}`}
                                      title="Force Refund"
                                      onClick={() => handleForceRefund(o.orderId)}
                                    >
                                      <RotateCcw size={12} />
                                      Refund
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards View */}
                      <div className={styles.cardsMobileView}>
                        {orders.slice(0, 6).map((o) => (
                          <div key={o.orderId} className={styles.mobileOrderCard}>
                            <div className={styles.cardTopRow}>
                              <span className={styles.orderIdBadge}>#{o.orderId}</span>
                              <span className={`${styles.statusPill} ${getStatusClass(o.status)}`}>
                                {o.status}
                              </span>
                            </div>
                            <div className={styles.cardMainInfo}>
                              <h4 className={styles.productTitle}>
                                <span style={{ color: getPlatformIcon(o.platform).color }}>
                                  {getPlatformIcon(o.platform).icon}
                                </span>
                                <span>{o.productTitle}</span>
                              </h4>
                              <span className={styles.customerEmail}>{o.customerEmail}</span>
                            </div>
                            <div className={styles.cardMetaRow}>
                              <div className={styles.metaBlock}>
                                <span className={styles.metaLabel}>Price</span>
                                <span className={styles.metaValue}>{formatNaira(o.totalPrice)}</span>
                              </div>
                              <div className={styles.metaBlock}>
                                <span className={styles.metaLabel}>Gateway</span>
                                <span className={styles.metaValue} style={{ textTransform: "uppercase" }}>
                                  {o.paymentGateway}
                                </span>
                              </div>
                            </div>
                            <div className={styles.cardActionsRow}>
                              {o.status === "ESCROW_ACTIVE" && (
                                <button
                                  type="button"
                                  className={styles.actionBtnSmall}
                                  style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}
                                  onClick={() => handleForceReleaseEscrow(o.orderId)}
                                >
                                  <CheckCircle2 size={13} />
                                  Approve
                                </button>
                              )}
                              <button
                                type="button"
                                className={`${styles.actionBtnSmall} ${styles.actionBtnDanger}`}
                                onClick={() => handleForceRefund(o.orderId)}
                              >
                                <RotateCcw size={13} />
                                Refund
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* TAB: PALMPAY TRANSACTIONS & APPROVALS */}
            {/* ========================================================================= */}
            {activeTab === "transactions" && (
              <div className={styles.adminCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <DollarSign size={20} color="#10b981" />
                      PalmPay Transactions &amp; Approvals ({transactions.length})
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "0.825rem", color: "#94a3b8" }}>
                      Approve and credit customer deposits made via PalmPay (Account: {receivingAccount.accountNumber} • {receivingAccount.accountName}).
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      className={styles.actionBtnSmall}
                      onClick={() => loadAdminData(true)}
                      title="Refresh Transactions"
                    >
                      <RefreshCw size={13} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "240px" }}>
                    <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
                      <Search
                        size={15}
                        style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
                      />
                      <input
                        type="text"
                        placeholder="Search by reference, email, amount..."
                        value={transactionSearchQuery}
                        onChange={(e) => setTransactionSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px 8px 36px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#ffffff",
                          fontSize: "0.8125rem",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {["all", "PENDING", "SUCCESS", "FAILED"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setTransactionStatusFilter(status)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: "1px solid",
                          background:
                            transactionStatusFilter === status
                              ? status === "PENDING"
                                ? "rgba(245, 158, 11, 0.25)"
                                : status === "SUCCESS"
                                ? "rgba(16, 185, 129, 0.25)"
                                : "rgba(56, 189, 248, 0.2)"
                              : "rgba(255, 255, 255, 0.04)",
                          color:
                            transactionStatusFilter === status
                              ? status === "PENDING"
                                ? "#fbbf24"
                                : status === "SUCCESS"
                                ? "#34d399"
                                : "#38bdf8"
                              : "#94a3b8",
                          borderColor:
                            transactionStatusFilter === status
                              ? "currentColor"
                              : "rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        {status === "all" ? "All Transactions" : status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table View */}
                {filteredTransactions.length === 0 ? (
                  <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
                    <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 12px", opacity: 0.6 }} />
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#e2e8f0" }}>
                      No transactions match your search filter.
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      All deposits made to PalmPay will be recorded and displayed here in real time.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={styles.tableDesktopView}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>Reference</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Payment Channel</th>
                            <th>Date &amp; Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((tx) => (
                            <tr key={tx.id}>
                              <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#38bdf8", fontWeight: 700 }}>
                                {tx.reference}
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: "#ffffff" }}>{tx.userName || "Customer"}</div>
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{tx.userEmail}</div>
                              </td>
                              <td style={{ fontWeight: 800, fontSize: "0.95rem", color: "#10b981" }}>
                                {formatNaira(tx.amount)}
                              </td>
                              <td>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    background: "rgba(124, 58, 237, 0.15)",
                                    color: "#c4b5fd",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  PALMPAY
                                </span>
                              </td>
                              <td style={{ fontSize: "0.775rem", color: "#94a3b8" }}>
                                {tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-GB") : "Just now"}
                              </td>
                              <td>
                                {tx.status === "SUCCESS" && (
                                  <span className={styles.approvedBadge}>
                                    <CheckCircle2 size={12} /> Approved
                                  </span>
                                )}
                                {tx.status === "PENDING" && (
                                  <span className={styles.pendingBadge}>
                                    ● Pending Approval
                                  </span>
                                )}
                                {tx.status === "FAILED" && (
                                  <span className={styles.failedBadge}>
                                    ✕ Rejected
                                  </span>
                                )}
                              </td>
                              <td>
                                {tx.status === "PENDING" ? (
                                  <button
                                    type="button"
                                    className={styles.approveTxBtn}
                                    onClick={() =>
                                      handleApproveTransaction(tx.id, tx.reference, tx.amount, tx.userEmail)
                                    }
                                    disabled={isApprovingTxId === tx.id}
                                  >
                                    <CheckCircle2 size={14} />
                                    <span>
                                      {isApprovingTxId === tx.id ? "Approving..." : "Approve Transaction"}
                                    </span>
                                  </button>
                                ) : (
                                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Settled</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className={styles.tableMobileView}>
                      {filteredTransactions.map((tx) => (
                        <div key={tx.id} className={styles.mobileCard}>
                          <div className={styles.cardTopRow}>
                            <span style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 700, fontSize: "0.8rem" }}>
                              {tx.reference}
                            </span>
                            {tx.status === "SUCCESS" && (
                              <span className={styles.approvedBadge}>
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            )}
                            {tx.status === "PENDING" && (
                              <span className={styles.pendingBadge}>
                                ● Pending
                              </span>
                            )}
                            {tx.status === "FAILED" && (
                              <span className={styles.failedBadge}>
                                ✕ Rejected
                              </span>
                            )}
                          </div>

                          <div className={styles.cardMainInfo}>
                            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#10b981", marginBottom: "4px" }}>
                              {formatNaira(tx.amount)}
                            </div>
                            <span className={styles.customerEmail}>{tx.userEmail}</span>
                          </div>

                          <div className={styles.cardMetaRow}>
                            <div className={styles.metaBlock}>
                              <span className={styles.metaLabel}>Channel</span>
                              <span className={styles.metaValue} style={{ color: "#c4b5fd" }}>PALMPAY</span>
                            </div>
                            <div className={styles.metaBlock}>
                              <span className={styles.metaLabel}>Date</span>
                              <span className={styles.metaValue}>
                                {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-GB") : "Today"}
                              </span>
                            </div>
                          </div>

                          <div className={styles.cardActionsRow}>
                            {tx.status === "PENDING" && (
                              <button
                                type="button"
                                className={styles.approveTxBtn}
                                style={{ width: "100%", justifyContent: "center" }}
                                onClick={() =>
                                  handleApproveTransaction(tx.id, tx.reference, tx.amount, tx.userEmail)
                                }
                                disabled={isApprovingTxId === tx.id}
                              >
                                <CheckCircle2 size={14} />
                                <span>{isApprovingTxId === tx.id ? "Approving..." : "Approve Transaction"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: GLOBAL PURCHASES & ORDERS */}
            {/* ========================================================================= */}
            {activeTab === "orders" && (
              <div className={styles.adminCard}>
                <div className={styles.cardHeader}>
                  <h3>
                    <Package size={18} color="#38bdf8" />
                    All Marketplace Purchases ({orders.length})
                  </h3>
                  <span style={{ fontSize: "0.775rem", color: "#4ade80", fontWeight: 700 }}>
                    Gross Volume: {formatNaira(purchases.totalVolume)}
                  </span>
                </div>

                {/* Search & Filter Control Bar */}
                <div className={styles.controlBar}>
                  <div className={styles.searchBox}>
                    <Search size={15} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search by order ID, email, item..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className={styles.filterPillsGroup}>
                    {[
                      { id: "all", label: "All" },
                      { id: "ESCROW_ACTIVE", label: "Active Escrow" },
                      { id: "COMPLETED", label: "Completed" },
                      { id: "DISPUTED", label: "Disputed" },
                      { id: "REFUNDED", label: "Refunded" },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        className={`${styles.filterPillBtn} ${orderStatusFilter === pill.id ? styles.pillActive : ""}`}
                        onClick={() => setOrderStatusFilter(pill.id)}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div style={{ padding: "36px 20px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
                    No orders match your search or filter criteria.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className={styles.tableDesktopView}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Platform</th>
                            <th>Payment</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Admin Controls</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((o) => (
                            <tr key={o.orderId}>
                              <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#38bdf8" }}>
                                #{o.orderId}
                              </td>
                              <td>{o.customerEmail}</td>
                              <td>{o.platform}</td>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <span style={{ fontWeight: 600 }}>{o.paymentGateway}</span>
                                  {o.paymentReference && (
                                    <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontFamily: "monospace" }}>
                                      {o.paymentReference}
                                    </span>
                                  )}
                                  {o.notes && (
                                    <span style={{ fontSize: "0.68rem", color: "#94a3b8" }} title={o.notes}>
                                      {o.notes.length > 40 ? `${o.notes.slice(0, 40)}...` : o.notes}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ fontWeight: 800, color: "#ffffff" }}>
                                {formatNaira(o.totalPrice)}
                              </td>
                              <td>
                                <span className={`${styles.statusPill} ${getStatusClass(o.status)}`}>
                                  {o.status}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  {o.status === "ESCROW_ACTIVE" && (
                                    <button
                                      type="button"
                                      className={styles.actionBtnSmall}
                                      style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}
                                      onClick={() => handleForceReleaseEscrow(o.orderId)}
                                    >
                                      <CheckCircle2 size={12} />
                                      Approve
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className={`${styles.actionBtnSmall} ${styles.actionBtnDanger}`}
                                    onClick={() => handleForceRefund(o.orderId)}
                                  >
                                    Refund
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View */}
                    <div className={styles.cardsMobileView}>
                      {filteredOrders.map((o) => (
                        <div key={o.orderId} className={styles.mobileOrderCard}>
                          <div className={styles.cardTopRow}>
                            <span className={styles.orderIdBadge}>#{o.orderId}</span>
                            <span className={`${styles.statusPill} ${getStatusClass(o.status)}`}>
                              {o.status}
                            </span>
                          </div>
                          <div className={styles.cardMainInfo}>
                            <h4 className={styles.productTitle}>
                              <span style={{ color: getPlatformIcon(o.platform).color }}>
                                {getPlatformIcon(o.platform).icon}
                              </span>
                              <span>{o.productTitle}</span>
                            </h4>
                            <span className={styles.customerEmail}>{o.customerEmail}</span>
                          </div>
                          <div className={styles.cardMetaRow}>
                            <div className={styles.metaBlock}>
                              <span className={styles.metaLabel}>Amount</span>
                              <span className={styles.metaValue}>{formatNaira(o.totalPrice)}</span>
                            </div>
                            <div className={styles.metaBlock}>
                              <span className={styles.metaLabel}>Gateway</span>
                              <span className={styles.metaValue} style={{ textTransform: "uppercase" }}>
                                {o.paymentGateway}
                              </span>
                            </div>
                          </div>
                          {o.paymentReference && (
                            <div style={{ fontSize: "0.72rem", color: "#38bdf8", fontFamily: "monospace", marginTop: "4px" }}>
                              Ref: {o.paymentReference}
                            </div>
                          )}
                          {o.notes && (
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
                              {o.notes}
                            </div>
                          )}
                          <div className={styles.cardActionsRow}>
                              {o.status === "ESCROW_ACTIVE" && (
                                <button
                                  type="button"
                                  className={styles.actionBtnSmall}
                                  style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}
                                  onClick={() => handleForceReleaseEscrow(o.orderId)}
                                >
                                  <CheckCircle2 size={13} />
                                  Approve
                                </button>
                              )}
                            <button
                              type="button"
                              className={`${styles.actionBtnSmall} ${styles.actionBtnDanger}`}
                              onClick={() => handleForceRefund(o.orderId)}
                            >
                              <RotateCcw size={13} />
                              Refund
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: REGISTERED USERS, WALLETS & PURCHASES MADE */}
            {/* ========================================================================= */}
            {activeTab === "users" && (
              <div className={styles.adminCard}>
                <div className={styles.cardHeader}>
                  <h3>
                    <Users size={18} color="#c084fc" />
                    User Directory, Wallets &amp; Purchases
                  </h3>
                  <span style={{ fontSize: "0.775rem", color: "#94a3b8" }}>
                    Total Accounts: {users.length}
                  </span>
                </div>

                {/* Search Bar */}
                <div className={styles.controlBar}>
                  <div className={styles.searchBox}>
                    <Search size={15} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, role..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div style={{ padding: "36px 20px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
                    No users found matching your search.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className={styles.tableDesktopView}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>User ID</th>
                            <th>Name &amp; Email</th>
                            <th>Role</th>
                            <th>Wallet Balance</th>
                            <th>Purchases Made (Total Spent)</th>
                            <th>Orders</th>
                            <th>Join Date</th>
                            <th>Admin Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u) => (
                            <tr key={u.id}>
                              <td style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "0.75rem" }}>
                                {u.id.substring(0, 14)}...
                              </td>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <strong style={{ color: "#ffffff" }}>{u.name}</strong>
                                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{u.email}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`${styles.roleBadge} ${u.role === "admin" ? styles.roleAdmin : styles.roleUser}`}>
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: "#4ade80", fontSize: "0.95rem" }}>
                                  {formatNaira(u.balance)}
                                </strong>
                              </td>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <strong style={{ color: "#38bdf8", fontSize: "0.95rem" }}>
                                    {formatNaira(u.totalSpent || 0)}
                                  </strong>
                                  <span style={{ fontSize: "0.725rem", color: "#94a3b8" }}>
                                    {u.totalOrders} {u.totalOrders === 1 ? "purchase" : "purchases"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontWeight: 700, color: "#ffffff" }}>
                                  {u.totalOrders}
                                </span>
                              </td>
                              <td style={{ fontSize: "0.775rem", color: "#94a3b8" }}>
                                {u.createdAt}
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    type="button"
                                    className={styles.actionBtnSmall}
                                    title="Add funds to user Naira wallet"
                                    onClick={() => handleAdjustBalance(u.id, u.balance, u.email)}
                                  >
                                    <Plus size={11} />
                                    Credit ₦
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.actionBtnSmall}
                                    title="Toggle admin role"
                                    onClick={() => handleToggleRole(u.id, u.role)}
                                  >
                                    {u.role === "admin" ? "Demote" : "Make Admin"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View */}
                    <div className={styles.cardsMobileView}>
                      {filteredUsers.map((u) => (
                        <div key={u.id} className={styles.mobileUserCard}>
                          <div className={styles.cardTopRow}>
                            <div className={styles.cardMainInfo}>
                              <strong style={{ color: "#ffffff", fontSize: "0.925rem" }}>{u.name}</strong>
                              <span className={styles.customerEmail}>{u.email}</span>
                            </div>
                            <span className={`${styles.roleBadge} ${u.role === "admin" ? styles.roleAdmin : styles.roleUser}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </div>

                          <div className={styles.cardStatsGrid}>
                            <div className={styles.userStatItem}>
                              <span className={styles.statLabel}>Wallet Balance</span>
                              <span className={styles.statValue} style={{ color: "#4ade80" }}>
                                {formatNaira(u.balance)}
                              </span>
                            </div>
                            <div className={styles.userStatItem}>
                              <span className={styles.statLabel}>Total Spent</span>
                              <span className={styles.statValue} style={{ color: "#38bdf8" }}>
                                {formatNaira(u.totalSpent || 0)}
                              </span>
                            </div>
                            <div className={styles.userStatItem}>
                              <span className={styles.statLabel}>Total Orders</span>
                              <span className={styles.statValue}>{u.totalOrders}</span>
                            </div>
                            <div className={styles.userStatItem}>
                              <span className={styles.statLabel}>Joined Date</span>
                              <span className={styles.statValue} style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                {u.createdAt}
                              </span>
                            </div>
                          </div>

                          <div className={styles.cardActionsRow}>
                            <button
                              type="button"
                              className={styles.actionBtnSmall}
                              onClick={() => handleAdjustBalance(u.id, u.balance, u.email)}
                            >
                              <Plus size={12} />
                              Credit ₦
                            </button>
                            <button
                              type="button"
                              className={styles.actionBtnSmall}
                              onClick={() => handleToggleRole(u.id, u.role)}
                            >
                              {u.role === "admin" ? "Demote" : "Make Admin"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: INVENTORY PLATFORM (IFECO) BALANCE & ENGINE */}
            {/* ========================================================================= */}
            {activeTab === "vendor" && (
              <div className={styles.adminCard}>
                <div className={styles.cardHeader}>
                  <h3>
                    <Server size={18} color="#4ade80" />
                    Inventory Platform Integration &amp; Balance (Ifeco)
                  </h3>
                  <button
                    type="button"
                    className={styles.vendorSyncBtn}
                    onClick={handleRefreshVendor}
                    disabled={isSyncingVendor}
                    style={{ padding: "6px 14px", fontSize: "0.775rem" }}
                  >
                    <RefreshCw
                      size={12}
                      className={isSyncingVendor ? styles.refreshIconSpin : ""}
                    />
                    <span>{isSyncingVendor ? "Connecting..." : "Sync Live Balance"}</span>
                  </button>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Vendor Live Status Cards */}
                  <div className={styles.vendorGrid}>
                    <div className={styles.vendorCard}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
                          External Platform Balance
                        </span>
                        <span
                          className={`${styles.connectionBadge} ${
                            vendor.isLiveConnected ? styles.live : styles.simulated
                          }`}
                        >
                          {vendor.isLiveConnected ? "Live API" : "Standby / Fallback"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(1.4rem, 4vw, 1.85rem)",
                          fontWeight: 800,
                          color: "#4ade80",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {formatNaira(vendor.balance)}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        Funds available to auto-fulfill marketplace purchases instantly
                      </span>
                    </div>

                    <div className={styles.vendorCard}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
                        Inventory Provider Endpoint
                      </span>
                      <div className={styles.endpointUrl}>
                        {vendor.endpoint}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        Account: {vendor.username} ({vendor.email})
                      </span>
                    </div>
                  </div>

                  {/* Markup Multiplier Setting */}
                  <div>
                    <label
                      style={{
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        color: "#cbd5e1",
                        display: "block",
                        marginBottom: "10px",
                      }}
                    >
                      Reseller Profit Arbitrage Markup:
                    </label>
                    <div className={styles.multiplierButtonGroup}>
                      {[1.25, 1.4, 1.5, 1.75, 2.0].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={styles.actionBtnSmall}
                          style={{
                            padding: "8px 18px",
                            background: markupMultiplier === m ? "#004bef" : "rgba(255, 255, 255, 0.08)",
                            borderColor: markupMultiplier === m ? "#004bef" : "rgba(255, 255, 255, 0.15)",
                            color: "#ffffff",
                            fontWeight: 700,
                          }}
                          onClick={() => {
                            setMarkupMultiplier(m);
                            showNotification(`Markup adjusted to ${m}x (${Math.round((m - 1) * 100)}% margin)`);
                          }}
                        >
                          {m}x ({Math.round((m - 1) * 100)}% Profit)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Configuration Help Banner */}
                  <div className={styles.helpBanner}>
                    <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>How Inventory Platform Sourcing Operates:</strong>
                      <p style={{ margin: "4px 0 0", color: "#cbd5e1" }}>
                        Every time a buyer completes an order on Sterling Logs, the backend automatically debits
                        from your <strong>{formatNaira(vendor.balance)}</strong> inventory balance at vendor cost,
                        applies your <strong>{markupMultiplier}x markup</strong> in profit, and dispatches credentials
                        into the buyer&apos;s 24h Escrow Vault.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: WORKING TOOLS & TELEGRAM BOT LINKS */}
            {/* ========================================================================= */}
            {activeTab === "tools" && (
              <div className={styles.toolsTabWrapper}>
                {/* Header Card */}
                <div className={styles.toolsHeaderCard}>
                  <div className={styles.toolsHeaderLeft}>
                    <div className={styles.toolsHeaderIconBox}>
                      <img
                        src="/working-tools.png"
                        alt="Working Tools"
                        style={{ width: "30px", height: "30px", objectFit: "contain" }}
                      />
                    </div>
                    <div>
                      <h2 className={styles.toolsTitle}>Working Tools &amp; Telegram Bots</h2>
                      <p className={styles.toolsSubtitle}>
                        Upload and manage direct Telegram bot links and tools displayed under the{" "}
                        <strong>Working tools</strong> dashboard category (positioned next to Instagram).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.addToolsPrimaryBtn}
                    onClick={() => setIsAddToolOpen(true)}
                  >
                    <Plus size={16} />
                    <span>Add tools</span>
                  </button>
                </div>

                {/* Metrics stats */}
                <div className={styles.toolsMetricsRow}>
                  <div className={styles.toolMiniStat}>
                    <span className={styles.miniStatLabel}>Total Uploaded Tools</span>
                    <span className={styles.miniStatValue}>{workingTools.length}</span>
                  </div>
                  <div className={styles.toolMiniStat}>
                    <span className={styles.miniStatLabel}>Category Placement</span>
                    <span className={styles.miniStatValueHighlight}>Dashboard (Next to Instagram)</span>
                  </div>
                  <div className={styles.toolMiniStat}>
                    <span className={styles.miniStatLabel}>Delivery Type</span>
                    <span className={styles.miniStatValue}>Instant Telegram Link Access</span>
                  </div>
                </div>

                {/* Tools Grid / List */}
                {workingTools.length === 0 ? (
                  <div className={styles.toolsEmptyCard}>
                    <img
                      src="/working-tools.png"
                      alt="Working Tools"
                      style={{ width: "56px", height: "56px", objectFit: "contain", opacity: 0.8 }}
                    />
                    <h3>No Working Tools Added Yet</h3>
                    <p>Click &quot;Add tools&quot; to upload your first Telegram bot link or tool.</p>
                    <button
                      type="button"
                      className={styles.addToolsPrimaryBtn}
                      onClick={() => setIsAddToolOpen(true)}
                    >
                      <Plus size={16} />
                      <span>Add tools</span>
                    </button>
                  </div>
                ) : (
                  <div className={styles.toolsGrid}>
                    {workingTools.map((tool) => (
                      <div key={tool.id} className={styles.toolCard}>
                        <div className={styles.toolCardHeader}>
                          <div className={styles.toolCardHeaderLeft}>
                            <div className={styles.toolIconCircle}>
                              <img
                                src="/working-tools.png"
                                alt="Tool"
                                style={{ width: "24px", height: "24px", objectFit: "contain" }}
                              />
                            </div>
                            <div>
                              <h3 className={styles.toolCardName}>{tool.name}</h3>
                              <span className={styles.toolPlatformBadge}>{tool.platform}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className={styles.toolPiecesBadge}>
                              {tool.stock} pieces
                            </span>
                            <span className={styles.toolPriceTag}>
                              {tool.price > 0 ? formatNaira(tool.price) : "FREE BOT"}
                            </span>
                          </div>
                        </div>

                        <p className={styles.toolCardDesc}>{tool.description}</p>

                        <div className={styles.toolLinkBox}>
                          <span className={styles.toolLinkLabel}>Bot Link:</span>
                          <a
                            href={tool.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.toolLinkValue}
                            title={tool.link}
                          >
                            <span>{tool.link}</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>

                        {tool.tags && tool.tags.length > 0 && (
                          <div className={styles.toolTagsRow}>
                            {tool.tags.map((t) => (
                              <span key={t} className={styles.toolTagPill}>{t}</span>
                            ))}
                          </div>
                        )}

                        <div className={styles.toolCardFooter}>
                          <span className={styles.toolDate}>
                            Added {new Date(tool.createdAt).toLocaleDateString()}
                          </span>
                          <div className={styles.toolActionGroup}>
                            <a
                              href={tool.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.toolTestBtn}
                            >
                              <ExternalLink size={13} />
                              <span>Test Link</span>
                            </a>
                            <button
                              type="button"
                              className={styles.toolDeleteBtn}
                              onClick={() => handleDeleteTool(tool.id, tool.name)}
                              title="Delete this tool"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Add Tools Modal ── */}
      {isAddToolOpen && (
        <div className={styles.toolModalBackdrop} onClick={() => setIsAddToolOpen(false)}>
          <div className={styles.toolModalSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.toolModalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className={styles.toolModalHeaderIcon}>
                  <img
                    src="/working-tools.png"
                    alt="Tool"
                    style={{ width: "22px", height: "22px", objectFit: "contain" }}
                  />
                </div>
                <div>
                  <h3 className={styles.toolModalTitle}>Add Working Tool</h3>
                  <p className={styles.toolModalSubtitle}>
                    Upload Telegram bot link or tool into Working tools category
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.toolModalCloseBtn}
                onClick={() => setIsAddToolOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTool} className={styles.toolModalForm}>
              <div className={styles.toolFormGroup}>
                <label className={styles.toolFormLabel}>
                  Tool Name <span style={{ color: "#f43f5e" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telegram SMS OTP Bot"
                  value={newToolForm.name}
                  onChange={(e) => setNewToolForm({ ...newToolForm, name: e.target.value })}
                  className={styles.toolFormInput}
                />
              </div>

              <div className={styles.toolFormGroup}>
                <label className={styles.toolFormLabel}>
                  Telegram Bot Link or Tool URL <span style={{ color: "#f43f5e" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://t.me/YourBotName or @YourBotName"
                  value={newToolForm.link}
                  onChange={(e) => setNewToolForm({ ...newToolForm, link: e.target.value })}
                  className={styles.toolFormInput}
                />
                <span className={styles.toolFormHint}>
                  Enter the full link (https://t.me/...) or Telegram username starting with @
                </span>
              </div>

              <div className={styles.toolFormGroup}>
                <label className={styles.toolFormLabel}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain what the tool or Telegram bot does for users..."
                  value={newToolForm.description}
                  onChange={(e) => setNewToolForm({ ...newToolForm, description: e.target.value })}
                  className={styles.toolFormTextarea}
                />
              </div>

              <div className={styles.toolFormRow}>
                <div className={styles.toolFormGroup}>
                  <label className={styles.toolFormLabel}>
                    Price (₦) <span style={{ color: "#f43f5e" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    placeholder="e.g. 8500"
                    value={newToolForm.price}
                    onChange={(e) => setNewToolForm({ ...newToolForm, price: e.target.value })}
                    className={styles.toolFormInput}
                  />
                  <span className={styles.toolFormHint}>
                    Admin decides selling price in Naira
                  </span>
                </div>

                <div className={styles.toolFormGroup}>
                  <label className={styles.toolFormLabel}>Pieces</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Auto-assign random pieces"
                    value={newToolForm.stock}
                    onChange={(e) => setNewToolForm({ ...newToolForm, stock: e.target.value })}
                    className={styles.toolFormInput}
                  />
                  <span className={styles.toolFormHint}>
                    Leave blank to assign a random number of pieces
                  </span>
                </div>
              </div>

              <div className={styles.toolFormGroup}>
                <label className={styles.toolFormLabel}>Platform Type</label>
                <input
                  type="text"
                  value={newToolForm.platform}
                  onChange={(e) => setNewToolForm({ ...newToolForm, platform: e.target.value })}
                  className={styles.toolFormInput}
                />
              </div>

              <div className={styles.toolFormGroup}>
                <label className={styles.toolFormLabel}>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Telegram Bot, SMS OTP, Verified, Instant"
                  value={newToolForm.tags}
                  onChange={(e) => setNewToolForm({ ...newToolForm, tags: e.target.value })}
                  className={styles.toolFormInput}
                />
              </div>

              <div className={styles.toolModalFooter}>
                <button
                  type="button"
                  className={styles.toolCancelBtn}
                  onClick={() => setIsAddToolOpen(false)}
                  disabled={isSubmittingTool}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.toolSubmitBtn}
                  disabled={isSubmittingTool}
                >
                  {isSubmittingTool ? (
                    <RefreshCw size={15} className={styles.spinIcon} />
                  ) : (
                    <Plus size={15} />
                  )}
                  <span>{isSubmittingTool ? "Saving Tool..." : "Save & Upload Tool"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
