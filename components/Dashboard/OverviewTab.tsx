"use client";

import React from "react";
import {
  Wallet,
  Package,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Eye,
  CheckCircle2,
  Lock,
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
import { OrderResult, UserProfile } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import styles from "./OverviewTab.module.scss";

interface OverviewTabProps {
  profile: UserProfile;
  orders: OrderResult[];
  onNavigateToTab: (tab: "overview" | "inventory" | "vault" | "wallet" | "settings") => void;
}

function getPlatformIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("proxy") || p.includes("vpn") || p.includes("socks")) return { icon: <Globe size={16} />, bg: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" };
  if (p.includes("rdp") || p.includes("vps") || p.includes("server")) return { icon: <Server size={16} />, bg: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" };
  if (p.includes("voice") || p.includes("phone") || p.includes("otp") || p.includes("number")) return { icon: <PhoneCall size={16} />, bg: "rgba(16, 185, 129, 0.12)", color: "#10b981" };
  if (p.includes("software") || p.includes("bot") || p.includes("dolphin")) return { icon: <Terminal size={16} />, bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" };
  if (p.includes("instagram")) return { icon: <FaInstagram />, bg: "rgba(225, 48, 108, 0.12)", color: "#E1306C" };
  if (p.includes("twitter") || p.includes(" x")) return { icon: <FaXTwitter />, bg: "rgba(15, 20, 25, 0.08)", color: "#0f1419" };
  if (p.includes("tiktok")) return { icon: <FaTiktok />, bg: "rgba(0, 0, 0, 0.08)", color: "#000000" };
  if (p.includes("facebook")) return { icon: <FaFacebookF />, bg: "rgba(24, 119, 242, 0.12)", color: "#1877F2" };
  if (p.includes("telegram")) return { icon: <FaTelegram />, bg: "rgba(34, 158, 217, 0.12)", color: "#229ED9" };
  if (p.includes("reddit")) return { icon: <FaRedditAlien />, bg: "rgba(255, 69, 0, 0.12)", color: "#FF4500" };
  return { icon: <ShieldCheck />, bg: "rgba(0, 75, 239, 0.1)", color: "#004bef" };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  orders,
  onNavigateToTab,
}) => {
  const activeEscrowOrders = orders.filter((o) => o.status === "ESCROW_ACTIVE");

  return (
    <div className={styles.overviewContainer}>
      {/* 4 Top Metric Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Your Wallet Money</span>
            <span className={styles.metricValue}>{formatNaira(profile.balance)}</span>
            <span
              className={styles.metricSubtext}
              style={{ cursor: "pointer" }}
              onClick={() => onNavigateToTab("wallet")}
            >
              <Zap size={13} />
              + Add Money
            </span>
          </div>
          <div className={`${styles.metricIconBox} ${styles.iconGreen}`}>
            <Wallet size={22} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Logs You Bought</span>
            <span className={styles.metricValue}>{orders.length}</span>
            <span className={styles.metricSubtext}>
              <CheckCircle2 size={13} />
              100% Working
            </span>
          </div>
          <div className={`${styles.metricIconBox} ${styles.iconBlue}`}>
            <Package size={22} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Under Guarantee</span>
            <span className={styles.metricValue}>{activeEscrowOrders.length}</span>
            <span className={styles.metricSubtext} style={{ color: "#d97706" }}>
              <Clock size={13} />
              24 Hours Replacement
            </span>
          </div>
          <div className={`${styles.metricIconBox} ${styles.iconAmber}`}>
            <Lock size={22} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Instant Delivery</span>
            <span className={styles.metricValue}>100%</span>
            <span className={styles.metricSubtext}>
              <ShieldCheck size={13} />
              Direct to Vault
            </span>
          </div>
          <div className={`${styles.metricIconBox} ${styles.iconPurple}`}>
            <Zap size={22} />
          </div>
        </div>
      </div>

      {/* Escrow Active Attention Callout Banner */}
      {activeEscrowOrders.length > 0 && (
        <div className={styles.escrowAlertBanner}>
          <div className={styles.alertLeft}>
            <Lock size={24} className={styles.alertIcon} />
            <div className={styles.alertText}>
              <h4>{activeEscrowOrders.length} Log(s) Under 24h Guarantee</h4>
              <p>
                Your login details and password are in your vault. Test your log now. If you have
                any issue, you can change it within 24 hours.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.viewVaultBtn}
            onClick={() => onNavigateToTab("vault")}
          >
            <span>Open Vault &amp; View Details</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Recent Orders Section */}
      <div>
        <div className={styles.sectionHeader}>
          <h3>Recent Logs Bought</h3>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "var(--primary, #004bef)",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
            onClick={() => onNavigateToTab("vault")}
          >
            View All ({orders.length}) &rarr;
          </button>
        </div>

        <div className={styles.ordersCard}>
          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={40} opacity={0.4} />
              <h4>You Have Not Bought Any Logs Yet</h4>
              <p>
                Visit the Logs Market to see all available accounts. Once you buy, your login and
                password will appear here immediately.
              </p>
              <button
                type="button"
                className={styles.viewVaultBtn}
                style={{ marginTop: "14px" }}
                onClick={() => onNavigateToTab("inventory")}
              >
                <span>Go to Market &amp; Buy Logs (180+ Available)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className={styles.tableResponsiveWrapper}>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Log Name</th>
                    <th>Price Paid</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => {
                    const visuals = getPlatformIcon(order.productTitle);
                    return (
                      <tr key={order.orderId}>
                        <td>
                          <span className={styles.orderIdBadge}>#{order.orderId}</span>
                        </td>
                        <td>
                          <div className={styles.platformCell}>
                            <div
                              className={styles.platformIcon}
                              style={{ backgroundColor: visuals.bg, color: visuals.color }}
                            >
                              {visuals.icon}
                            </div>
                            <div className={styles.itemDetails}>
                              <span className={styles.itemTitle}>{order.productTitle}</span>
                              <span className={styles.itemSub}>
                                {order.deliveryItems.length} account login(s)
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{formatNaira(order.totalPrice)}</strong>
                        </td>
                        <td>
                          <span style={{ textTransform: "uppercase", fontWeight: 700, fontSize: "0.75rem" }}>
                            {order.paymentGateway}
                          </span>
                        </td>
                        <td>
                          {order.status === "ESCROW_ACTIVE" ? (
                            <span className={`${styles.statusBadge} ${styles.statusEscrow}`}>
                              <Lock size={11} />
                              24h Guarantee
                            </span>
                          ) : (
                            <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
                              <CheckCircle2 size={11} />
                              Completed
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.inspectVaultActionBtn}
                            onClick={() => onNavigateToTab("vault")}
                          >
                            <Eye size={12} />
                            <span>View Login</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
