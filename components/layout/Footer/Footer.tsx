import React from "react";
import Link from "next/link";
import { Lock, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import styles from "./Footer.module.scss";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footerContainer}>
        {/* Top Multi-column Grid */}
        <div className={styles.topGrid}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <Logo variant="white" size="md" />
            <p className={styles.brandDesc}>
              The leading marketplace for authentic, aged social accounts and high-intent
              traffic. Powered by automated instant credential delivery.
            </p>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              <span>Network Status: All Systems Operational</span>
            </div>
          </div>

          {/* Social Platforms */}
          <div>
            <h4 className={styles.colTitle}>Platforms</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="#top" className={styles.footerLink}>
                  Instagram Logs
                </Link>
              </li>
              <li>
                <Link href="#top" className={styles.footerLink}>
                  Twitter / X Accounts
                </Link>
              </li>
              <li>
                <Link href="#top" className={styles.footerLink}>
                  TikTok Aged Profiles
                  <span className={styles.badgeNew}>Hot</span>
                </Link>
              </li>
              <li>
                <Link href="#top" className={styles.footerLink}>
                  Facebook Ads &amp; Pages
                </Link>
              </li>
              <li>
                <Link href="#top" className={styles.footerLink}>
                  Reddit High-Karma
                </Link>
              </li>
              <li>
                <Link href="#top" className={styles.footerLink}>
                  Telegram Channels
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className={styles.colTitle}>Navigation</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#top" className={styles.footerLink}>
                  Marketplace
                </a>
              </li>
              <li>
                <a href="#how-it-works" className={styles.footerLink}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className={styles.footerLink}>
                  Platform Features
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className={styles.colTitle}>Trust &amp; Legal</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  24/7 Priority Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Sterling Logs. All rights reserved. Real users, real engagement.
          </p>

          <div className={styles.securityPills}>
            <span>
              <Lock size={16} color="#38BDF8" />
              256-Bit SSL Encrypted
            </span>
            <span>
              <CheckCircle2 size={16} color="#00D284" />
              Instant Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
