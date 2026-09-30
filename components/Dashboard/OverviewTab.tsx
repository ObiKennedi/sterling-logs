"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PhoneCall,
  PhoneForwarded,
  Rocket,
  ShoppingBag,
  BarChart3,
  Star,
  Clock,
  Globe,
  Server,
  Terminal,
  Mail,
  Plus,
  Eye,
  EyeOff,
  Bell,
  ShieldCheck,
  ChevronRight,
  Home,
  Receipt,
  Gift,
  User,
  Zap,
} from "lucide-react";
import {
  FaTelegram,
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaFacebookF,
  FaRedditAlien,
} from "react-icons/fa6";
import { InventoryProduct, OrderResult, UserProfile } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import { fetchInventoryWithMeta, submitOrder } from "@/lib/api/client";
import { CategoryModal, CategoryItem } from "./CategoryModal";
import { FundWalletModal } from "./FundWalletModal";
import { OrderHistoryModal } from "./OrderHistoryModal";
import { NotificationsModal } from "./NotificationsModal";
import styles from "./OverviewTab.module.scss";

interface OverviewTabProps {
  profile: UserProfile;
  orders: OrderResult[];
  onNavigateToTab: (tab: "overview" | "inventory" | "vault" | "wallet" | "settings") => void;
  onFundWallet?: (amount: number, gateway: "gtb" | "paypoint") => Promise<void>;
  onOrderCreated?: (order: OrderResult) => void;
  onBalanceUpdate?: (newBalance: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  orders,
  onNavigateToTab,
  onFundWallet,
  onOrderCreated,
  onBalanceUpdate,
}) => {
  // Balance visibility toggle
  const [showBalance, setShowBalance] = useState<boolean>(true);

  // Products loaded from live inventory API
  const [products, setProducts] = useState<InventoryProduct[]>([]);

  // Modals state
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [isFundWalletOpen, setIsFundWalletOpen] = useState<boolean>(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Load products on mount
  useEffect(() => {
    async function loadAllProducts() {
      try {
        const { products: data } = await fetchInventoryWithMeta(undefined, false);
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("Could not fetch inventory in OverviewTab:", err);
      }
    }
    loadAllProducts();
  }, []);

  // Time-based greeting
  const greetingInfo = useMemo(() => {
    const hour = new Date().getHours();
    let text = "Good Morning";
    let icon = "☀️";
    if (hour >= 12 && hour < 17) {
      text = "Good Afternoon";
      icon = "🌤️";
    } else if (hour >= 17) {
      text = "Good Evening";
      icon = "🌙";
    }
    const name = profile.username && profile.username !== "User" ? profile.username : "Obi";
    return { greeting: `${text}, ${name} ${icon}`, name };
  }, [profile.username]);

  // Primary 8 Category Action Cards matching the screenshot
  const PRIMARY_CATEGORIES: CategoryItem[] = useMemo(
    () => [
      {
        id: "virtual-number",
        label: "Virtual Number",
        subtitle: "Google Voice & OTP",
        icon: <PhoneCall size={22} />,
        iconBg: "#e0f2fe",
        iconColor: "#0284c7",
        description: "Permanent and one-time virtual numbers for WhatsApp, Telegram, Google Voice, and SMS verifications.",
      },
      {
        id: "boost-account",
        label: "Boost Account",
        subtitle: "Followers & Likes",
        icon: <Rocket size={22} />,
        iconBg: "#f3e8ff",
        iconColor: "#9333ea",
        description: "Viral boost packages for Instagram, TikTok, Twitter/X, and Telegram with 0% drop guarantee.",
      },
      {
        id: "buy-logs",
        label: "Buy Logs",
        subtitle: "Social & Aged Profiles",
        icon: <ShoppingBag size={22} />,
        iconBg: "#d1fae5",
        iconColor: "#059669",
        description: "Aged social media accounts (Instagram, Facebook BM, Twitter/X, TikTok, Reddit) with session cookies & 2FA.",
      },
      {
        id: "rent-number",
        label: "Rent Number",
        subtitle: "7 & 30-Day Lines",
        icon: <PhoneForwarded size={22} />,
        iconBg: "#ffedd5",
        iconColor: "#ea580c",
        description: "Dedicated real physical SIM cards leased for 7 or 30 days for continuous SMS and 2FA.",
      },
      {
        id: "telegram-premium",
        label: "Telegram Premium",
        subtitle: "Gifts & Stars",
        badge: "NEW",
        icon: <FaTelegram size={22} />,
        iconBg: "#e0f2fe",
        iconColor: "#0284c7",
        description: "Official 3, 6, and 12-month Telegram Premium gift links and Telegram Stars packages.",
      },
      {
        id: "number-orders",
        label: "Number Orders",
        subtitle: "Track Numbers",
        icon: <BarChart3 size={22} />,
        iconBg: "#e0e7ff",
        iconColor: "#4f46e5",
        description: "View and manage all your purchased virtual numbers and active OTP SMS portals.",
      },
      {
        id: "boost-orders",
        label: "Boost Orders",
        subtitle: "Campaign Status",
        icon: <Star size={22} />,
        iconBg: "#f3e8ff",
        iconColor: "#9333ea",
        description: "Check progress, live speed, and delivery reports for your social media growth campaigns.",
      },
      {
        id: "log-history",
        label: "Log History",
        subtitle: "Vault Credentials",
        icon: <Clock size={22} />,
        iconBg: "#f1f5f9",
        iconColor: "#475569",
        description: "Quick access to your bought accounts, session cookies, passwords, and 2FA secrets.",
      },
    ],
    []
  );

  // Secondary Social & Digital Category Shortcuts
  const SECONDARY_CATEGORIES: CategoryItem[] = useMemo(
    () => [
      {
        id: "proxies",
        label: "Proxies & VPN",
        subtitle: "Static US Residential",
        icon: <Globe size={16} />,
        iconBg: "#ccfbf1",
        iconColor: "#0d9488",
        description: "Clean AT&T static residential proxies with zero fraud score for unbannable operations.",
      },
      {
        id: "rdp",
        label: "RDP & VPS Servers",
        subtitle: "16GB RAM Windows",
        icon: <Server size={16} />,
        iconBg: "#e0e7ff",
        iconColor: "#4f46e5",
        description: "High-speed Windows Server 2022 VPS with full admin access and unmetered 1Gbps bandwidth.",
      },
      {
        id: "software",
        label: "Software & Bots",
        subtitle: "Dolphin{anty} & Tools",
        icon: <Terminal size={16} />,
        iconBg: "#fef3c7",
        iconColor: "#d97706",
        description: "Anti-detect browser profiles, multi-account managers, and automation tools.",
      },
      {
        id: "instagram",
        label: "Instagram",
        subtitle: "Aged PVA Profiles",
        icon: <FaInstagram size={15} />,
        iconBg: "#fce7f3",
        iconColor: "#e1306c",
        description: "2018-2022 aged Instagram accounts with cookies, 2FA keys, and original email (OGE).",
      },
      {
        id: "twitter",
        label: "Twitter / X",
        subtitle: "High-Trust PVA",
        icon: <FaXTwitter size={14} />,
        iconBg: "#f1f5f9",
        iconColor: "#0f1419",
        description: "Aged Twitter / X profiles with auth tokens, phone verification, and zero strikes.",
      },
      {
        id: "tiktok",
        label: "TikTok",
        subtitle: "Live & Creator Ready",
        icon: <FaTiktok size={14} />,
        iconBg: "#f1f5f9",
        iconColor: "#000000",
        description: "Pre-warmed TikTok accounts with Live Studio unlocked and US creator fund eligibility.",
      },
      {
        id: "facebook",
        label: "Facebook BM",
        subtitle: "High Limit BMs",
        icon: <FaFacebookF size={14} />,
        iconBg: "#dbeafe",
        iconColor: "#1877f2",
        description: "Facebook profiles tied to high-spend advertising Business Managers with 2FA active.",
      },
      {
        id: "reddit",
        label: "Reddit",
        subtitle: "High Karma Accounts",
        icon: <FaRedditAlien size={15} />,
        iconBg: "#ffedd5",
        iconColor: "#ff4500",
        description: "Veteran Reddit accounts with high post & comment karma and no shadowbans.",
      },
      {
        id: "mail",
        label: "Webmail & Leads",
        subtitle: "Aged Gmail PVA",
        icon: <Mail size={15} />,
        iconBg: "#fef9c3",
        iconColor: "#ca8a04",
        description: "2019-2021 aged Gmail, Outlook, and Yahoo accounts with recovery email linked.",
      },
    ],
    []
  );

  // All categories combined for modal switcher
  const ALL_MODAL_CATEGORIES = useMemo(
    () => [...PRIMARY_CATEGORIES.slice(0, 5), ...SECONDARY_CATEGORIES],
    [PRIMARY_CATEGORIES, SECONDARY_CATEGORIES]
  );

  // Handle clicking a card
  const handleCardClick = (cat: CategoryItem) => {
    // If it's an order history shortcut
    if (cat.id === "number-orders" || cat.id === "boost-orders" || cat.id === "log-history") {
      setIsOrderHistoryOpen(true);
      return;
    }

    // Otherwise, open the pop-up modal with everything in that category!
    setSelectedCategory(cat);
  };

  // Handle executing a purchase from the category modal
  const handleBuyProduct = async (product: InventoryProduct): Promise<OrderResult> => {
    const res = await submitOrder({
      productId: product.id,
      quantity: 1,
      customerEmail: profile.email || "user@sterlinglogs.com",
      paymentGateway: "gtb",
      notes: `Bought from ${product.category} category by ${profile.username}`,
    });

    // Debit local wallet balance
    const newBal = Math.max(0, profile.balance - product.sellingPrice);
    if (onBalanceUpdate) {
      onBalanceUpdate(newBal);
    }

    // Add order to orders list
    if (onOrderCreated) {
      onOrderCreated(res);
    }

    return res;
  };

  // Default fallback for funding wallet if not passed
  const handleExecuteFund = async (amount: number, gateway: "gtb" | "paypoint") => {
    if (onFundWallet) {
      await onFundWallet(amount, gateway);
    } else if (onBalanceUpdate) {
      onBalanceUpdate(profile.balance + amount);
    }
  };

  const recentOrders = orders.slice(0, 4);

  return (
    <div className={styles.dashboardWrapper}>
      {/* 1. Header Bar: Avatar Circle, User Greeting, and Bell Icon */}
      <header className={styles.headerBar}>
        <div className={styles.userGreetingBlock}>
          <div className={styles.avatarCircle}>
            {greetingInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.greetingText}>
            <h2 className={styles.greetingTitle}>{greetingInfo.greeting}</h2>
            <p className={styles.greetingSubtitle}>Your Sterling Dashboard</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.notificationBellBtn}
          onClick={() => setIsNotificationsOpen(true)}
          title="View Alerts & Notifications"
          aria-label="Alerts"
        >
          <Bell size={20} />
          <span className={styles.bellDot} />
        </button>
      </header>

      {/* 2. Available Balance Hero Card (Deep Navy Gradient with Concentric Rings) */}
      <div className={styles.balanceCard}>
        <div className={styles.cardBgOverlay} />

        {/* Decorative concentric arcs SVG */}
        <svg
          className={styles.cardArcsSvg}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="40" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="70" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="100" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="100" cy="100" r="130" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        </svg>

        {/* Top Row: Label & Active Badge */}
        <div className={styles.balanceTopRow}>
          <span className={styles.balanceHeaderLabel}>Available Balance</span>
          <div className={styles.activeStatusBadge}>
            <span className={styles.greenDot} />
            <span>Active</span>
          </div>
        </div>

        {/* Middle Row: Large Naira Balance & Show/Hide Eye Toggle */}
        <div className={styles.balanceMiddleRow}>
          <div className={styles.balanceAmount}>
            {showBalance ? formatNaira(profile.balance) : "₦ ••••••"}
          </div>
          <button
            type="button"
            className={styles.eyeToggleBtn}
            onClick={() => setShowBalance(!showBalance)}
            title={showBalance ? "Hide Balance" : "Show Balance"}
            aria-label="Toggle Balance Visibility"
          >
            {showBalance ? <Eye size={17} /> : <EyeOff size={17} />}
          </button>
        </div>

        {/* Bottom Row: + Fund Wallet & History buttons */}
        <div className={styles.balanceActionRow}>
          <button
            type="button"
            className={styles.fundWalletBtn}
            onClick={() => setIsFundWalletOpen(true)}
          >
            <Plus size={16} strokeWidth={2.6} />
            <span>Fund Wallet</span>
          </button>

          <button
            type="button"
            className={styles.historyBtn}
            onClick={() => setIsOrderHistoryOpen(true)}
          >
            <Clock size={16} />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* 3. Section Title: QUICK ACTIONS */}
      <div className={styles.sectionHeaderRow}>
        <h3 className={styles.sectionHeaderTitle}>Quick Actions</h3>
        <button
          type="button"
          className={styles.viewAllLink}
          onClick={() => {
            setSelectedCategory({
              id: "all",
              label: "All Goods & Services",
              subtitle: "Full Inventory Catalog",
              icon: <Zap size={22} />,
              iconBg: "#dbeafe",
              iconColor: "#004bef",
              description: "Browse all available accounts, numbers, proxies, bots, and services.",
            });
          }}
        >
          <span>View all goods</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 4. Primary 4x2 Categories Grid matching the reference screenshot */}
      <div className={styles.categoriesGrid}>
        {PRIMARY_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={styles.categoryCard}
            onClick={() => handleCardClick(cat)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(cat);
              }
            }}
          >
            {cat.badge && <span className={styles.newBadge}>{cat.badge}</span>}

            <div
              className={styles.cardIconBox}
              style={{ background: cat.iconBg, color: cat.iconColor }}
            >
              {cat.icon}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <h4 className={styles.cardLabel}>{cat.label}</h4>
              <span className={styles.cardSubtitle}>{cat.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Categories Strip (Proxies, RDP, Software, IG, FB, X, TikTok, Reddit) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
        <span style={{ fontSize: "0.725rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8" }}>
          Social Accounts &amp; Digital Tools
        </span>
        <div className={styles.socialCategoriesBar}>
          {SECONDARY_CATEGORIES.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={styles.socialPill}
              onClick={() => handleCardClick(sec)}
            >
              <span style={{ color: sec.iconColor, display: "flex", alignItems: "center" }}>
                {sec.icon}
              </span>
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Section: RECENT ACTIVITY */}
      <div className={styles.recentActivityBlock}>
        <div className={styles.sectionHeaderRow}>
          <h3 className={styles.sectionHeaderTitle}>Recent Activity</h3>
          <button
            type="button"
            className={styles.viewAllLink}
            onClick={() => setIsOrderHistoryOpen(true)}
          >
            <span>View all</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className={styles.emptyActivityCard}>
            <Clock size={28} color="#94a3b8" />
            <p>No recent orders yet. Click any category above to buy your first account or virtual number.</p>
          </div>
        ) : (
          <div className={styles.activityList}>
            {recentOrders.map((order) => (
              <div
                key={order.orderId}
                className={styles.activityCard}
                onClick={() => setIsOrderHistoryOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.activityLeft}>
                  <div className={styles.activityIcon}>
                    <ShieldCheck size={20} />
                  </div>
                  <div className={styles.activityInfo}>
                    <h4>{order.productTitle}</h4>
                    <span>
                      Order #{order.orderId} • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={styles.activityRight}>
                  <span className={styles.activityPrice}>{formatNaira(order.totalPrice)}</span>
                  <span className={styles.escrowBadge}>
                    <ShieldCheck size={11} />
                    {order.status === "ESCROW_ACTIVE" ? "24h Escrow" : "Completed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Fixed Bottom Navigation Bar matching the screenshot */}
      <nav className={styles.bottomNavFixed} aria-label="Bottom Navigation">
        <div className={styles.bottomNavInner}>
          <button
            type="button"
            className={`${styles.bottomNavItem} ${styles.bottomNavActive}`}
            onClick={() => onNavigateToTab("overview")}
          >
            <Home size={20} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={styles.bottomNavItem}
            onClick={() => setIsOrderHistoryOpen(true)}
          >
            <Receipt size={20} />
            <span>History</span>
          </button>

          <button
            type="button"
            className={styles.bottomNavItem}
            onClick={() => setIsFundWalletOpen(true)}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#004bef",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0, 75, 239, 0.35)",
              }}
            >
              <Plus size={18} strokeWidth={2.8} />
            </div>
            <span>Fund</span>
          </button>

          <button
            type="button"
            className={styles.bottomNavItem}
            onClick={() => onNavigateToTab("inventory")}
          >
            <Gift size={20} />
            <span>Reward</span>
          </button>

          <button
            type="button"
            className={styles.bottomNavItem}
            onClick={() => setIsNotificationsOpen(true)}
          >
            <Bell size={20} />
            <span>Alerts</span>
          </button>

          <button
            type="button"
            className={styles.bottomNavItem}
            onClick={() => onNavigateToTab("settings")}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* 7. POP-UP MODAL WITH EVERYTHING IN THE SELECTED CATEGORY (User's Core Requirement) */}
      <CategoryModal
        isOpen={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        products={products}
        profile={profile}
        onBuyProduct={handleBuyProduct}
        onFundWalletClick={() => setIsFundWalletOpen(true)}
        onViewVaultClick={() => onNavigateToTab("vault")}
        availableCategories={ALL_MODAL_CATEGORIES}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* 8. Quick Fund Wallet Modal */}
      <FundWalletModal
        isOpen={isFundWalletOpen}
        onClose={() => setIsFundWalletOpen(false)}
        balance={profile.balance}
        onFundWallet={handleExecuteFund}
      />

      {/* 9. Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={orders}
        onNavigateToVault={() => onNavigateToTab("vault")}
      />

      {/* 10. Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        balance={profile.balance}
        orderCount={orders.length}
      />
    </div>
  );
};
