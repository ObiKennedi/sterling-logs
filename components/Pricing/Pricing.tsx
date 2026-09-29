"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, ArrowRight, Calculator } from "lucide-react";
import { formatNaira } from "@/lib/utils/format";
import styles from "./Pricing.module.scss";

interface PlanItem {
  name: string;
  desc: string;
  price: string;
  period: string;
  isPopular?: boolean;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

const PLANS: PlanItem[] = [
  {
    name: "Single Account",
    desc: "Perfect for individual creators, media buyers, or testing an initial batch.",
    price: "₦22,500",
    period: "starting per log",
    features: [
      "Instant GTB & Paypoint Checkout",
      "Netscape Cookies (.JSON) Included",
      "ProtonMail OGE Access Credentials",
      "24-Hour Replacement Warranty",
      "Delivery to Email in < 30 Seconds",
    ],
    ctaText: "Explore Logs Market",
    ctaHref: "#top",
  },
  {
    name: "Agency Bundle",
    desc: "For digital agencies running multiple ad campaigns and client accounts.",
    price: "₦18,500",
    period: "avg per log (Min 5 logs)",
    isPopular: true,
    features: [
      "15% Volume Discount Applied",
      "48-Hour Extended Replacement Window",
      "Automated Bulk CSV / JSON Dispatch",
      "Priority Telegram VIP Support Channel",
      "Zero Checkpoint Replacement Guarantee",
      "Pre-Warmed Ad Accounts & BMs",
    ],
    ctaText: "Claim Agency Bundle",
    ctaHref: "/signup",
  },
  {
    name: "Reseller / API Partner",
    desc: "Integrate our REST API directly into your store. Sell logs with your custom markup.",
    price: "Wholesale",
    period: "discounted rates",
    features: [
      "Direct REST API Access & Webhooks",
      "Set Your Own Selling Prices & Profit",
      "Automated Balance Top-Up via GTB/Paypoint",
      "Dedicated WhatsApp Account Manager",
      "White-Label Email Dispatch Available",
      "Unlimited Daily API Order Limits",
    ],
    ctaText: "Connect Reseller API",
    ctaHref: "/signup",
  },
];

export const Pricing: React.FC = () => {
  // Reseller profit calculator state
  const [salesVolume, setSalesVolume] = useState<number>(30);
  const wholesaleCost = 18000;
  const markupMultiplier = 1.5;
  const sellingPrice = Math.round(wholesaleCost * markupMultiplier);
  const profitPerLog = sellingPrice - wholesaleCost;
  const monthlyProfit = salesVolume * profitPerLog;
  const monthlyRevenue = salesVolume * sellingPrice;

  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} data-aos="fade-up">
          <div className={styles.badge}>
            <ShieldCheck size={13} />
            <span>Transparent Naira Pricing</span>
          </div>
          <h2 className={styles.title}>
            Simple, Predictable <span className={styles.highlight}>Pricing</span>
          </h2>
          <p className={styles.subtitle}>
            Zero foreign exchange fees. Buy individual verified logs with instant delivery,
            or connect your agency via our automated wholesale API.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className={styles.pricingGrid}>
          {PLANS.map((plan, index) => (
            <div
              key={plan.name}
              className={`${styles.pricingCard} ${
                plan.isPopular ? styles.popularCard : ""
              }`}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {plan.isPopular && (
                <span className={styles.popularBadge}>Most Popular</span>
              )}

              <h3 className={styles.planTier}>{plan.name}</h3>
              <p className={styles.planDesc}>{plan.desc}</p>

              <div className={styles.priceBox}>
                <span className={styles.amount}>{plan.price}</span>
                <span className={styles.period}>/ {plan.period}</span>
              </div>

              <ul className={styles.featuresList}>
                {plan.features.map((feat, i) => (
                  <li key={i} className={styles.featureItem}>
                    <Check size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`${styles.ctaBtn} ${
                  plan.isPopular ? styles.ctaBtnPrimary : ""
                }`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>

        {/* Reseller Profit Calculator */}
        <div className={styles.calculatorBox} data-aos="fade-up">
          <div className={styles.calcLeft}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Calculator size={20} color="#38bdf8" />
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase" }}>
                Reseller Arbitrage Calculator
              </span>
            </div>
            <h3>Estimate Your Monthly Earnings</h3>
            <p>
              See how much you can earn by funding your provider dashboard and
              selling verified logs to your own buyers with a 50% profit markup.
            </p>

            <div className={styles.calcSliderGroup}>
              <label htmlFor="volumeSlider">
                <span>Monthly Accounts Sold:</span>
                <strong style={{ color: "#38bdf8", fontSize: "1.1rem" }}>
                  {salesVolume} logs / month
                </strong>
              </label>
              <input
                id="volumeSlider"
                type="range"
                min="5"
                max="200"
                step="5"
                value={salesVolume}
                onChange={(e) => setSalesVolume(Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.calcRight}>
            <div className={styles.calcMetricRow}>
              <span>Average Wholesale Cost:</span>
              <strong>{formatNaira(wholesaleCost)} / log</strong>
            </div>

            <div className={styles.calcMetricRow}>
              <span>Retail Selling Price (50% markup):</span>
              <strong style={{ color: "#38bdf8" }}>{formatNaira(sellingPrice)} / log</strong>
            </div>

            <div className={styles.calcMetricRow}>
              <span>Estimated Monthly Gross Revenue:</span>
              <strong>{formatNaira(monthlyRevenue)}</strong>
            </div>

            <div className={`${styles.calcMetricRow} ${styles.profitHighlight}`}>
              <span>Your Estimated Monthly Net Profit:</span>
              <strong>{formatNaira(monthlyProfit)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
