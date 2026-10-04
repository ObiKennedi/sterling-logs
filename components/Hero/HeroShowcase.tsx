"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  Zap,
  Flame,
  ArrowRight,
  X,
  Copy,
  Check,
  Layers,
  Mail,
  Download,
  CreditCard,
  Globe,
  PhoneCall,
  Terminal,
} from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaFacebookF,
  FaRedditAlien,
  FaTelegram,
} from "react-icons/fa6";
import {
  InventoryProduct,
  AccountCategory,
  OrderResult,
  PaymentGateway,
} from "@/types/inventory";
import { fetchInventoryWithMeta, submitOrder, initiateCheckout } from "@/lib/api/client";
import { formatNaira } from "@/lib/utils/format";
import { PaymentInitiationResult } from "@/lib/services/payment";
import styles from "./HeroShowcase.module.scss";

/**
 * Fallback initial items in Nigerian Naira (₦ NGN)
 */
const INITIAL_PRODUCTS: InventoryProduct[] = [
  {
    id: "ig-2018-pva",
    title: "2018 Aged PVA Profile",
    category: "instagram",
    itemType: "log",
    platform: "Instagram",
    year: "2018",
    followers: "14.8k Organic",
    tags: ["Original Email (OGE)", "Cookies .JSON", "2FA Backup Keys", "Clean Bio"],
    originalPrice: 18000,
    sellingPrice: 27000,
    currency: "₦",
    stock: 8,
    isPopular: true,
    format: "SESSION_COOKIE_NETSCAPE + 2FA",
    warrantyHours: 24,
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        created_year: 2018,
        auth_type: "SESSION_COOKIE_NETSCAPE",
        sessionid: "5892182049%3ANb87xY...",
        csrftoken: "fK992xJk28a...",
        email_domain: "proton.me (OGE)",
        follower_audit: "92% Tier 1 (US/UK)",
      },
      null,
      2
    ),
  },
  {
    id: "proxy-us-res-10gb",
    title: "10GB Clean US Static Residential Proxy",
    category: "proxies",
    itemType: "proxy",
    platform: "Residential Proxy",
    year: "30-Day",
    followers: "Static US AT&T IP",
    tags: ["SOCKS5 & HTTP(S)", "Zero Fraud Score", "AT&T Residential ISP", "Unlimited Threads"],
    originalPrice: 12000,
    sellingPrice: 18000,
    currency: "₦",
    stock: 25,
    isPopular: true,
    format: "HOST:PORT:USER:PASS",
    warrantyHours: 72,
    description:
      "Dedicated clean static US residential proxy from AT&T ISP. Zero fraud score for unbannable session logins, Facebook Ads manager, and automated web operations.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        proxy_type: "STATIC_RESIDENTIAL_ISP",
        carrier: "AT&T Internet Services",
        country: "US (Virginia)",
        protocols: ["HTTP", "HTTPS", "SOCKS5"],
        fraud_score: "0 (Clean)",
      },
      null,
      2
    ),
  },
  {
    id: "x-2017-pva",
    title: "2017 High-Trust PVA Account",
    category: "twitter",
    itemType: "log",
    platform: "Twitter / X",
    year: "2017",
    followers: "8.4k Followers",
    tags: ["Auth Token Included", "Phone Verified", "OGE Access", "Zero Strikes"],
    originalPrice: 16000,
    sellingPrice: 24000,
    currency: "₦",
    stock: 12,
    isPopular: false,
    format: "AUTH_TOKEN + CT0",
    warrantyHours: 24,
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        created_year: 2017,
        auth_token: "a190b2308f92194389ff70...",
        ct0: "0c9d78e34a21...",
        phone_verified: true,
      },
      null,
      2
    ),
  },
  {
    id: "gv-usa-permanent-pva",
    title: "Google Voice Permanent +1 USA Number",
    category: "numbers",
    itemType: "number",
    platform: "Virtual Phone / GV",
    year: "Permanent",
    followers: "Permanent +1 USA",
    tags: ["Instant SMS & Call OTP", "Recovery Email Included", "PVA Verified", "Zero Monthly Fee"],
    originalPrice: 9000,
    sellingPrice: 13500,
    currency: "₦",
    stock: 30,
    isPopular: false,
    format: "GMAIL:PASS:RECOVERY:PHONE",
    warrantyHours: 24,
    description:
      "Permanent USA Google Voice virtual phone number. Perfect for WhatsApp, Telegram, PayPal, Tinder, and bank OTP SMS verifications with instant code reception.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        line_type: "VOIP_PVA_US",
        carrier: "Google Voice Bandwidth.com",
        sms_enabled: true,
        voice_calls: true,
      },
      null,
      2
    ),
  },
  {
    id: "fb-2019-bm",
    title: "2019 Aged BM + High Limit",
    category: "facebook",
    itemType: "log",
    platform: "Facebook Meta",
    year: "2019",
    followers: "Verified Profile",
    tags: ["$250/Day Spend Limit", "2FA Active", "Warm Activity", "Pixel Ready"],
    originalPrice: 28000,
    sellingPrice: 42000,
    currency: "₦",
    stock: 6,
    isPopular: false,
    format: "C_USER + XS_COOKIE",
    warrantyHours: 48,
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        bm_status: "VERIFIED_BUSINESS_TIER_2",
        c_user: "100084920194832",
        xs_cookie: "29%3AmqP18_valid...",
      },
      null,
      2
    ),
  },
];

interface RecentPurchase {
  user: string;
  item: string;
  time: string;
}

function getPlatformVisuals(category: string) {
  switch (category) {
    case "proxies":
      return {
        icon: <Globe size={18} />,
        iconBg: "rgba(14, 165, 233, 0.12)",
        iconColor: "#0ea5e9",
        label: "Residential Proxy",
      };
    case "numbers":
      return {
        icon: <PhoneCall size={18} />,
        iconBg: "rgba(16, 185, 129, 0.12)",
        iconColor: "#10b981",
        label: "Virtual Phone / GV",
      };
    case "software":
      return {
        icon: <Terminal size={18} />,
        iconBg: "rgba(245, 158, 11, 0.12)",
        iconColor: "#f59e0b",
        label: "Software & Tools",
      };
    case "mail":
      return {
        icon: <Mail size={18} />,
        iconBg: "rgba(234, 67, 53, 0.12)",
        iconColor: "#ea4335",
        label: "Webmail Access",
      };
    case "finance":
      return {
        icon: <CreditCard size={18} />,
        iconBg: "rgba(59, 130, 246, 0.12)",
        iconColor: "#3b82f6",
        label: "Fintech & VCC",
      };
    case "instagram":
      return {
        icon: <FaInstagram />,
        iconBg: "rgba(225, 48, 108, 0.12)",
        iconColor: "#E1306C",
        label: "Instagram",
      };
    case "working_tools":
      return {
        icon: (
          <img
            src="/working-tools.png"
            alt="Working tools"
            style={{ width: "18px", height: "18px", objectFit: "contain", verticalAlign: "middle" }}
          />
        ),
        iconBg: "rgba(15, 23, 42, 0.08)",
        iconColor: "#0f172a",
        label: "Working tools",
      };
    case "twitter":
      return {
        icon: <FaXTwitter />,
        iconBg: "rgba(15, 20, 25, 0.08)",
        iconColor: "#0f1419",
        label: "Twitter / X",
      };
    case "tiktok":
      return {
        icon: <FaTiktok />,
        iconBg: "rgba(0, 0, 0, 0.08)",
        iconColor: "#000000",
        label: "TikTok",
      };
    case "facebook":
      return {
        icon: <FaFacebookF />,
        iconBg: "rgba(24, 119, 242, 0.12)",
        iconColor: "#1877F2",
        label: "Facebook Meta",
      };
    case "telegram":
      return {
        icon: <FaTelegram />,
        iconBg: "rgba(34, 158, 217, 0.12)",
        iconColor: "#229ED9",
        label: "Telegram",
      };
    case "reddit":
      return {
        icon: <FaRedditAlien />,
        iconBg: "rgba(255, 69, 0, 0.12)",
        iconColor: "#FF4500",
        label: "Reddit",
      };
    default:
      return {
        icon: <Layers />,
        iconBg: "rgba(0, 75, 239, 0.1)",
        iconColor: "#004bef",
        label: "Digital Asset",
      };
  }
}

export const HeroShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory>("all");
  const [products, setProducts] = useState<InventoryProduct[]>(INITIAL_PRODUCTS);

  // Modals state
  const [inspectingProduct, setInspectingProduct] = useState<InventoryProduct | null>(
    null
  );
  const [purchasingProduct, setPurchasingProduct] = useState<InventoryProduct | null>(
    null
  );

  // Checkout flow state
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>("palmpay");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerTelegram, setCustomerTelegram] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [checkoutStep, setCheckoutStep] = useState<"form" | "payment" | "completed">("form");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentInitiationResult | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderResult | null>(null);
  const [apiSource, setApiSource] = useState<"mock" | "external" | "database">("mock");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [senderNote, setSenderNote] = useState<string>("");

  // Load products from internal API gateway
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      try {
        const { products: data, source } = await fetchInventoryWithMeta(selectedCategory);
        if (!isCancelled && Array.isArray(data)) {
          setProducts(data);
          setApiSource(source);
        }
      } catch (err) {
        console.warn("Using fallback local inventory:", err);
      }
    }
    loadData();
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory]);

  // Initiate Nigerian Checkout
  const handleProceedToPayment = async () => {
    if (!customerEmail || !customerEmail.includes("@") || !customerEmail.includes(".")) {
      setEmailError("Please enter a valid email address to receive your bundle");
      return;
    }
    setEmailError("");

    if (!purchasingProduct) return;

    try {
      setIsProcessing(true);
      const details = await initiateCheckout({
        amount: purchasingProduct.sellingPrice,
        email: customerEmail.trim(),
        gateway: selectedGateway,
        productTitle: purchasingProduct.title,
      });

      setPaymentDetails(details);
      setCheckoutStep("payment");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm payment & dispatch bundle to email
  const handleConfirmPaid = async () => {
    if (!purchasingProduct) return;

    if (selectedGateway === "palmpay" && !senderNote.trim()) {
      alert("Please enter your sender account name so we know who sent the transfer.");
      const inputEl = document.getElementById("senderNoteInput");
      inputEl?.focus();
      return;
    }

    try {
      setIsProcessing(true);
      const result = await submitOrder({
        productId: purchasingProduct.id,
        quantity: 1,
        customerEmail: customerEmail.trim(),
        customerTelegram: customerTelegram.trim() || undefined,
        paymentGateway: selectedGateway,
        paymentReference: paymentDetails?.reference,
        senderName: senderNote.trim() || undefined,
        notes: senderNote.trim() ? `Sender / Verification: ${senderNote.trim()}` : undefined,
      });

      setCompletedOrder(result);
      setCheckoutStep("completed");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Payment confirmation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadBundleJson = () => {
    if (!completedOrder) return;
    const exportBundle = {
      ...completedOrder,
      antiFraudDisclaimer:
        "STRICT ANTI-FRAUD NOTICE: Sterling Logs strictly opposes and does NOT support fraud. Assets and tools are provided strictly for educational, security testing, and lawful marketing recovery only. If you use this bundle for fraud or criminal acts, you are strictly on your own and assume 100% legal responsibility.",
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SterlingLogs_${completedOrder.orderId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetCheckout = () => {
    setPurchasingProduct(null);
    setCheckoutStep("form");
    setPaymentDetails(null);
    setCompletedOrder(null);
    setEmailError("");
    setCustomerTelegram("");
    setSenderNote("");
  };

  return (
    <div className={styles.showcaseWrapper}>
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      {/* Category Filter Tabs */}
      <div className={styles.tabsContainer} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "all"}
          className={`${styles.tabBtn} ${
            selectedCategory === "all" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("all")}
        >
          All Logs &amp; Tools
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "proxies"}
          className={`${styles.tabBtn} ${
            selectedCategory === "proxies" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("proxies")}
        >
          Proxies &amp; VPN
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "numbers"}
          className={`${styles.tabBtn} ${
            selectedCategory === "numbers" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("numbers")}
        >
          Virtual Numbers (GV)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "instagram"}
          className={`${styles.tabBtn} ${
            selectedCategory === "instagram" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("instagram")}
        >
          Instagram Aged
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "working_tools"}
          className={`${styles.tabBtn} ${
            selectedCategory === "working_tools" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("working_tools")}
        >
          Working Tools
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "twitter"}
          className={`${styles.tabBtn} ${
            selectedCategory === "twitter" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("twitter")}
        >
          Twitter / X
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "tiktok"}
          className={`${styles.tabBtn} ${
            selectedCategory === "tiktok" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("tiktok")}
        >
          TikTok
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "facebook"}
          className={`${styles.tabBtn} ${
            selectedCategory === "facebook" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("facebook")}
        >
          Facebook Ads
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "telegram"}
          className={`${styles.tabBtn} ${
            selectedCategory === "telegram" ? styles.tabActive : ""
          }`}
          onClick={() => setSelectedCategory("telegram")}
        >
          Telegram &amp; Reddit
        </button>
      </div>

      {/* Logs Grid */}
      <div className={styles.inventoryGrid}>
        {products.length === 0 ? (
          <div className={styles.emptyNotice}>
            <p>No logs currently available in this category. Check back shortly.</p>
          </div>
        ) : (
          products.slice(0, 6).map((product) => {
            const visuals = getPlatformVisuals(product.category);

            return (
              <div key={product.id} className={styles.accountCard}>
              {/* Meta Row: Platform + Stock Status */}
              <div className={styles.cardMetaRow}>
                <div className={styles.platformInfo}>
                  <div
                    className={styles.platformIconWrapper}
                    style={{
                      backgroundColor: visuals.iconBg,
                      color: visuals.iconColor,
                    }}
                  >
                    {visuals.icon}
                  </div>
                  <div className={styles.platformMeta}>
                    <span className={styles.platformLabel}>{product.platform}</span>
                    <span className={styles.followersBadge}>{product.followers}</span>
                  </div>
                </div>

                {product.isPopular ? (
                  <span className={`${styles.stockBadge} ${styles.badgePopular}`}>
                    <Flame size={12} />
                    High Demand
                  </span>
                ) : (
                  <span className={styles.stockBadge}>
                    <Zap size={12} />
                    {product.stock} pieces
                  </span>
                )}
              </div>

              {/* Title Section - full width, avoids single-word vertical wrapping */}
              <div className={styles.titleSection}>
                <h4 className={styles.accountName}>
                  <span className={styles.accountTitleText}>{product.title}</span>
                  <CheckCircle2 className={styles.verifiedCheck} />
                </h4>
              </div>

              {/* Spec tags */}
              <div className={styles.tagsRow}>
                {product.tags.map((tag, i) => (
                  <span key={i} className={styles.specTag}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Card Footer with Price and Actions */}
              <div className={styles.cardFooter}>
                <div className={styles.priceBlock}>
                  <span className={styles.priceLabel}>Price</span>
                  <span className={styles.priceValue}>
                    {formatNaira(product.sellingPrice)}
                  </span>
                </div>

                <div className={styles.cardActionBtns}>
                  <button
                    type="button"
                    className={styles.inspectBtn}
                    onClick={() => setInspectingProduct(product)}
                    title="View log details"
                  >
                    <Eye size={14} />
                    Details
                  </button>
                  <button
                    type="button"
                    className={styles.buyBtn}
                    onClick={() => {
                      setPurchasingProduct(product);
                      setCheckoutStep("form");
                      setCompletedOrder(null);
                    }}
                  >
                    <span>Buy Log</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>

      {/* Inspect Product Modal */}
      {inspectingProduct && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setInspectingProduct(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.inspectModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div
                  className={styles.platformIconWrapper}
                  style={{
                    backgroundColor: getPlatformVisuals(inspectingProduct.category).iconBg,
                    color: getPlatformVisuals(inspectingProduct.category).iconColor,
                    width: "32px",
                    height: "32px",
                    fontSize: "1rem",
                  }}
                >
                  {getPlatformVisuals(inspectingProduct.category).icon}
                </div>
                <h3>{inspectingProduct.title}</h3>
              </div>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setInspectingProduct(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.specsList}>
                <div className={styles.specRowItem}>
                  <span className={styles.specLabel}>Registration Year</span>
                  <span className={styles.specValue}>
                    {inspectingProduct.year} (Aged &amp; Verified)
                  </span>
                </div>
                <div className={styles.specRowItem}>
                  <span className={styles.specLabel}>Audience / Reach</span>
                  <span className={styles.specValue}>
                    {inspectingProduct.followers}
                  </span>
                </div>
                <div className={styles.specRowItem}>
                  <span className={styles.specLabel}>Delivery Format</span>
                  <span className={styles.specValue}>
                    {inspectingProduct.format}
                  </span>
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                    color: "var(--text-heading)",
                  }}
                >
                  Log Details Preview:
                </p>
                <pre className={styles.terminalBox}>
                  <code>{inspectingProduct.verificationSnippet}</code>
                </pre>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div>
                <span className={styles.priceLabel}>Price</span>
                <div className={styles.priceValue}>
                  {formatNaira(inspectingProduct.sellingPrice)}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className={styles.inspectBtn}
                  onClick={() => setInspectingProduct(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className={styles.buyBtn}
                  onClick={() => {
                    const toBuy = inspectingProduct;
                    setInspectingProduct(null);
                    setPurchasingProduct(toBuy);
                    setCheckoutStep("form");
                    setCompletedOrder(null);
                  }}
                >
                  <Lock size={14} />
                  <span>Buy Log Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PalmPay Checkout Modal with Email Dispatch */}
      {purchasingProduct && (
        <div
          className={styles.modalBackdrop}
          onClick={resetCheckout}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.inspectModal}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "580px" }}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <ShieldCheck size={20} color="#004bef" />
                <h3>
                  {checkoutStep === "completed"
                    ? "Bundle Dispatched to Email"
                    : checkoutStep === "payment"
                    ? "Complete Payment"
                    : "PalmPay Direct Checkout"}
                </h3>
              </div>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={resetCheckout}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* STEP 1: FORM & GATEWAY SELECTION */}
              {checkoutStep === "form" && (
                <>
                  <div className={styles.specsList}>
                    <div className={styles.specRowItem}>
                      <span className={styles.specLabel}>Item Selected</span>
                      <span className={styles.specValue}>
                        {purchasingProduct.title}
                      </span>
                    </div>
                    <div className={styles.specRowItem}>
                      <span className={styles.specLabel}>Price (Naira)</span>
                      <span className={styles.specValue}>
                        {formatNaira(purchasingProduct.sellingPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Email Input */}
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="checkoutEmail">
                      <span>Delivery Email Address (Required)</span>
                      <span className={styles.inputHelp}>
                        Bundle sent immediately here
                      </span>
                    </label>
                    <input
                      id="checkoutEmail"
                      type="email"
                      className={styles.textInput}
                      placeholder="e.g. yourname@gmail.com"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      autoFocus
                    />
                    {emailError && (
                      <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 600 }}>
                        {emailError}
                      </span>
                    )}
                  </div>

                  {/* Telegram Handle (Optional) */}
                  <div className={styles.inputGroup} style={{ marginTop: "10px" }}>
                    <label className={styles.inputLabel} htmlFor="customerTelegramInput">
                      <span>Telegram Username (Optional)</span>
                      <span className={styles.inputHelp}>Instant dispatch &amp; support</span>
                    </label>
                    <input
                      id="customerTelegramInput"
                      type="text"
                      className={styles.textInput}
                      placeholder="@yourhandle (e.g. @nath_trader)"
                      value={customerTelegram}
                      onChange={(e) => setCustomerTelegram(e.target.value)}
                    />
                  </div>

                  {/* Payment Gateway */}
                  <div style={{ marginTop: "12px" }}>
                    <label className={styles.inputLabel} style={{ marginBottom: "6px" }}>
                      Payment Method:
                    </label>
                    <div className={styles.gatewaySelector} style={{ gridTemplateColumns: "1fr" }}>
                      {/* PalmPay Direct */}
                      <div
                        className={`${styles.gatewayOption} ${styles.gatewayOptionActive}`}
                        onClick={() => setSelectedGateway("palmpay")}
                      >
                        <div className={styles.gatewayHeader}>
                          <span className={styles.gatewayBadgePalmPay}>PALMPAY</span>
                          <span>PalmPay Direct Transfer</span>
                          <span className={styles.recommendedBadge}>Instant</span>
                        </div>
                        <span className={styles.gatewaySub}>
                          Direct bank transfer to Nathaniel Chinwendu (7061449557) &amp; Telegram alert
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: PAYMENT INSTRUCTIONS (PALMPAY DIRECT) */}
              {checkoutStep === "payment" && paymentDetails && (
                <>
                  <div className={styles.paymentDetailsCard}>
                    <div className={styles.accountDetailRow}>
                      <span className={styles.specLabel}>Bank / Channel:</span>
                      <strong style={{ color: "var(--text-heading)" }}>
                        {paymentDetails.accountDetails?.bankName}
                      </strong>
                    </div>

                    <div className={styles.accountDetailRow}>
                      <span className={styles.specLabel}>Account Number:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={styles.accountNumberDisplay}>
                          {paymentDetails.accountDetails?.accountNumber}
                        </span>
                        <button
                          type="button"
                          className={styles.copyIconButton}
                          onClick={() =>
                            copyToClipboard(
                              paymentDetails.accountDetails?.accountNumber || "",
                              "acc_num"
                            )
                          }
                        >
                          {copiedKey === "acc_num" ? (
                            <Check size={12} color="#059669" />
                          ) : (
                            <Copy size={12} />
                          )}
                          {copiedKey === "acc_num" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div className={styles.accountDetailRow}>
                      <span className={styles.specLabel}>Account Name:</span>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                        {paymentDetails.accountDetails?.accountName}
                      </span>
                    </div>



                    <div className={styles.accountDetailRow}>
                      <span className={styles.specLabel}>Payment Reference:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={styles.accountNumberDisplay} style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>
                          {paymentDetails.reference}
                        </span>
                        <button
                          type="button"
                          className={styles.copyIconButton}
                          onClick={() => copyToClipboard(paymentDetails.reference, "pay_ref")}
                        >
                          {copiedKey === "pay_ref" ? (
                            <Check size={12} color="#059669" />
                          ) : (
                            <Copy size={12} />
                          )}
                          {copiedKey === "pay_ref" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div className={styles.accountDetailRow}>
                      <span className={styles.specLabel}>Exact Amount:</span>
                      <strong style={{ fontSize: "1.1rem", color: "#047857" }}>
                        {paymentDetails.formattedAmount}
                      </strong>
                    </div>
                  </div>

                  {/* Demanded Client Verification Input */}
                  <div className={styles.inputGroup} style={{ marginTop: "12px", marginBottom: "8px" }}>
                    <label className={styles.inputLabel} htmlFor="senderNoteInput">
                      <span>Your Sender Account Name (Required) *</span>
                      <span className={styles.inputHelp}>Used by admin to verify your transfer</span>
                    </label>
                    <input
                      id="senderNoteInput"
                      type="text"
                      className={styles.textInput}
                      placeholder="e.g. Adeola Johnson or Emeka Okafor"
                      value={senderNote}
                      onChange={(e) => setSenderNote(e.target.value)}
                    />
                  </div>

                  {/* Telegram Sync Assurance Banner */}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(124, 58, 237, 0.08)",
                      border: "1px solid rgba(124, 58, 237, 0.22)",
                      fontSize: "0.78rem",
                      color: "#6d28d9",
                      marginTop: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <FaTelegram size={18} color="#7c3aed" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Instant Telegram Notification:</strong> Transfer to the account above and click <strong>&quot;I Have Paid&quot;</strong>. The administrator receives an immediate alert on Telegram to verify and release your order.
                    </span>
                  </div>

                  <div className={styles.orderSuccessNotice}>
                    <Mail size={16} />
                    <span>
                      Delivery Email: <strong>{customerEmail}</strong>. Bundle will be automatically dispatched the second your transfer lands.
                    </span>
                  </div>
                </>
              )}

              {/* STEP 3: COMPLETED & DISPATCHED */}
              {checkoutStep === "completed" && completedOrder && (
                <>
                  {/* Email Dispatched Alert */}
                  <div className={styles.emailDispatchedCard}>
                    <Mail className={styles.emailDispatchedIcon} size={22} />
                    <div className={styles.emailDispatchedText}>
                      <strong>Bundle Dispatched to Your Email!</strong>
                      <span>
                        We sent your Netscape session cookies, OGE credentials, and 2FA backup keys to: <u>{completedOrder.emailDelivery.recipient}</u>
                      </span>
                    </div>
                  </div>

                  <div className={styles.accountDetailRow} style={{ marginTop: "4px" }}>
                    <span className={styles.specLabel}>Order ID:</span>
                    <span className={styles.orderIdPill}>{completedOrder.orderId}</span>
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          margin: 0,
                          color: "var(--text-heading)",
                        }}
                      >
                        Instant Credential Vault:
                      </p>
                      <button
                        type="button"
                        className={styles.downloadBundleBtn}
                        onClick={downloadBundleJson}
                        title="Download credentials as JSON"
                      >
                        <Download size={13} />
                        <span>Download Bundle (.JSON)</span>
                      </button>
                    </div>

                    <div className={styles.vaultBox}>
                      {completedOrder.deliveryItems.map((item, idx) => (
                        <div key={idx} className={styles.vaultItem}>
                          <div>
                            <strong>Credentials:</strong> {item.credentials}
                            <br />
                            <strong>Token:</strong> {item.token?.substring(0, 22)}...
                            <br />
                            <strong>OGE Access:</strong> {item.ogeEmail}
                          </div>
                          <button
                            type="button"
                            className={styles.inspectBtn}
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            onClick={() =>
                              copyToClipboard(
                                `${item.credentials}\nToken: ${item.token}\nOGE: ${item.ogeEmail}`,
                                item.id
                              )
                            }
                          >
                            {copiedKey === item.id ? (
                              <Check size={12} color="#059669" />
                            ) : (
                              <Copy size={12} />
                            )}
                            {copiedKey === item.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Anti-Fraud Disclaimer Notice */}
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        borderLeft: "4px solid #e11d48",
                        fontSize: "0.74rem",
                        color: "#881337",
                        lineHeight: 1.45,
                      }}
                    >
                      <strong style={{ color: "#9f1239" }}>⚠️ Strict Anti-Fraud Policy:</strong> We do NOT support fraud. If you use any account or asset purchased here for fraud, cybercrime, or illicit activities, you are strictly on your own and assume 100% legal liability.
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <div>
                <span className={styles.priceLabel}>Total (Naira)</span>
                <div className={styles.priceValue}>
                  {formatNaira(purchasingProduct.sellingPrice)}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {checkoutStep === "completed" ? (
                  <button
                    type="button"
                    className={styles.buyBtn}
                    onClick={resetCheckout}
                  >
                    Done
                  </button>
                ) : checkoutStep === "payment" ? (
                  <>
                    <button
                      type="button"
                      className={styles.inspectBtn}
                      onClick={() => setCheckoutStep("form")}
                      disabled={isProcessing}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className={styles.buyBtn}
                      onClick={handleConfirmPaid}
                      disabled={isProcessing}
                    >
                      <Lock size={14} />
                      <span>
                        {isProcessing ? "Alerting Admin..." : "I Have Paid (Alert Admin on Telegram)"}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.inspectBtn}
                      onClick={resetCheckout}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={styles.buyBtn}
                      onClick={handleProceedToPayment}
                      disabled={isProcessing}
                    >
                      <CreditCard size={14} />
                      <span>
                        {isProcessing ? "Connecting..." : "Proceed to Payment"}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroShowcase;
