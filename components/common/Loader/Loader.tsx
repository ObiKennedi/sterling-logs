"use client";

import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";
import styles from "./Loader.module.scss";

export type LoaderVariant = "orbital" | "escrow" | "spinner" | "dots" | "bar";
export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";
export type LoaderTheme = "light" | "dark" | "auto";

export interface LoaderProps {
  /**
   * Animation design style
   * @default "orbital"
   */
  variant?: LoaderVariant;
  /**
   * Visual size dimension
   * @default "md"
   */
  size?: LoaderSize;
  /**
   * Color theme mode
   * @default "light"
   */
  theme?: LoaderTheme;
  /**
   * Primary loading label or title
   */
  text?: React.ReactNode;
  /**
   * Secondary supporting description or security subtext
   */
  subtext?: React.ReactNode;
  /**
   * If true, renders a fixed viewport backdrop with ambient blur glow
   * @default false
   */
  fullScreen?: boolean;
  /**
   * If true, covers parent container as an absolute overlay
   * @default false
   */
  overlay?: boolean;
  /**
   * If true, includes the Sterling Logs brand header in fullscreen / card modes
   * @default false
   */
  showBrand?: boolean;
  /**
   * If true, displays the 256-Bit Escrow Encrypted guarantee badge
   * @default false
   */
  showEscrowBadge?: boolean;
  /**
   * Additional custom CSS class
   */
  className?: string;
  /**
   * Accessible ARIA label
   * @default "Loading, please wait..."
   */
  ariaLabel?: string;
  id?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  variant = "orbital",
  size = "md",
  theme = "light",
  text,
  subtext,
  fullScreen = false,
  overlay = false,
  showBrand = false,
  showEscrowBadge = false,
  className = "",
  ariaLabel = "Loading, please wait...",
  id,
}) => {
  const isDark = theme === "dark";

  // Map size classes
  const sizeMap: Record<LoaderSize, string> = {
    xs: styles.sizeXs,
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
  };

  const selectedSizeClass = sizeMap[size] || styles.sizeMd;

  // Render the core animation variant
  const renderVisual = () => {
    switch (variant) {
      case "escrow":
        return (
          <div className={`${styles.escrowSystem} ${selectedSizeClass}`}>
            <div className={styles.radarPulseWave} />
            <div className={styles.radarPulseWaveDelayed} />
            <div className={`${styles.shieldHexagon} ${selectedSizeClass}`}>
              <ShieldCheck
                size={size === "xs" ? 10 : size === "sm" ? 14 : size === "md" ? 22 : size === "lg" ? 32 : 40}
              />
            </div>
          </div>
        );

      case "spinner":
        return (
          <div
            className={`${styles.spinnerRing} ${selectedSizeClass}`}
            role="status"
            aria-label={ariaLabel}
          />
        );

      case "dots":
        return (
          <div
            className={`${styles.dotsWrapper} ${selectedSizeClass}`}
            role="status"
            aria-label={ariaLabel}
          >
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        );

      case "bar":
        return (
          <div
            className={styles.barTrack}
            role="status"
            aria-label={ariaLabel}
          >
            <div className={styles.barIndicator} />
          </div>
        );

      case "orbital":
      default:
        return (
          <div
            className={`${styles.orbitalSystem} ${selectedSizeClass}`}
            role="status"
            aria-label={ariaLabel}
          >
            <div className={styles.outerRing}>
              <div className={styles.orbitalBead} />
            </div>
            <div className={styles.innerRing} />
            <div className={styles.orbitalCore}>
              <Lock
                size={size === "xs" ? 6 : size === "sm" ? 8 : size === "md" ? 12 : size === "lg" ? 16 : 22}
              />
            </div>
          </div>
        );
    }
  };

  // Text & subtext content block
  const renderTextContent = () => {
    if (!text && !subtext) return null;
    return (
      <div className={styles.textContent}>
        {text && <div className={styles.loadingText}>{text}</div>}
        {subtext && <div className={styles.loadingSubtext}>{subtext}</div>}
      </div>
    );
  };

  // Escrow trust badge block
  const renderEscrowBadge = () => {
    if (!showEscrowBadge) return null;
    return (
      <div className={styles.escrowBadge}>
        <ShieldCheck size={14} />
        <span>256-Bit Escrow Security Protected</span>
      </div>
    );
  };

  // 1. Fullscreen Viewport Mode
  if (fullScreen) {
    return (
      <div
        id={id}
        className={`${styles.fullScreenWrapper} ${isDark ? styles.darkTheme : ""} ${className}`}
        role="alert"
        aria-busy="true"
        aria-live="polite"
      >
        <div className={styles.ambientBlur} />
        <div className={styles.glassCard}>
          {showBrand && <Logo size="md" variant={isDark ? "white" : "default"} />}
          {renderVisual()}
          {renderTextContent()}
          {renderEscrowBadge()}
        </div>
      </div>
    );
  }

  // 2. Container Overlay Mode
  if (overlay) {
    return (
      <div
        id={id}
        className={`${styles.overlayWrapper} ${isDark ? styles.darkTheme : ""} ${className}`}
        role="alert"
        aria-busy="true"
        aria-live="polite"
      >
        <div className={styles.glassCard} style={{ maxWidth: "340px", padding: "24px" }}>
          {showBrand && <Logo size="sm" variant={isDark ? "white" : "default"} />}
          {renderVisual()}
          {renderTextContent()}
          {renderEscrowBadge()}
        </div>
      </div>
    );
  }

  // 3. Standard / Inline Mode
  return (
    <div
      id={id}
      className={`${styles.inlineContainer} ${isDark ? styles.darkTheme : ""} ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      {renderVisual()}
      {renderTextContent()}
      {renderEscrowBadge()}
    </div>
  );
};

export default Loader;
