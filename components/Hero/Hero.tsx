"use client";

import React from "react";
import { Star } from "lucide-react";
import { LinkButton } from "@/components/common/LinkButton";
import { HeroShowcase } from "./HeroShowcase";
import { PlatformTicker } from "./PlatformTicker";
import styles from "./Hero.module.scss";

export const Hero: React.FC = () => {
  return (
    <section className={styles.heroSection} aria-label="Hero Introduction">
      {/* Ambient background glows */}
      <div className={styles.ambientBlurLeft} />
      <div className={styles.ambientBlurRight} />

      <div className={styles.heroContainer}>
        {/* Intro / Heading Header */}
        <div className={styles.heroIntro} data-aos="fade-up">
          {/* Trust Badge */}
          <div className={styles.heroBadge}>
            <span className={styles.badgePulseDot} />
            <span className={styles.badgeText}>
              <span className={styles.badgeHighlight}>⚡ Instant Auto-Delivery</span>
            </span>
          </div>

          {/* Master Heading */}
          <h1 className={styles.heroTitle}>
            Buy Verified{" "}
            <span className={styles.gradientTextPrimary}>Social Media Logs</span> &amp;{" "}
            <br />
            Scale Real{" "}
            <span className={styles.gradientTextSecondary}>Organic Traffic</span>
          </h1>

          {/* Subheading */}
          <p className={styles.heroSubtitle}>
            The premier marketplace for aged, authentic social accounts equipped with
            active session cookies, original email (OGE) access, and automatic replacement
            protection. Zero bot traffic, zero ban risks.
          </p>

          {/* Action CTAs */}
          <div className={styles.heroActions}>
            <LinkButton href="/signup" size="lg">
              Explore Logs Market
            </LinkButton>
          </div>

          {/* Trust Metrics Bar */}
          <div className={styles.metricsRow}>
            <div className={styles.metricItem}>
              <span className={styles.metricNumber}>48,500+</span>
              <span className={styles.metricLabel}>Verified Accounts Sold</span>
            </div>

            <div className={styles.metricDivider} />

            <div className={styles.metricItem}>
              <span className={styles.metricNumber}>&lt; 60s</span>
              <span className={styles.metricLabel}>Automated Dispatch</span>
            </div>

            <div className={styles.metricDivider} />

            <div className={styles.metricItem}>
              <span className={styles.metricNumber}>99.8%</span>
              <span className={styles.metricLabel}>Replacement Success</span>
            </div>

            <div className={styles.metricDivider} />

            <div className={styles.metricItem}>
              <span className={styles.metricNumber}>
                4.9 / 5.0
                <span className={styles.starsRow}>
                  <Star size={13} fill="#f59e0b" />
                  <Star size={13} fill="#f59e0b" />
                  <Star size={13} fill="#f59e0b" />
                  <Star size={13} fill="#f59e0b" />
                  <Star size={13} fill="#f59e0b" />
                </span>
              </span>
              <span className={styles.metricLabel}>12,400+ Buyer Reviews</span>
            </div>
          </div>
        </div>

        {/* Interactive Live Showcase Terminal */}
        <div
          className={styles.showcaseContainer}
          data-aos="fade-up"
          data-aos-delay="150"
        >
          <HeroShowcase />
        </div>

        {/* Supported Platforms Marquee */}
        <div style={{ width: "100%" }} data-aos="fade-up" data-aos-delay="200">
          <PlatformTicker />
        </div>
      </div>
    </section>
  );
};

export default Hero;
