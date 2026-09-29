"use client";

import React from "react";
import {
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaFacebookF,
  FaRedditAlien,
  FaTelegram,
  FaDiscord,
  FaYoutube,
} from "react-icons/fa6";
import styles from "./PlatformTicker.module.scss";

interface PlatformItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  stock: string;
  delivery: string;
  bgColor: string;
  iconColor: string;
}

const PLATFORMS: PlatformItem[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: <FaInstagram />,
    stock: "1,840+ Logs",
    delivery: "Instant",
    bgColor: "rgba(225, 48, 108, 0.12)",
    iconColor: "#E1306C",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: <FaXTwitter />,
    stock: "1,220+ Logs",
    delivery: "Instant",
    bgColor: "rgba(15, 20, 25, 0.1)",
    iconColor: "#0f1419",
  },
  {
    id: "tiktok",
    name: "TikTok Aged",
    icon: <FaTiktok />,
    stock: "950+ Logs",
    delivery: "Instant",
    bgColor: "rgba(0, 0, 0, 0.08)",
    iconColor: "#000000",
  },
  {
    id: "facebook",
    name: "Facebook BM & Ads",
    icon: <FaFacebookF />,
    stock: "1,100+ Logs",
    delivery: "Instant",
    bgColor: "rgba(24, 119, 242, 0.12)",
    iconColor: "#1877F2",
  },
  {
    id: "reddit",
    name: "Reddit Karma",
    icon: <FaRedditAlien />,
    stock: "640+ Logs",
    delivery: "Instant",
    bgColor: "rgba(255, 69, 0, 0.12)",
    iconColor: "#FF4500",
  },
  {
    id: "telegram",
    name: "Telegram Channels",
    icon: <FaTelegram />,
    stock: "810+ Logs",
    delivery: "Instant",
    bgColor: "rgba(34, 158, 217, 0.12)",
    iconColor: "#229ED9",
  },
  {
    id: "discord",
    name: "Discord Aged",
    icon: <FaDiscord />,
    stock: "430+ Logs",
    delivery: "Instant",
    bgColor: "rgba(88, 101, 242, 0.12)",
    iconColor: "#5865F2",
  },
  {
    id: "youtube",
    name: "YouTube Monetized",
    icon: <FaYoutube />,
    stock: "390+ Logs",
    delivery: "Instant",
    bgColor: "rgba(255, 0, 0, 0.12)",
    iconColor: "#FF0000",
  },
];

export const PlatformTicker: React.FC = () => {
  // Duplicate array for endless horizontal marquee loop
  const displayPlatforms = [...PLATFORMS, ...PLATFORMS];

  return (
    <div className={styles.tickerWrapper} aria-label="Supported Social Media Platforms">
      <div className={styles.tickerHeader}>
        <span className={styles.tickerLabel}>
          SUPPORTED PLATFORMS WITH 100% ESCROW VERIFICATION
        </span>
      </div>

      <div className={styles.trackContainer}>
        {displayPlatforms.map((platform, index) => (
          <div
            key={`${platform.id}-${index}`}
            className={styles.platformCard}
            title={`${platform.name}: ${platform.stock} in stock`}
          >
            <div
              className={styles.iconBox}
              style={{
                backgroundColor: platform.bgColor,
                color: platform.iconColor,
              }}
            >
              {platform.icon}
            </div>
            <div className={styles.platformDetails}>
              <span className={styles.platformName}>{platform.name}</span>
              <span className={styles.platformMeta}>
                <span className={styles.stockCount}>{platform.stock}</span>
                <span className={styles.bullet}>•</span>
                <span>{platform.delivery}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformTicker;
