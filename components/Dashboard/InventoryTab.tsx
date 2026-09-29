"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Search,
  Zap,
  CheckCircle2,
  Lock,
  Package,
  ShieldCheck,
  Eye,
  ArrowRight,
  Wallet,
  X,
  Flame,
  Globe,
  Server,
  PhoneCall,
  Terminal,
  AlertCircle,
  Copy,
  Check,
  Mail,
  CreditCard,
} from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaFacebookF,
  FaTelegram,
  FaRedditAlien,
} from "react-icons/fa6";
import { AccountCategory, InventoryProduct, OrderResult, UserProfile } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import { fetchInventoryWithMeta, submitOrder } from "@/lib/api/client";
import styles from "./InventoryTab.module.scss";

interface InventoryTabProps {
  profile: UserProfile;
  onNavigateToWallet: () => void;
  onNavigateToVault: () => void;
  onOrderCreated?: (order: OrderResult) => void;
  onBalanceUpdate?: (newBalance: number) => void;
}

function getPlatformIcon(platform: string, category?: string) {
  const p = (platform + " " + (category || "")).toLowerCase();
  if (p.includes("proxy") || p.includes("vpn") || p.includes("socks")) {
    return { icon: <Globe size={16} />, bg: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" };
  }
  if (p.includes("rdp") || p.includes("vps") || p.includes("server")) {
    return { icon: <Server size={16} />, bg: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" };
  }
  if (p.includes("voice") || p.includes("phone") || p.includes("otp") || p.includes("number") || p.includes("text")) {
    return { icon: <PhoneCall size={16} />, bg: "rgba(16, 185, 129, 0.12)", color: "#10b981" };
  }
  if (p.includes("software") || p.includes("bot") || p.includes("dolphin") || p.includes("tool")) {
    return { icon: <Terminal size={16} />, bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" };
  }
  if (p.includes("instagram")) {
    return { icon: <FaInstagram />, bg: "rgba(225, 48, 108, 0.12)", color: "#E1306C" };
  }
  if (p.includes("twitter") || p.includes(" x")) {
    return { icon: <FaXTwitter />, bg: "rgba(15, 20, 25, 0.08)", color: "#0f1419" };
  }
  if (p.includes("tiktok")) {
    return { icon: <FaTiktok />, bg: "rgba(0, 0, 0, 0.08)", color: "#000000" };
  }
  if (p.includes("facebook") || p.includes("bm") || p.includes("fb")) {
    return { icon: <FaFacebookF />, bg: "rgba(24, 119, 242, 0.12)", color: "#1877F2" };
  }
  if (p.includes("telegram")) {
    return { icon: <FaTelegram />, bg: "rgba(34, 158, 217, 0.12)", color: "#229ED9" };
  }
  if (p.includes("reddit")) {
    return { icon: <FaRedditAlien />, bg: "rgba(255, 69, 0, 0.12)", color: "#FF4500" };
  }
  return { icon: <ShieldCheck size={16} />, bg: "rgba(0, 75, 239, 0.1)", color: "#004bef" };
}

const CATEGORIES: { id: AccountCategory; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Logs", icon: <Package size={14} /> },
  { id: "facebook", label: "Facebook", icon: <FaFacebookF size={13} /> },
  { id: "instagram", label: "Instagram", icon: <FaInstagram size={13} /> },
  { id: "twitter", label: "Twitter / X", icon: <FaXTwitter size={13} /> },
  { id: "tiktok", label: "TikTok", icon: <FaTiktok size={13} /> },
  { id: "proxies", label: "Proxies & VPN", icon: <Globe size={13} /> },
  { id: "numbers", label: "Virtual Numbers", icon: <PhoneCall size={13} /> },
  { id: "software", label: "Software & Bots", icon: <Terminal size={13} /> },
  { id: "telegram", label: "Telegram", icon: <FaTelegram size={13} /> },
  { id: "reddit", label: "Reddit", icon: <FaRedditAlien size={13} /> },
  { id: "mail", label: "Webmail", icon: <Mail size={13} /> },
  { id: "finance", label: "Cards & Banks", icon: <CreditCard size={13} /> },
  { id: "other", label: "More Logs", icon: <ShieldCheck size={13} /> },
];

export const InventoryTab: React.FC<InventoryTabProps> = ({
  profile,
  onNavigateToWallet,
  onNavigateToVault,
  onOrderCreated,
  onBalanceUpdate,
}) => {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "stock-desc">("popular");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Inspection modal
  const [inspectingProduct, setInspectingProduct] = useState<InventoryProduct | null>(null);

  // Purchasing modal
  const [purchasingProduct, setPurchasingProduct] = useState<InventoryProduct | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [purchaseSuccessOrder, setPurchaseSuccessOrder] = useState<OrderResult | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Load products from live API
  const loadInventory = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsSyncing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { products: data } = await fetchInventoryWithMeta(undefined, forceRefresh);
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.warn("Failed to load logs from API:", err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadInventory(false);
  }, []);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // In-stock toggle
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "price-asc") return a.sellingPrice - b.sellingPrice;
      if (sortBy === "price-desc") return b.sellingPrice - a.sellingPrice;
      if (sortBy === "stock-desc") return b.stock - a.stock;
      // Default: popular
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.stock - a.stock;
    });

    return list;
  }, [products, selectedCategory, inStockOnly, searchQuery, sortBy]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Handle Instant Wallet Purchase
  const handleInstantWalletBuy = async () => {
    if (!purchasingProduct) return;
    setPurchaseError(null);

    if (profile.balance < purchasingProduct.sellingPrice) {
      setPurchaseError(
        `Insufficient wallet balance. You have ${formatNaira(profile.balance)}, but this log costs ${formatNaira(
          purchasingProduct.sellingPrice
        )}.`
      );
      return;
    }

    try {
      setIsBuying(true);
      const res = await submitOrder({
        productId: purchasingProduct.id,
        quantity: 1,
        customerEmail: profile.email || "user@sterlinglogs.com",
        paymentGateway: "gtb", // Instant wallet deduction
        notes: `Purchased with Naira Wallet balance by ${profile.username}`,
      });

      // Debit local wallet
      const newBal = Math.max(0, profile.balance - purchasingProduct.sellingPrice);
      if (onBalanceUpdate) {
        onBalanceUpdate(newBal);
      }

      setPurchaseSuccessOrder(res);
      if (onOrderCreated) {
        onOrderCreated(res);
      }
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Failed to execute purchase.");
    } finally {
      setIsBuying(false);
    }
  };

  const inStockCount = products.filter((p) => p.stock > 0).length;

  return (
    <div className={styles.inventoryContainer}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h2>
            <Zap size={24} color="#004bef" />
            Logs Market
          </h2>
          <p>
            Buy real and working accounts. Once you pay from your wallet, your login details appear in your vault immediately.
          </p>
        </div>

        <button
          type="button"
          className={styles.syncBtn}
          onClick={() => loadInventory(true)}
          disabled={isSyncing}
          title="Check for new logs"
        >
          <RefreshCw size={14} className={isSyncing ? styles.spinIcon : ""} />
          <span>{isSyncing ? "Checking Logs..." : "Refresh Logs"}</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.blue}`}>
            <Package size={20} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statNumber}>{products.length}</span>
            <span className={styles.statLabel}>All Logs</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.green}`}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statNumber}>{inStockCount}</span>
            <span className={styles.statLabel}>Ready to Buy</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.purple}`}>
            <Wallet size={20} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statNumber}>{formatNaira(profile.balance)}</span>
            <span className={styles.statLabel}>Your Wallet Money</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.amber}`}>
            <ShieldCheck size={20} />
          </div>
          <div className={styles.statDetails}>
            <span className={styles.statNumber}>24 Hours</span>
            <span className={styles.statLabel}>Guarantee Protected</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Category Filters */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchSortRow}>
          <div className={styles.searchBoxWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search logs (e.g. Facebook, Instagram, USA, UK, 2FA, TikTok)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.toolsRow}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>Only Show Available Logs</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={styles.sortSelect}
            >
              <option value="popular">Most Popular</option>
              <option value="price-asc">Cheapest First</option>
              <option value="price-desc">Highest Price First</option>
              <option value="stock-desc">Most in Stock</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className={styles.categoryPills}>
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.pillBtn} ${selectedCategory === cat.id ? styles.pillActive : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={styles.pillCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className={styles.emptyCard}>
          <RefreshCw size={36} className={styles.spinIcon} color="#004bef" />
          <h3>Loading Market Logs...</h3>
          <p>Getting the latest available logs for you.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyCard}>
          <Package size={40} opacity={0.4} />
          <h3>No Logs Found</h3>
          <p>
            {searchQuery
              ? `No logs matched "${searchQuery}". Try searching for another keyword or clearing your filters.`
              : "No logs currently available in this category. Click 'Refresh Logs' to check again."}
          </p>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setInStockOnly(false);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => {
            const visuals = getPlatformIcon(product.platform, product.category);

            return (
              <div key={product.id} className={styles.productCard}>
                <div>
                  <div className={styles.cardTopRow}>
                    <div className={styles.platformPill}>
                      <div
                        className={styles.platformIconBox}
                        style={{ backgroundColor: visuals.bg, color: visuals.color }}
                      >
                        {visuals.icon}
                      </div>
                      <span className={styles.platformName}>{product.platform}</span>
                    </div>

                    {product.stock <= 0 ? (
                      <span className={`${styles.stockBadge} ${styles.outOfStock}`}>
                        Out of Stock
                      </span>
                    ) : product.isPopular ? (
                      <span className={`${styles.stockBadge} ${styles.highDemand}`}>
                        <Flame size={11} />
                        High Demand ({product.stock})
                      </span>
                    ) : (
                      <span className={`${styles.stockBadge} ${styles.inStock}`}>
                        <Zap size={11} />
                        {product.stock} in stock
                      </span>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <h4 className={styles.productTitle} title={product.title}>
                      {product.title}
                    </h4>

                    {product.tags && product.tags.length > 0 && (
                      <div className={styles.tagsRow}>
                        {product.tags.map((tag, idx) => (
                          <span key={idx} className={styles.specTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className={styles.descSnippet}>{product.description}</p>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.priceCol}>
                    <span className={styles.priceLabel}>Price</span>
                    <span className={styles.priceAmount}>
                      {formatNaira(product.sellingPrice)}
                    </span>
                  </div>

                  <div className={styles.actionBtns}>
                    <button
                      type="button"
                      className={styles.inspectBtn}
                      onClick={() => setInspectingProduct(product)}
                      title="View log details"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      className={styles.buyBtn}
                      disabled={product.stock <= 0}
                      onClick={() => {
                        setPurchaseSuccessOrder(null);
                        setPurchaseError(null);
                        setPurchasingProduct(product);
                      }}
                    >
                      <span>Buy Log</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Product Modal */}
      {inspectingProduct && (
        <div className={styles.modalBackdrop} onClick={() => setInspectingProduct(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Log Details</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setInspectingProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div>
                <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                  {inspectingProduct.title}
                </strong>
                <p style={{ margin: "6px 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
                  {inspectingProduct.description}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "0.8125rem",
                  background: "#f8fafd",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <span style={{ color: "#64748b" }}>Category:</span>{" "}
                  <strong style={{ textTransform: "capitalize" }}>{inspectingProduct.category}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Available:</span>{" "}
                  <strong>{inspectingProduct.stock} in stock</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Delivery:</span>{" "}
                  <strong>Instant to Vault</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Guarantee:</span>{" "}
                  <strong>{inspectingProduct.warrantyHours} Hours Replacement</strong>
                </div>
              </div>

              {/* What You Receive Card */}
              <div
                style={{
                  background: "#f1f5f9",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                  Login Format (What you get):
                </div>
                <code style={{ fontSize: "0.8125rem", color: "#004bef", fontWeight: 600, wordBreak: "break-all" }}>
                  {inspectingProduct.format}
                </code>
              </div>

              {/* Price & Buy Action in Inspect Modal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  marginTop: "6px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Price</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#004bef" }}>
                    {formatNaira(inspectingProduct.sellingPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.buyBtn}
                  disabled={inspectingProduct.stock <= 0}
                  onClick={() => {
                    const toBuy = inspectingProduct;
                    setInspectingProduct(null);
                    setPurchaseSuccessOrder(null);
                    setPurchaseError(null);
                    setPurchasingProduct(toBuy);
                  }}
                  style={{ padding: "10px 20px" }}
                >
                  <ArrowRight size={14} />
                  <span>Buy Log Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchasing Modal */}
      {purchasingProduct && (
        <div className={styles.modalBackdrop} onClick={() => setPurchasingProduct(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Buy Log</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setPurchasingProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {purchaseSuccessOrder ? (
                <div style={{ textAlign: "center", padding: "16px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.1)",
                      color: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>Payment Successful!</h3>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
                      Order <strong>#{purchaseSuccessOrder.orderId}</strong> is successful. Your login details,
                      password, and 2FA are ready in your vault now.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.buyBtn}
                    style={{ margin: "10px auto 0", padding: "12px 24px" }}
                    onClick={() => {
                      setPurchasingProduct(null);
                      onNavigateToVault();
                    }}
                  >
                    <Lock size={15} />
                    <span>Open Vault &amp; View Log</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.checkoutDetails}>
                    <div className={styles.checkoutRow}>
                      <span className={styles.label}>Log:</span>
                      <span className={styles.value}>{purchasingProduct.title}</span>
                    </div>
                    <div className={styles.checkoutRow}>
                      <span className={styles.label}>Platform:</span>
                      <span className={styles.value}>{purchasingProduct.platform}</span>
                    </div>
                    <div className={styles.checkoutRow}>
                      <span className={styles.label}>Price:</span>
                      <span className={styles.value} style={{ color: "#004bef", fontSize: "1.1rem" }}>
                        {formatNaira(purchasingProduct.sellingPrice)}
                      </span>
                    </div>
                    <div className={styles.checkoutRow}>
                      <span className={styles.label}>Your Wallet Money:</span>
                      <span
                        className={styles.value}
                        style={{
                          color: profile.balance >= purchasingProduct.sellingPrice ? "#10b981" : "#dc2626",
                        }}
                      >
                        {formatNaira(profile.balance)}
                      </span>
                    </div>
                  </div>

                  {purchaseError && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#b91c1c",
                        fontSize: "0.8125rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{purchaseError}</span>
                    </div>
                  )}

                  {profile.balance >= purchasingProduct.sellingPrice ? (
                    <button
                      type="button"
                      className={styles.walletPayBtn}
                      onClick={handleInstantWalletBuy}
                      disabled={isBuying}
                    >
                      <Wallet size={16} />
                      <span>
                        {isBuying
                          ? "Buying Log..."
                          : `Pay from Wallet (${formatNaira(purchasingProduct.sellingPrice)})`}
                      </span>
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>
                        Your wallet balance is small. Add money to your wallet to buy this log.
                      </p>
                      <button
                        type="button"
                        className={styles.buyBtn}
                        style={{ padding: "12px", justifyContent: "center" }}
                        onClick={() => {
                          setPurchasingProduct(null);
                          onNavigateToWallet();
                        }}
                      >
                        <Wallet size={16} />
                        <span>Add Money to Wallet</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
