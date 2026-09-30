"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  AlertCircle,
  Copy,
  Check,
  Wallet,
  ChevronRight,
  Package,
} from "lucide-react";
import { InventoryProduct, OrderResult, UserProfile } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import styles from "./CategoryModal.module.scss";

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badge?: string;
  subtitle?: string;
  description?: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItem | null;
  products: InventoryProduct[];
  profile: UserProfile;
  onBuyProduct: (product: InventoryProduct) => Promise<OrderResult>;
  onFundWalletClick: () => void;
  onViewVaultClick: () => void;
  availableCategories?: CategoryItem[];
  onSelectCategory?: (category: CategoryItem) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  products,
  profile,
  onBuyProduct,
  onFundWalletClick,
  onViewVaultClick,
  availableCategories,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChip, setFilterChip] = useState<"all" | "inStock" | "under20k" | "popular">("all");
  const [inspectingItem, setInspectingItem] = useState<InventoryProduct | null>(null);
  const [purchasingItem, setPurchasingItem] = useState<InventoryProduct | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<OrderResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Reset state on open/close or category switch
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setFilterChip("all");
      setInspectingItem(null);
      setPurchasingItem(null);
      setPurchaseError(null);
      setOrderSuccess(null);
    }
  }, [isOpen, category?.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (orderSuccess) {
          setOrderSuccess(null);
        } else if (purchasingItem) {
          setPurchasingItem(null);
        } else if (inspectingItem) {
          setInspectingItem(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, orderSuccess, purchasingItem, inspectingItem, onClose]);

  // Filter products matching this category
  const categoryProducts = useMemo(() => {
    if (!category) return [];

    const catId = category.id.toLowerCase();

    return products.filter((p) => {
      const pCat = p.category.toLowerCase();
      const pPlatform = p.platform.toLowerCase();
      const pTitle = p.title.toLowerCase();

      // If category is "all" or general market
      if (catId === "all" || catId === "market") return true;

      // Match virtual number / rent number
      if (catId === "numbers" || catId === "virtual-number" || catId === "rent-number") {
        return (
          pCat === "numbers" ||
          pPlatform.includes("phone") ||
          pPlatform.includes("number") ||
          pPlatform.includes("sim") ||
          pTitle.includes("voice") ||
          pTitle.includes("number") ||
          pTitle.includes("pva") ||
          pTitle.includes("rental")
        );
      }

      // Match boost
      if (catId === "boost" || catId === "boost-account") {
        return (
          pCat === "boost" ||
          pPlatform.includes("boost") ||
          pTitle.includes("boost") ||
          pTitle.includes("followers") ||
          pTitle.includes("views")
        );
      }

      // Match buy logs (all social media accounts: IG, FB, Twitter/X, TikTok, Reddit)
      if (catId === "logs" || catId === "buy-logs") {
        return (
          pCat === "instagram" ||
          pCat === "twitter" ||
          pCat === "tiktok" ||
          pCat === "facebook" ||
          pCat === "reddit" ||
          pCat === "mail" ||
          pPlatform.includes("instagram") ||
          pPlatform.includes("twitter") ||
          pPlatform.includes("tiktok") ||
          pPlatform.includes("facebook") ||
          pPlatform.includes("reddit")
        );
      }

      // Match Telegram Premium
      if (catId === "telegram" || catId === "telegram-premium") {
        return (
          pCat === "telegram" ||
          pPlatform.includes("telegram") ||
          pTitle.includes("telegram")
        );
      }

      // Match Proxies & VPN
      if (catId === "proxies" || catId === "proxies-vpn") {
        return (
          pCat === "proxies" ||
          pPlatform.includes("proxy") ||
          pPlatform.includes("vpn") ||
          pTitle.includes("proxy")
        );
      }

      // Match RDP & Servers
      if (catId === "rdp" || catId === "rdp-servers") {
        return (
          pCat === "rdp" ||
          pPlatform.includes("rdp") ||
          pPlatform.includes("vps") ||
          pPlatform.includes("server") ||
          pTitle.includes("server")
        );
      }

      // Match Software & Bots
      if (catId === "software" || catId === "software-bots") {
        return (
          pCat === "software" ||
          pPlatform.includes("software") ||
          pPlatform.includes("bot") ||
          pPlatform.includes("tool") ||
          pTitle.includes("dolphin")
        );
      }

      // Direct category matching (instagram, twitter, tiktok, facebook, reddit, mail, etc.)
      return pCat === catId || pPlatform.includes(catId);
    });
  }, [products, category]);

  // Apply search query and filter chips
  const filteredProducts = useMemo(() => {
    let list = [...categoryProducts];

    // Filter chip
    if (filterChip === "inStock") {
      list = list.filter((p) => p.stock > 0);
    } else if (filterChip === "under20k") {
      list = list.filter((p) => p.sellingPrice <= 20000);
    } else if (filterChip === "popular") {
      list = list.filter((p) => p.isPopular);
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

    return list;
  }, [categoryProducts, filterChip, searchQuery]);

  // Copy to clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Instant Buy with wallet
  const handleExecutePurchase = async (product: InventoryProduct) => {
    setPurchaseError(null);

    if (profile.balance < product.sellingPrice) {
      setPurchaseError(
        `Insufficient balance. You have ${formatNaira(profile.balance)}, but this costs ${formatNaira(
          product.sellingPrice
        )}.`
      );
      return;
    }

    try {
      setIsBuying(true);
      const res = await onBuyProduct(product);
      setOrderSuccess(res);
      setPurchasingItem(null);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Failed to execute purchase");
    } finally {
      setIsBuying(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Success Modal View */}
        {orderSuccess ? (
          <div className={styles.successOverlay}>
            <div className={styles.successIconCircle}>
              <CheckCircle2 size={38} />
            </div>
            <h3 className={styles.successTitle}>Order Completed Successfully!</h3>
            <p className={styles.successDesc}>
              Your purchase of <strong>{orderSuccess.productTitle}</strong> (Order #{orderSuccess.orderId})
              has been processed. Your login details and 2FA credentials are ready in your Vault!
            </p>

            {/* Delivered Items Preview */}
            {orderSuccess.deliveryItems && orderSuccess.deliveryItems.length > 0 && (
              <div className={styles.credentialsSnippetBox}>
                <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: "4px" }}>
                  Delivery Credentials:
                </div>
                {orderSuccess.deliveryItems.map((item, idx) => (
                  <div key={item.id || idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div className={styles.credRow}>
                      <span>Username / Phone:</span>
                      <strong>{item.username || "Standard User"}</strong>
                    </div>
                    {item.credentials && (
                      <div className={styles.credRow}>
                        <span>Credentials:</span>
                        <code style={{ color: "#4ade80" }}>{item.credentials}</code>
                        <button
                          type="button"
                          className={styles.copyCredBtn}
                          onClick={() => handleCopy(item.credentials || "", `cred-${idx}`)}
                        >
                          {copiedKey === `cred-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedKey === `cred-${idx}` ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                    {item.twoFactorSecret && (
                      <div className={styles.credRow}>
                        <span>2FA Secret:</span>
                        <code style={{ color: "#fbbf24" }}>{item.twoFactorSecret}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                type="button"
                className={styles.buyBtn}
                style={{ padding: "12px 24px" }}
                onClick={() => {
                  setOrderSuccess(null);
                  onClose();
                  onViewVaultClick();
                }}
              >
                <Lock size={16} />
                <span>Open Vault &amp; View All Logs</span>
              </button>
              <button
                type="button"
                className={styles.inspectBtn}
                style={{ padding: "12px 20px" }}
                onClick={() => setOrderSuccess(null)}
              >
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <div
                  className={styles.categoryIconBadge}
                  style={{ background: category.iconBg, color: category.iconColor }}
                >
                  {category.icon}
                </div>
                <div className={styles.headerTitles}>
                  <h3 className={styles.categoryTitle}>
                    {category.label}
                    <span className={styles.itemCountBadge}>
                      <Zap size={11} />
                      {filteredProducts.length} Items Available
                    </span>
                  </h3>
                  <p className={styles.categorySubtitle}>
                    {category.description || category.subtitle || "Real, verified and 100% working goods with 24h guarantee."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className={styles.filterBar}>
              <div className={styles.searchBox}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder={`Search in ${category.label}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className={styles.filterChipsRow}>
                <button
                  type="button"
                  className={`${styles.chipBtn} ${filterChip === "all" ? styles.chipActive : ""}`}
                  onClick={() => setFilterChip("all")}
                >
                  All Items ({categoryProducts.length})
                </button>
                <button
                  type="button"
                  className={`${styles.chipBtn} ${filterChip === "inStock" ? styles.chipActive : ""}`}
                  onClick={() => setFilterChip("inStock")}
                >
                  In Stock Only
                </button>
                <button
                  type="button"
                  className={`${styles.chipBtn} ${filterChip === "under20k" ? styles.chipActive : ""}`}
                  onClick={() => setFilterChip("under20k")}
                >
                  Under ₦20,000
                </button>
                <button
                  type="button"
                  className={`${styles.chipBtn} ${filterChip === "popular" ? styles.chipActive : ""}`}
                  onClick={() => setFilterChip("popular")}
                >
                  Popular / Best Sellers
                </button>

                {availableCategories && availableCategories.length > 0 && onSelectCategory && (
                  <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                    {availableCategories
                      .filter((c) => c.id !== category.id)
                      .slice(0, 3)
                      .map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={styles.chipBtn}
                          onClick={() => onSelectCategory(c)}
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <span style={{ fontSize: "0.75rem" }}>{c.label}</span>
                          <ChevronRight size={12} />
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Products List */}
            <div className={styles.modalBody}>
              {filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Package size={28} />
                  </div>
                  <h4>No items found</h4>
                  <p>
                    {searchQuery
                      ? `No products in ${category.label} match "${searchQuery}". Try a different keyword.`
                      : `Currently updating inventory for ${category.label}. Check back shortly!`}
                  </p>
                  {(searchQuery || filterChip !== "all") && (
                    <button
                      type="button"
                      className={styles.resetBtn}
                      onClick={() => {
                        setSearchQuery("");
                        setFilterChip("all");
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.stock > 0 && product.stock <= 5;
                  const isOut = product.stock <= 0;

                  return (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.cardTopRow}>
                        <div className={styles.cardPlatformInfo}>
                          <div
                            className={styles.platformIconBox}
                            style={{ background: category.iconBg, color: category.iconColor }}
                          >
                            {category.icon}
                          </div>
                          <div className={styles.cardTitleBlock}>
                            <h4 className={styles.cardTitle}>{product.title}</h4>
                            <div className={styles.cardMetaRow}>
                              <span>{product.platform}</span>
                              <span className={styles.metaDot} />
                              <span>{product.year}</span>
                              {product.followers && (
                                <>
                                  <span className={styles.metaDot} />
                                  <span>{product.followers}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardBadges}>
                          <span
                            className={`${styles.stockBadge} ${
                              isOut ? styles.outOfStock : isLow ? styles.lowStock : styles.inStock
                            }`}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: isOut ? "#dc2626" : isLow ? "#d97706" : "#059669",
                              }}
                            />
                            {isOut ? "Out of Stock" : `${product.stock} in stock`}
                          </span>

                          <span className={styles.warrantyBadge}>
                            <ShieldCheck size={12} />
                            {product.warrantyHours}h Escrow
                          </span>
                        </div>
                      </div>

                      {product.description && (
                        <p className={styles.cardDescription}>{product.description}</p>
                      )}

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className={styles.tagsRow}>
                          {product.tags.map((tag, i) => (
                            <span key={i} className={styles.tagPill}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Format hint */}
                      {product.format && (
                        <div className={styles.formatBox}>
                          <span>Format:</span>
                          <code>{product.format}</code>
                        </div>
                      )}

                      {/* Bottom row: Price and action buttons */}
                      <div className={styles.cardBottomRow}>
                        <div className={styles.priceBlock}>
                          <span className={styles.priceLabel}>Instant Price</span>
                          <span className={styles.priceValue}>{formatNaira(product.sellingPrice)}</span>
                        </div>

                        <div className={styles.cardActionButtons}>
                          <button
                            type="button"
                            className={styles.inspectBtn}
                            onClick={() => {
                              setPurchasingItem(null);
                              setInspectingItem(inspectingItem?.id === product.id ? null : product);
                            }}
                          >
                            <Eye size={14} />
                            <span>{inspectingItem?.id === product.id ? "Hide Specs" : "Details"}</span>
                          </button>

                          <button
                            type="button"
                            className={styles.buyBtn}
                            disabled={product.stock <= 0}
                            onClick={() => {
                              setInspectingItem(null);
                              setPurchaseError(null);
                              setPurchasingItem(product);
                            }}
                          >
                            <Zap size={14} />
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Inspect Sheet inside Card */}
                      {inspectingItem?.id === product.id && (
                        <div className={styles.inspectSheet}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: "0.875rem", color: "#0f172a" }}>
                              Technical Audit &amp; Verification Specs
                            </strong>
                            <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
                              ● Verified Safe
                            </span>
                          </div>

                          <div
                            style={{
                              background: "#0b132b",
                              color: "#38bdf8",
                              padding: "12px",
                              borderRadius: "8px",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              whiteSpace: "pre-wrap",
                              overflowX: "auto",
                            }}
                          >
                            {product.verificationSnippet || JSON.stringify(product, null, 2)}
                          </div>
                        </div>
                      )}

                      {/* Purchasing Confirmation Box inside Card */}
                      {purchasingItem?.id === product.id && (
                        <div className={styles.buyConfirmSheet}>
                          <div className={styles.confirmRow}>
                            <span className={styles.label}>Product:</span>
                            <span className={styles.val}>{product.title}</span>
                          </div>
                          <div className={styles.confirmRow}>
                            <span className={styles.label}>Price:</span>
                            <span className={styles.val} style={{ color: "#004bef" }}>
                              {formatNaira(product.sellingPrice)}
                            </span>
                          </div>
                          <div className={styles.confirmRow}>
                            <span className={styles.label}>Your Naira Balance:</span>
                            <span
                              className={styles.val}
                              style={{
                                color: profile.balance >= product.sellingPrice ? "#059669" : "#dc2626",
                              }}
                            >
                              {formatNaira(profile.balance)}
                            </span>
                          </div>

                          {purchaseError && (
                            <div className={styles.insufficientAlert}>
                              <AlertCircle size={16} style={{ flexShrink: 0 }} />
                              <span>{purchaseError}</span>
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                            {profile.balance >= product.sellingPrice ? (
                              <button
                                type="button"
                                className={styles.buyBtn}
                                style={{ flex: 1, padding: "11px" }}
                                onClick={() => handleExecutePurchase(product)}
                                disabled={isBuying}
                              >
                                <Wallet size={16} />
                                <span>{isBuying ? "Processing Purchase..." : "Confirm & Pay from Wallet"}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className={styles.buyBtn}
                                style={{ flex: 1, padding: "11px", background: "#059669" }}
                                onClick={() => {
                                  onClose();
                                  onFundWalletClick();
                                }}
                              >
                                <Wallet size={16} />
                                <span>+ Add Money to Wallet ({formatNaira(product.sellingPrice - profile.balance)} needed)</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className={styles.inspectBtn}
                              onClick={() => setPurchasingItem(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
