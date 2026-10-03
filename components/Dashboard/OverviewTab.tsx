"use client";

import React, { useState } from "react";
import {
  Package,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Globe,
  Server,
  PhoneCall,
  Terminal,
  History,
  Plus,
  X,
  Eye,
  EyeOff,
  Mail,
  CreditCard,
  TrendingUp,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaFacebookF,
  FaTelegram,
  FaRedditAlien,
} from "react-icons/fa6";
import { OrderResult, UserProfile, AccountCategory } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import { fetchInventoryWithMeta } from "@/lib/api/client";
import { InventoryProduct } from "@/types/inventory";
import { AntiFraudNotice } from "./AntiFraudNotice";
import styles from "./OverviewTab.module.scss";

interface OverviewTabProps {
  profile: UserProfile;
  orders: OrderResult[];
  onNavigateToTab: (tab: "overview" | "inventory" | "vault" | "wallet" | "settings") => void;
}

/* ── Category definitions ── */
interface CategoryDef {
  id: AccountCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  gradient: string;
  description: string;
  shadow?: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "facebook",
    label: "Facebook Logs",
    icon: <FaFacebookF size={24} />,
    color: "#FFFFFF",
    bg: "#1877F2",
    gradient: "linear-gradient(135deg, #1877F2 0%, #0d5fc4 100%)",
    shadow: "0 6px 16px rgba(24, 119, 242, 0.35)",
    description: "Verified FB & BM accounts",
  },
  {
    id: "instagram",
    label: "Instagram Logs",
    icon: <FaInstagram size={24} />,
    color: "#FFFFFF",
    bg: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    gradient: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    shadow: "0 6px 16px rgba(225, 48, 108, 0.38)",
    description: "Real aged IG accounts",
  },
  {
    id: "working_tools",
    label: "Working tools",
    icon: (
      <img
        src="/working-tools.png"
        alt="Working tools"
        style={{ width: "36px", height: "36px", objectFit: "contain", display: "block" }}
      />
    ),
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    shadow: "0 6px 16px rgba(15, 23, 42, 0.35)",
    description: "Telegram bots & working links",
  },
  {
    id: "twitter",
    label: "Twitter / X Logs",
    icon: <FaXTwitter size={23} />,
    color: "#FFFFFF",
    bg: "#000000",
    gradient: "linear-gradient(135deg, #18181b 0%, #000000 100%)",
    shadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
    description: "Verified Twitter X accounts",
  },
  {
    id: "tiktok",
    label: "TikTok Logs",
    icon: <FaTiktok size={23} />,
    color: "#FFFFFF",
    bg: "#010101",
    gradient: "linear-gradient(135deg, #010101 0%, #161823 100%)",
    shadow: "0 6px 16px rgba(254, 44, 85, 0.28)",
    description: "Aged TikTok profiles",
  },
  {
    id: "telegram",
    label: "Telegram Logs",
    icon: <FaTelegram size={24} />,
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #24A1DE 0%, #0088cc 100%)",
    gradient: "linear-gradient(135deg, #24A1DE 0%, #0088cc 100%)",
    shadow: "0 6px 16px rgba(36, 161, 222, 0.35)",
    description: "Session-ready Telegram accounts",
  },
  {
    id: "proxies",
    label: "Proxies & VPN",
    icon: <Globe size={24} />,
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    shadow: "0 6px 16px rgba(14, 165, 233, 0.32)",
    description: "Residential & datacenter proxies",
  },
  {
    id: "numbers",
    label: "Virtual Numbers",
    icon: <PhoneCall size={24} />,
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    shadow: "0 6px 16px rgba(16, 185, 129, 0.32)",
    description: "SMS & OTP virtual numbers",
  },
  {
    id: "reddit",
    label: "Reddit Logs",
    icon: <FaRedditAlien size={24} />,
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #FF4500 0%, #e03d00 100%)",
    gradient: "linear-gradient(135deg, #FF4500 0%, #e03d00 100%)",
    shadow: "0 6px 16px rgba(255, 69, 0, 0.35)",
    description: "Aged karma Reddit accounts",
  },
  {
    id: "mail",
    label: "Webmail Logs",
    icon: <Mail size={24} />,
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    shadow: "0 6px 16px rgba(139, 92, 246, 0.32)",
    description: "Gmail, Outlook & more",
  },
  {
    id: "finance",
    label: "Cards & Banks",
    icon: <CreditCard size={24} />,
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #00d284 0%, #059669 100%)",
    gradient: "linear-gradient(135deg, #00d284 0%, #059669 100%)",
    shadow: "0 6px 16px rgba(0, 210, 132, 0.32)",
    description: "Finance logs & bank accounts",
  },
  {
    id: "other",
    label: "More Logs",
    icon: <ShieldCheck size={24} />,
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #004bef 0%, #003ecc 100%)",
    gradient: "linear-gradient(135deg, #004bef 0%, #003ecc 100%)",
    shadow: "0 6px 16px rgba(0, 75, 239, 0.32)",
    description: "RDP, VPS & other accounts",
  },
];

/* ── Helper: platform icon for order row ── */
function getOrderIcon(title: string) {
  const p = title.toLowerCase();
  if (p.includes("working_tools") || p.includes("tool") || p.includes("bot")) {
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
  }
  if (p.includes("instagram")) return { icon: <FaInstagram />, color: "#E1306C" };
  if (p.includes("twitter") || p.includes(" x")) return { icon: <FaXTwitter />, color: "#14171a" };
  if (p.includes("tiktok")) return { icon: <FaTiktok />, color: "#010101" };
  if (p.includes("facebook") || p.includes("fb") || p.includes("bm")) return { icon: <FaFacebookF />, color: "#1877F2" };
  if (p.includes("telegram")) return { icon: <FaTelegram />, color: "#229ED9" };
  if (p.includes("reddit")) return { icon: <FaRedditAlien />, color: "#FF4500" };
  if (p.includes("proxy") || p.includes("vpn")) return { icon: <Globe size={14} />, color: "#0ea5e9" };
  if (p.includes("rdp") || p.includes("vps")) return { icon: <Server size={14} />, color: "#8b5cf6" };
  if (p.includes("number") || p.includes("phone")) return { icon: <PhoneCall size={14} />, color: "#10b981" };
  if (p.includes("software")) return { icon: <Terminal size={14} />, color: "#f59e0b" };
  return { icon: <ShieldCheck size={14} />, color: "#004bef" };
}

/* ── Category Modal ── */
interface CategoryModalProps {
  category: CategoryDef;
  products: InventoryProduct[];
  loading: boolean;
  onClose: () => void;
  onBuyNow: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  products,
  loading,
  onClose,
  onBuyNow,
}) => {
  // close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modalSheet}>
        {/* Modal Header */}
        <div
          className={styles.modalHeader}
          style={{ background: category.gradient }}
        >
          <div className={styles.modalHeaderContent}>
            <div className={styles.modalCategoryIcon}>
              {category.icon}
            </div>
            <div>
              <h2 className={styles.modalTitle}>{category.label}</h2>
              <p className={styles.modalSubtitle}>{category.description}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}>
              <div className={styles.spinnerRing} />
              <span>Loading products…</span>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.modalEmpty}>
              <Package size={40} opacity={0.3} />
              <p>No products available in this category right now.</p>
              <button
                type="button"
                className={styles.modalBrowseBtn}
                onClick={onBuyNow}
              >
                Browse All Market <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              <p className={styles.modalCount}>
                {products.length} product{products.length !== 1 ? "s" : ""} available
              </p>
              <div className={styles.productList}>
                {products.map((p) => {
                  const isWorkingTool =
                    p.category === "working_tools" ||
                    p.format === "Telegram Bot Link";

                  return (
                    <div key={p.id} className={styles.productRow}>
                      <div className={styles.productRowLeft}>
                        <div
                          className={styles.productRowIcon}
                          style={{
                            background: category.bg,
                            color: category.color,
                            boxShadow: category.shadow || "none",
                          }}
                        >
                          {category.icon}
                        </div>
                        <div className={styles.productRowInfo}>
                          <span className={styles.productRowTitle}>{p.title}</span>
                          <span className={styles.productRowMeta}>
                            {isWorkingTool
                              ? p.stock > 0
                                ? `${p.stock} pieces available · 24h Escrow Protection`
                                : "0 pieces left · Restocking soon"
                              : `${p.stock > 0 ? `${p.stock} pieces` : "0 pieces left"} · ${p.warrantyHours}h warranty`}
                          </span>
                          {p.description && (
                            <p className={styles.productRowDesc}>{p.description}</p>
                          )}
                          <div className={styles.tagWrap}>
                            {isWorkingTool && (
                              <span
                                className={styles.productTag}
                                style={{ background: "rgba(34, 158, 217, 0.12)", color: "#0284c7" }}
                              >
                                🔒 Link unlocks after buy
                              </span>
                            )}
                            {p.tags.slice(0, 3).map((t) => (
                              <span key={t} className={styles.productTag}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={styles.productRowRight}>
                        <span className={styles.productPrice}>{formatNaira(p.sellingPrice)}</span>
                        <button
                          type="button"
                          className={styles.productBuyBtn}
                          onClick={onBuyNow}
                          disabled={p.stock === 0}
                        >
                          {isWorkingTool ? "Buy Tool" : "Buy"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className={styles.modalViewAllBtn}
                onClick={onBuyNow}
              >
                <ShieldCheck size={15} />
                View Full Market & Buy Now
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   OverviewTab — Main Component
   ═══════════════════════════════════════════ */
export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  orders,
  onNavigateToTab,
}) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<InventoryProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const activeEscrowOrders = orders.filter((o) => o.status === "ESCROW_ACTIVE");

  /* Load products for a category modal */
  const openCategory = async (cat: CategoryDef) => {
    setSelectedCategory(cat);
    setCategoryProducts([]);
    setLoadingProducts(true);
    try {
      const res = await fetchInventoryWithMeta(cat.id !== "other" ? cat.id : undefined);
      const all: InventoryProduct[] = res?.products ?? [];
      const filtered =
        cat.id === "other"
          ? all.filter(
              (p) =>
                ![
                  "facebook",
                  "instagram",
                  "working_tools",
                  "twitter",
                  "tiktok",
                  "telegram",
                  "proxies",
                  "numbers",
                  "reddit",
                  "mail",
                  "finance",
                ].includes(p.category)
            )
          : all;
      setCategoryProducts(filtered);
    } catch {
      setCategoryProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
  };

  const goToMarket = () => {
    closeModal();
    onNavigateToTab("inventory");
  };

  return (
    <div className={styles.overviewContainer}>

      {/* ── Balance Card ── */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceCardInner}>
          {/* Active pill */}
          <div className={styles.activePill}>
            <span className={styles.activeDot} />
            Active
          </div>

          <div className={styles.balanceSection}>
            <span className={styles.balanceLabel}>Available Balance</span>
            <div className={styles.balanceRow}>
              <span className={styles.balanceAmount}>
                {balanceVisible ? formatNaira(profile.balance) : "₦ ••••••"}
              </span>
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setBalanceVisible((v) => !v)}
                aria-label={balanceVisible ? "Hide balance" : "Show balance"}
              >
                {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={styles.balanceBtns}>
            <button
              type="button"
              id="balance-fund-btn"
              className={styles.fundBtn}
              onClick={() => onNavigateToTab("wallet")}
            >
              <Plus size={15} />
              Fund Wallet
            </button>
            <button
              type="button"
              id="balance-history-btn"
              className={styles.historyBtn}
              onClick={() => onNavigateToTab("vault")}
            >
              <History size={15} />
              History
            </button>
          </div>
        </div>

        {/* Decorative circles */}
        <div className={styles.decorCircle1} />
        <div className={styles.decorCircle2} />
      </div>

      {/* ── Escrow alert strip ── */}
      {activeEscrowOrders.length > 0 && (
        <button
          type="button"
          className={styles.escrowStrip}
          onClick={() => onNavigateToTab("vault")}
        >
          <Lock size={14} />
          <span>
            {activeEscrowOrders.length} log{activeEscrowOrders.length > 1 ? "s" : ""} under 24h guarantee — tap to view
          </span>
          <ChevronRight size={14} />
        </button>
      )}

      {/* ── Quick Stats Row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(0,75,239,0.1)", color: "#004bef" }}>
            <Package size={16} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{orders.length}</span>
            <span className={styles.statLabel}>Logs Bought</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(245,158,11,0.12)", color: "#d97706" }}>
            <Clock size={16} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{activeEscrowOrders.length}</span>
            <span className={styles.statLabel}>Under Warranty</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "rgba(0,210,132,0.12)", color: "#059669" }}>
            <Zap size={16} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>Instant Delivery</span>
          </div>
        </div>
      </div>

      {/* ── Category Grid ── */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Shop by Category</h3>
          <button
            type="button"
            className={styles.sectionAction}
            onClick={() => onNavigateToTab("inventory")}
          >
            View All <ArrowRight size={13} />
          </button>
        </div>

        <div className={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              id={`category-${cat.id}`}
              className={styles.categoryCard}
              onClick={() => openCategory(cat)}
            >
              <div
                className={styles.categoryIconBox}
                style={{
                  background: cat.bg,
                  color: cat.color,
                  boxShadow: cat.shadow || "0 4px 12px rgba(0, 0, 0, 0.12)",
                }}
              >
                {cat.icon}
              </div>
              <span className={styles.categoryLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Strict Anti-Fraud Disclaimer Notice Banner (Client Design) ── */}
      <AntiFraudNotice />

      {/* ── Recent Purchases ── */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Purchases</h3>
          {orders.length > 0 && (
            <button
              type="button"
              className={styles.sectionAction}
              onClick={() => onNavigateToTab("vault")}
            >
              View All ({orders.length}) <ArrowRight size={13} />
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyPurchases}>
            <Package size={36} opacity={0.25} />
            <p>No purchases yet. Browse the market to buy logs.</p>
            <button
              type="button"
              className={styles.emptyBrowseBtn}
              onClick={() => onNavigateToTab("inventory")}
            >
              <TrendingUp size={14} />
              Browse 180+ Logs
            </button>
          </div>
        ) : (
          <div className={styles.recentList}>
            {orders.slice(0, 4).map((order) => {
              const vis = getOrderIcon(order.productTitle);
              return (
                <button
                  key={order.orderId}
                  type="button"
                  className={styles.recentRow}
                  onClick={() => onNavigateToTab("vault")}
                >
                  <div
                    className={styles.recentIcon}
                    style={{ background: `${vis.color}18`, color: vis.color }}
                  >
                    {vis.icon}
                  </div>
                  <div className={styles.recentInfo}>
                    <span className={styles.recentTitle}>{order.productTitle}</span>
                    <span className={styles.recentMeta}>
                      #{order.orderId} · {order.deliveryItems.length} account(s)
                    </span>
                  </div>
                  <div className={styles.recentRight}>
                    <span className={styles.recentPrice}>{formatNaira(order.totalPrice)}</span>
                    <span
                      className={`${styles.recentBadge} ${
                        order.status === "ESCROW_ACTIVE"
                          ? styles.badgeEscrow
                          : styles.badgeDone
                      }`}
                    >
                      {order.status === "ESCROW_ACTIVE" ? (
                        <><Lock size={9} /> Escrow</>
                      ) : (
                        <><CheckCircle2 size={9} /> Done</>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Category Modal ── */}
      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          products={categoryProducts}
          loading={loadingProducts}
          onClose={closeModal}
          onBuyNow={goToMarket}
        />
      )}
    </div>
  );
};

export default OverviewTab;
