"use client";

import React, { useState } from "react";
import {
  Lock,
  Search,
  Copy,
  Check,
  Eye,
  EyeOff,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  Server,
  PhoneCall,
  Terminal,
} from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaFacebookF,
  FaTelegram,
  FaRedditAlien,
} from "react-icons/fa6";
import { OrderResult } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import styles from "./VaultTab.module.scss";

interface VaultTabProps {
  orders: OrderResult[];
  onReleaseEscrow: (orderId: string) => void;
  onRequestReplacement: (orderId: string) => void;
}

function getPlatformIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("proxy") || t.includes("vpn") || t.includes("socks")) return { icon: <Globe size={16} />, bg: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" };
  if (t.includes("rdp") || t.includes("vps") || t.includes("server")) return { icon: <Server size={16} />, bg: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" };
  if (t.includes("voice") || t.includes("phone") || t.includes("otp") || t.includes("number")) return { icon: <PhoneCall size={16} />, bg: "rgba(16, 185, 129, 0.12)", color: "#10b981" };
  if (t.includes("software") || t.includes("bot") || t.includes("dolphin")) return { icon: <Terminal size={16} />, bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" };
  if (t.includes("instagram")) return { icon: <FaInstagram />, bg: "rgba(225, 48, 108, 0.12)", color: "#E1306C" };
  if (t.includes("twitter") || t.includes(" x")) return { icon: <FaXTwitter />, bg: "rgba(15, 20, 25, 0.08)", color: "#0f1419" };
  if (t.includes("tiktok")) return { icon: <FaTiktok />, bg: "rgba(0, 0, 0, 0.08)", color: "#000000" };
  if (t.includes("facebook")) return { icon: <FaFacebookF />, bg: "rgba(24, 119, 242, 0.12)", color: "#1877F2" };
  if (t.includes("telegram")) return { icon: <FaTelegram />, bg: "rgba(34, 158, 217, 0.12)", color: "#229ED9" };
  if (t.includes("reddit")) return { icon: <FaRedditAlien />, bg: "rgba(255, 69, 0, 0.12)", color: "#FF4500" };
  return { icon: <ShieldCheck />, bg: "rgba(0, 75, 239, 0.1)", color: "#004bef" };
}

export const VaultTab: React.FC<VaultTabProps> = ({
  orders,
  onReleaseEscrow,
  onRequestReplacement,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadJsonBundle = (order: OrderResult) => {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SterlingLogs_${order.orderId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const titleLower = order.productTitle.toLowerCase();
    let matchesPlatform = selectedPlatform === "all";
    if (!matchesPlatform) {
      if (selectedPlatform === "proxies") {
        matchesPlatform = titleLower.includes("proxy") || titleLower.includes("vpn");
      } else if (selectedPlatform === "rdp") {
        matchesPlatform = titleLower.includes("rdp") || titleLower.includes("vps") || titleLower.includes("server");
      } else if (selectedPlatform === "numbers") {
        matchesPlatform = titleLower.includes("voice") || titleLower.includes("number") || titleLower.includes("otp");
      } else if (selectedPlatform === "software") {
        matchesPlatform = titleLower.includes("software") || titleLower.includes("bot") || titleLower.includes("dolphin");
      } else {
        matchesPlatform = titleLower.includes(selectedPlatform);
      }
    }

    return matchesSearch && matchesPlatform;
  });

  return (
    <div className={styles.vaultContainer}>
      {/* Top Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by Order ID or item title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterPills}>
          {[
            { id: "all", label: "All Items" },
            { id: "proxies", label: "Proxies & VPN" },
            { id: "rdp", label: "RDP Servers" },
            { id: "numbers", label: "Virtual Numbers" },
            { id: "instagram", label: "Instagram" },
            { id: "twitter", label: "Twitter / X" },
            { id: "tiktok", label: "TikTok" },
            { id: "facebook", label: "Facebook" },
            { id: "telegram", label: "Telegram" },
            { id: "software", label: "Software & Bots" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.filterPill} ${
                selectedPlatform === cat.id ? styles.pillActive : ""
              }`}
              onClick={() => setSelectedPlatform(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersList}>
        {filteredOrders.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              color: "#64748b",
            }}
          >
            <Lock size={36} opacity={0.4} style={{ marginBottom: "12px" }} />
            <h4 style={{ margin: "0 0 6px", color: "#0b132b", fontWeight: 700 }}>
              No Credentials Found
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>
              No orders matched your filter criteria. Your purchased logs will appear here.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const visuals = getPlatformIcon(order.productTitle);
            const isEscrowActive = order.status === "ESCROW_ACTIVE";

            return (
              <div key={order.orderId} className={styles.vaultOrderCard}>
                {/* Header Row */}
                <div className={styles.cardTopHeader}>
                  <div className={styles.orderMainMeta}>
                    <div
                      className={styles.platformIconWrapper}
                      style={{ backgroundColor: visuals.bg, color: visuals.color }}
                    >
                      {visuals.icon}
                    </div>
                    <div className={styles.titleAndId}>
                      <h4>{order.productTitle}</h4>
                      <div className={styles.metaSubline}>
                        <span className={styles.orderIdPill}>#{order.orderId}</span>
                        <span>•</span>
                        <span>Dispatched {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Gateway: {order.paymentGateway.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.rightStatusGroup}>
                    {isEscrowActive ? (
                      <span className={styles.escrowCountdown}>
                        <Clock size={13} />
                        Escrow: 24h Warranty Active
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#059669",
                          background: "rgba(0, 210, 132, 0.1)",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Completed &amp; Released
                      </span>
                    )}

                    <span className={styles.priceTag}>{formatNaira(order.totalPrice)}</span>
                  </div>
                </div>

                {/* Delivered Credentials */}
                <div className={styles.credentialsVault}>
                  <span className={styles.vaultSectionTitle}>
                    <Lock size={13} />
                    Decrypted Delivery Bundle ({order.deliveryItems.length} Accounts)
                  </span>

                  {order.deliveryItems.map((item, idx) => {
                    const passKey = `${order.orderId}_pass_${idx}`;
                    const isPassVisible = visiblePasswords[passKey];

                    return (
                      <div
                        key={item.id || idx}
                        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                      >
                        <div className={styles.credentialsGrid}>
                          {/* Username / Login Identifier */}
                          <div className={styles.credentialField}>
                            <div className={styles.fieldLeft}>
                              <span className={styles.fieldLabel}>Account Login / Handle</span>
                              <span className={styles.fieldValue}>
                                {item.username || item.id || `User_${order.orderId}`}
                              </span>
                            </div>
                            <div className={styles.fieldActionBtns}>
                              <button
                                type="button"
                                className={styles.copyBtn}
                                title="Copy Login"
                                onClick={() =>
                                  handleCopy(
                                    item.username || item.id || "",
                                    `${order.orderId}_user_${idx}`
                                  )
                                }
                              >
                                {copiedId === `${order.orderId}_user_${idx}` ? (
                                  <Check size={14} color="#059669" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Password */}
                          <div className={styles.credentialField}>
                            <div className={styles.fieldLeft}>
                              <span className={styles.fieldLabel}>Encrypted Password</span>
                              <span className={styles.fieldValue}>
                                {isPassVisible
                                  ? item.credentials || "P@ssword2026!#"
                                  : "••••••••••••••••"}
                              </span>
                            </div>
                            <div className={styles.fieldActionBtns}>
                              <button
                                type="button"
                                className={styles.copyBtn}
                                title={isPassVisible ? "Hide password" : "Show password"}
                                onClick={() => togglePasswordVisibility(passKey)}
                              >
                                {isPassVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                type="button"
                                className={styles.copyBtn}
                                title="Copy Password"
                                onClick={() =>
                                  handleCopy(
                                    item.credentials || "P@ssword2026!#",
                                    passKey
                                  )
                                }
                              >
                                {copiedId === passKey ? (
                                  <Check size={14} color="#059669" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* 2FA Secret Key */}
                          <div className={styles.credentialField}>
                            <div className={styles.fieldLeft}>
                              <span className={styles.fieldLabel}>2FA Secret / Backup Key</span>
                              <span className={styles.fieldValue}>
                                {item.twoFactorSecret || "JBSWY3DPEHPK3PXP"}
                              </span>
                            </div>
                            <div className={styles.fieldActionBtns}>
                              <button
                                type="button"
                                className={styles.copyBtn}
                                title="Copy 2FA Secret"
                                onClick={() =>
                                  handleCopy(
                                    item.twoFactorSecret || "JBSWY3DPEHPK3PXP",
                                    `${order.orderId}_2fa_${idx}`
                                  )
                                }
                              >
                                {copiedId === `${order.orderId}_2fa_${idx}` ? (
                                  <Check size={14} color="#059669" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Original Email (OGE) */}
                          <div className={styles.credentialField}>
                            <div className={styles.fieldLeft}>
                              <span className={styles.fieldLabel}>Original Email (OGE)</span>
                              <span className={styles.fieldValue}>
                                {item.ogeEmail || "oge_recovery@proton.me"}
                              </span>
                            </div>
                            <div className={styles.fieldActionBtns}>
                              <button
                                type="button"
                                className={styles.copyBtn}
                                title="Copy OGE"
                                onClick={() =>
                                  handleCopy(
                                    item.ogeEmail || "oge_recovery@proton.me",
                                    `${order.orderId}_oge_${idx}`
                                  )
                                }
                              >
                                {copiedId === `${order.orderId}_oge_${idx}` ? (
                                  <Check size={14} color="#059669" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Raw Cookies / Token Code Box */}
                        <div className={styles.tokenCodeBox}>
                          <span className={styles.tokenSnippet}>
                            Cookies:{" "}
                            {item.cookies
                              ? item.cookies.slice(0, 75) + "..."
                              : `[{"domain":".session","name":"sessionid","value":"${order.orderId}..."}]`}
                          </span>
                          <button
                            type="button"
                            className={styles.downloadCookieBtn}
                            onClick={() => downloadJsonBundle(order)}
                          >
                            <Download size={13} />
                            <span>Download .JSON</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Escrow Actions */}
                <div className={styles.cardFooterActions}>
                  <div className={styles.escrowGuaranteedText}>
                    <ShieldCheck size={16} />
                    <span>24h Replacement Guarantee Active</span>
                  </div>

                  <div className={styles.actionButtonGroup}>
                    {isEscrowActive && (
                      <>
                        <button
                          type="button"
                          className={styles.disputeBtn}
                          onClick={() => onRequestReplacement(order.orderId)}
                        >
                          <AlertTriangle size={13} />
                          <span>Request Replacement</span>
                        </button>
                        <button
                          type="button"
                          className={styles.releaseEscrowBtn}
                          onClick={() => onReleaseEscrow(order.orderId)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Confirm Working (Release Escrow)</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VaultTab;
