"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Wallet,
  Lock,
  Package,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa6";
import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/common/LinkButton";
import { PlatformTicker } from "./PlatformTicker";
import styles from "./Hero.module.scss";

/* ── Floating dashboard card mock-items ── */
const MOCK_ITEMS = [
  {
    id: "wallet",
    icon: <Wallet size={16} />,
    label: "WALLET BALANCE",
    value: "₦245,000.00",
    action: "Fund Wallet",
    color: "#004bef",
  },
  {
    id: "instagram",
    icon: <FaInstagram size={14} />,
    label: "Instagram Logs",
    value: "Aged PVA · OGE · 2FA",
    action: "Buy Now",
    color: "#E1306C",
  },
  {
    id: "facebook",
    icon: <FaFacebookF size={14} />,
    label: "Facebook & BM Logs",
    value: "Verified Business Accounts",
    action: "Browse",
    color: "#1877F2",
  },
  {
    id: "tiktok",
    icon: <FaTiktok size={14} />,
    label: "TikTok Logs",
    value: "Aged Profiles · High Followers",
    action: "View",
    color: "#010101",
  },
];

export const Hero: React.FC = () => {
  return (
    <section className={styles.heroSection} id="top" aria-label="Sterling Logs — Hero">
      {/* Grid overlay + ambient glows */}
      <div className={styles.gridOverlay} />
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />

      <div className={styles.heroContainer}>
        {/* ── LEFT: Copy ── */}
        <div className={styles.heroCopy} data-aos="fade-right" data-aos-duration="600">
          {/* Badge pill */}
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            <span>One dashboard for all your log needs</span>
          </div>

          {/* Heading */}
          <h1 className={styles.heroTitle}>
            Your next log is{" "}
            <br className={styles.desktopBr} />
            <span className={styles.heroAccent}>closer than you think.</span>
          </h1>

          {/* Subtitle */}
          <p className={styles.heroSubtitle}>
            Buy verified social media logs, proxies, virtual numbers, and
            automation tools — all delivered instantly to your secure vault
            from one simple Sterling Logs dashboard.
          </p>

          {/* CTAs */}
          <div className={styles.heroActions}>
            <LinkButton href="/signup" size="lg">
              Get Started &rarr;
            </LinkButton>
            <Link href="/login" className={styles.loginCta} id="hero-login-btn">
              Log In
            </Link>
          </div>

          {/* Trust row */}
          <div className={styles.trustRow}>
            <span className={styles.trustItem}>
              <CheckCircle2 size={14} />
              Instant Auto-Delivery
            </span>
            <span className={styles.trustItem}>
              <ShieldCheck size={14} />
              24h Warranty
            </span>
            <span className={styles.trustItem}>
              <Lock size={14} />
              Escrow Protected
            </span>
          </div>
        </div>

        {/* ── RIGHT: Floating Dashboard Card ── */}
        <div
          className={styles.heroVisual}
          data-aos="fade-left"
          data-aos-duration="700"
          data-aos-delay="100"
        >
          {/* Outer glow ring */}
          <div className={styles.cardGlow} />

          {/* Main floating card */}
          <div className={styles.dashCard}>
            {/* Card header */}
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <div className={styles.cardLogoMini}>
                  <Logo size="sm" variant="white" showText={false} href="" />
                </div>
                <div>
                  <span className={styles.cardWorkspaceLabel}>YOUR WORKSPACE</span>
                  <p className={styles.cardWorkspaceTitle}>All logs, one vault.</p>
                </div>
              </div>
              <span className={styles.cardReadyBadge}>
                <span className={styles.cardReadyDot} />
                Ready
              </span>
            </div>

            {/* Wallet row */}
            <div className={styles.cardWalletRow}>
              <div>
                <span className={styles.cardRowLabel}>WALLET</span>
                <p className={styles.cardRowTitle}>Fund when you&apos;re ready</p>
              </div>
              <button type="button" className={styles.cardFundBtn}>
                <Wallet size={13} /> Fund wallet
              </button>
            </div>

            {/* Product rows */}
            {MOCK_ITEMS.slice(1).map((item) => (
              <div key={item.id} className={styles.cardProductRow}>
                <div
                  className={styles.cardProductIcon}
                  style={{ background: `${item.color}18`, color: item.color }}
                >
                  {item.icon}
                </div>
                <div className={styles.cardProductInfo}>
                  <span className={styles.cardProductName}>{item.label}</span>
                  <span className={styles.cardProductMeta}>{item.value}</span>
                </div>
                <span className={styles.cardProductAction}>{item.action}</span>
              </div>
            ))}

            {/* Stats strip */}
            <div className={styles.cardStatsStrip}>
              <div className={styles.cardStat}>
                <Package size={12} />
                <span>180+ Logs</span>
              </div>
              <div className={styles.cardStat}>
                <Zap size={12} />
                <span>Instant</span>
              </div>
              <div className={styles.cardStat}>
                <ShieldCheck size={12} />
                <span>Verified</span>
              </div>
            </div>
          </div>

          {/* Floating activity chip */}
          <div className={styles.activityChip} data-aos="fade-up" data-aos-delay="400">
            <div className={styles.activityChipIcon}>
              <Package size={14} />
            </div>
            <div>
              <span className={styles.activityChipTitle}>Delivered to vault</span>
              <span className={styles.activityChipSub}>2018 IG PVA · ₦27,000</span>
            </div>
          </div>

          {/* Floating security chip */}
          <div className={styles.securityChip} data-aos="fade-down" data-aos-delay="500">
            <Lock size={13} />
            <span>24h escrow protection active</span>
          </div>
        </div>
      </div>

      {/* Platform ticker below */}
      <div
        className={styles.tickerWrapper}
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <PlatformTicker />
      </div>
    </section>
  );
};

export default Hero;
