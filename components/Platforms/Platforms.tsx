import React from "react";
import { CheckCircle2, ArrowRight, Layers, Globe, PhoneCall } from "lucide-react";
import {
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaFacebookF,
  FaRedditAlien,
  FaTelegram,
} from "react-icons/fa6";
import styles from "./Platforms.module.scss";

interface PlatformInfo {
  name: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  description: string;
  highlights: string[];
  startingPrice: string;
}

const PLATFORMS: PlatformInfo[] = [
  {
    name: "Instagram Aged Logs",
    sub: "2018–2022 Verified PVA",
    icon: <FaInstagram />,
    iconBg: "rgba(225, 48, 108, 0.12)",
    iconColor: "#E1306C",
    description:
      "Aged creator & personal profiles with organic followers, Netscape cookie sessions, and ProtonMail OGE access. Zero phone checkpoint triggers.",
    highlights: [
      "Netscape Cookies (.JSON) Included",
      "ProtonMail Original Email (OGE)",
      "Tier-1 (US/UK/EU) Audience Reach",
      "2FA Backup Recovery Codes",
    ],
    startingPrice: "₦27,000",
  },
  {
    name: "Twitter / X Accounts",
    sub: "2017+ High-Trust PVA",
    icon: <FaXTwitter />,
    iconBg: "rgba(15, 20, 25, 0.08)",
    iconColor: "#0f1419",
    description:
      "Aged X accounts equipped with auth_token and ct0 session credentials. Pre-warmed for crypto shill, automated posting, and blue checkmark upgrade.",
    highlights: [
      "Direct Auth Token & ct0 Access",
      "Phone Verified & Clean Bio",
      "Zero Restriction History",
      "High Authority Impression Limits",
    ],
    startingPrice: "₦24,000",
  },
  {
    name: "TikTok Creator Logs",
    sub: "2021+ Live Studio Unlocked",
    icon: <FaTiktok />,
    iconBg: "rgba(0, 0, 0, 0.08)",
    iconColor: "#000000",
    description:
      "Aged TikTok creator profiles with Live Studio and Creator Rewards unlocked. Ideal for affiliate dropshipping, streaming, and organic video pushing.",
    highlights: [
      "Live Stream Studio Unlocked",
      "US Region IP Warmed",
      "Session Tokens + Netscape Cookies",
      "TikTok Shop Affiliate Eligible",
    ],
    startingPrice: "₦39,000",
  },
  {
    name: "Clean Residential Proxies",
    sub: "AT&T, Verizon & Rotating SOCKS5",
    icon: <Globe />,
    iconBg: "rgba(14, 165, 233, 0.12)",
    iconColor: "#0ea5e9",
    description:
      "High anonymity static residential proxies and mobile pools. Clean fraud score for unbannable session logins, Facebook Ads, and automation.",
    highlights: [
      "SOCKS5 & HTTP(S) Protocols",
      "Static & Rotating Sticky IPs",
      "Zero Fraud / Clean Subnet",
      "Instant Credential Generation",
    ],
    startingPrice: "₦18,000",
  },
  {
    name: "Virtual Numbers (GV / PVA)",
    sub: "Permanent +1 USA & Instant OTP",
    icon: <PhoneCall />,
    iconBg: "rgba(16, 185, 129, 0.12)",
    iconColor: "#10b981",
    description:
      "Permanent USA Google Voice numbers and instant SMS verification lines for WhatsApp, Telegram, PayPal, and social PVA setups.",
    highlights: [
      "Permanent +1 USA Real SIM",
      "Instant SMS & Voice OTP Codes",
      "Recovery Email Included",
      "Zero Monthly Recurring Fees",
    ],
    startingPrice: "₦13,500",
  },
  {
    name: "Facebook Meta & BMs",
    sub: "Aged Profiles + High Spend Limits",
    icon: <FaFacebookF />,
    iconBg: "rgba(24, 119, 242, 0.12)",
    iconColor: "#1877F2",
    description:
      "Business Managers with daily spend thresholds ($250 to unlimited). Comes with 2FA access, warm cookies, and pixel tracking readiness.",
    highlights: [
      "$250/Day Spend Limit Active",
      "Warm Pixel & Ad Account",
      "C_USER + XS Cookie Session",
    ],
    startingPrice: "₦42,000",
  },
  {
    name: "Telegram Channels & Sessions",
    sub: "2020 Aged Channels + TDATA",
    icon: <FaTelegram />,
    iconBg: "rgba(34, 158, 217, 0.12)",
    iconColor: "#229ED9",
    description:
      "Established public and private Telegram channels with organic subscribers, clean chat histories, and portable .session + TDATA file archives.",
    highlights: [
      "TDATA + .session Desktop Export",
      "10k+ Organic Channel Members",
      "Full Creator Ownership Transfer",
      "Clean Anti-Spam History",
    ],
    startingPrice: "₦30,000",
  },
  {
    name: "Reddit Veteran Accounts",
    sub: "2016 Aged • 30k–50k+ Karma",
    icon: <FaRedditAlien />,
    iconBg: "rgba(255, 69, 0, 0.12)",
    iconColor: "#FF4500",
    description:
      "High authority Reddit profiles with massive post and comment karma. Post in any subreddit without automod restrictions or minimum karma blocks.",
    highlights: [
      "30,000+ Verified Post Karma",
      "ProtonMail OGE Access Included",
      "Post in Any Subreddit Instantly",
      "Zero Shadowban Record",
    ],
    startingPrice: "₦22,500",
  },
];

export const Platforms: React.FC = () => {
  return (
    <section id="platforms" className={styles.platformsSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} data-aos="fade-up" suppressHydrationWarning>
          <div className={styles.badge}>
            <Layers size={13} />
            <span>Supported Ecosystem</span>
          </div>
          <h2 className={styles.title}>
            Explore Our Verified <span className={styles.highlight}>Platforms &amp; Tools</span>
          </h2>
          <p className={styles.subtitle}>
            Choose from battle-tested social accounts, clean residential proxies,
            and permanent virtual numbers with instant automated delivery in Nigerian Naira.
          </p>
        </div>

        <div className={styles.platformGrid}>
          {PLATFORMS.map((platform, index) => (
            <div
              key={platform.name}
              className={styles.platformCard}
              data-aos="fade-up"
              data-aos-delay={index * 80}
              suppressHydrationWarning
            >
              <div className={styles.cardHeader}>
                <div
                  className={styles.platformIconWrapper}
                  style={{
                    backgroundColor: platform.iconBg,
                    color: platform.iconColor,
                  }}
                >
                  {platform.icon}
                </div>
                <div className={styles.platformCardTitles}>
                  <h3>{platform.name}</h3>
                  <span>{platform.sub}</span>
                </div>
              </div>

              <p className={styles.platformDesc}>{platform.description}</p>

              <ul className={styles.featuresList}>
                {platform.highlights.map((h, i) => (
                  <li key={i} className={styles.featureRow}>
                    <CheckCircle2 size={15} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.cardFooter}>
                <div className={styles.priceTag}>
                  <span className={styles.priceFrom}>Starting at</span>
                  <span className={styles.priceAmount}>
                    {platform.startingPrice}
                  </span>
                </div>

                <a href="#top" className={styles.viewBtn}>
                  <span>Explore Logs</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Platforms;
