"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Scale,
} from "lucide-react";
import styles from "./AntiFraudNotice.module.scss";

/* ─── 3D Bell SVG Component with Ringing Sound Waves ─── */
interface BellIconProps {
  flipped?: boolean;
}

const GoldenBell: React.FC<BellIconProps> = ({ flipped = false }) => (
  <svg
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${styles.bellSvg} ${flipped ? styles.bellFlipped : ""}`}
    aria-hidden="true"
  >
    <defs>
      <radialGradient
        id={`bellGoldGrad-${flipped ? "flip" : "norm"}`}
        cx="35%"
        cy="30%"
        r="65%"
      >
        <stop offset="0%" stopColor="#fff3b0" />
        <stop offset="35%" stopColor="#fbbf24" />
        <stop offset="75%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </radialGradient>
      <linearGradient
        id={`bellShine-${flipped ? "flip" : "norm"}`}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <filter id="bellShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#78350f" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Top Hanging Loop */}
    <ellipse
      cx="21"
      cy="7"
      rx="3.5"
      ry="3"
      stroke="#b45309"
      strokeWidth="2"
      fill="none"
    />

    {/* Bell Body */}
    <g filter="url(#bellShadow)">
      <path
        d="M21 9C15.5 9 13.5 14 12 18.5C10.8 22 8 24.5 8 26C8 27.5 9.5 28.5 21 28.5C32.5 28.5 34 27.5 34 26C34 24.5 31.2 22 30 18.5C28.5 14 26.5 9 21 9Z"
        fill={`url(#bellGoldGrad-${flipped ? "flip" : "norm"})`}
      />
      {/* Specular highlight */}
      <path
        d="M20 11C16.8 11.5 15.2 15 14 19C13.2 21.5 11.5 23.5 11 25C11.5 24 13.5 22 14.5 19.5C16 15.5 17.5 12 20 11Z"
        fill={`url(#bellShine-${flipped ? "flip" : "norm"})`}
      />
      {/* Rim Bottom Lip */}
      <ellipse
        cx="21"
        cy="28"
        rx="13"
        ry="2.5"
        fill="#b45309"
      />
      <ellipse
        cx="21"
        cy="27.5"
        rx="12.5"
        ry="2"
        fill={`url(#bellGoldGrad-${flipped ? "flip" : "norm"})`}
      />
    </g>

    {/* Clapper / Hammer */}
    <circle
      cx="21"
      cy="31"
      r="2.8"
      fill="#78350f"
    />
    <circle
      cx="20.2"
      cy="30.2"
      r="1"
      fill="#fde68a"
    />

    {/* Sound Wave Vibration Arcs */}
    <path
      d="M33 13C35.5 15.5 36.5 19 36 22"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      className={styles.soundWave}
    />
    <path
      d="M37 11C40 14.5 41 19.5 40 24"
      stroke="#d97706"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={styles.soundWaveOuter}
    />
  </svg>
);

/* ─── Notice Slides Data ─── */
export interface NoticeItem {
  id: number;
  tag: string;
  badge: string;
  text: string;
  highlight?: string;
}

const NOTICE_ITEMS: NoticeItem[] = [
  {
    id: 1,
    tag: "STRICT ANTI-FRAUD POLICY",
    badge: "Zero Tolerance",
    text: "Sterling Logs strictly opposes fraud. Any logs, accounts, or services purchased here are for legitimate use only. You assume 100% legal responsibility for any misuse.",
    highlight: "strictly opposes fraud",
  },
  {
    id: 2,
    tag: "SERVICE OWNERSHIP TERMS",
    badge: "Official Notice",
    text: "Any phone numbers, virtual credentials, or assets provided to you via our services are not your property or reserved strictly for your private use.",
    highlight: "are not your property",
  },
  {
    id: 3,
    tag: "PERSONAL LEGAL LIABILITY",
    badge: "Strict Warning",
    text: "If you use anything purchased here for fraudulent activities, cybercrime, or illicit purposes, you are strictly on your own with zero platform support.",
    highlight: "strictly on your own",
  },
  {
    id: 4,
    tag: "EDUCATIONAL & RECOVERY USE",
    badge: "Permitted Use",
    text: "All digital assets supplied are sold exclusively for educational recovery, authorized penetration testing, security analytics, and lawful social marketing.",
    highlight: "educational recovery & testing",
  },
  {
    id: 5,
    tag: "24-HOUR ESCROW PROTECTION",
    badge: "Buyer Warranty",
    text: "Valid orders are protected by our 24h escrow warranty. Inspect delivered credentials promptly to verify integrity before automatic release.",
    highlight: "24h escrow warranty",
  },
  {
    id: 6,
    tag: "LAW ENFORCEMENT COMPLIANCE",
    badge: "Security Protocol",
    text: "We maintain zero tolerance for financial crimes and cooperate fully with cybersecurity authorities regarding unauthorized or malicious exploitation.",
    highlight: "cooperate fully with authorities",
  },
];

interface AntiFraudNoticeProps {
  className?: string;
  onOpenFullTerms?: () => void;
}

export const AntiFraudNotice: React.FC<AntiFraudNoticeProps> = ({
  className = "",
  onOpenFullTerms,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Touch gesture tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = NOTICE_ITEMS.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-play interval
  useEffect(() => {
    if (isPaused || isModalOpen) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, isModalOpen, nextSlide]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDist = 40;

    if (diff > minSwipeDist) {
      // Swiped left -> next
      nextSlide();
    } else if (diff < -minSwipeDist) {
      // Swiped right -> prev
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentItem = NOTICE_ITEMS[currentIndex];

  const handleOpenTerms = () => {
    if (onOpenFullTerms) {
      onOpenFullTerms();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <section
        className={`${styles.noticeCard} ${className}`}
        aria-label="Anti-Fraud and Service Terms Notice"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ─── Top Main Content: NOTICE Typography + Speech Bubble ─── */}
        <div className={styles.topArea}>
          {/* Left Graphic: Large Bold Condensed "NOTICE" with Bells */}
          <div className={styles.noticeGraphic}>
            {/* Top-Right Ringing Bell */}
            <div className={styles.bellTopWrap} title="Ringing Alert">
              <GoldenBell />
            </div>

            {/* Massive Bold Impact "NOTICE" */}
            <h2 className={styles.noticeWord} id="notice-heading">
              NOTICE
            </h2>

            {/* Bottom-Left Ringing Bell */}
            <div className={styles.bellBottomWrap} title="Ringing Alert">
              <GoldenBell flipped />
            </div>
          </div>

          {/* Right Content: Speech Bubble with Purple Border */}
          <div
            className={styles.speechBubble}
            onClick={handleOpenTerms}
            role="button"
            tabIndex={0}
            aria-label="Click to view complete legal terms & anti-fraud policy"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenTerms();
              }
            }}
          >
            {/* Speech Bubble Pointer / Beak (pointing Left toward NOTICE) */}
            <svg
              className={styles.bubbleTail}
              viewBox="0 0 14 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* White fill triangle covering border seam */}
              <polygon points="14,0 14,20 1,10" fill="#ffffff" />
              {/* Purple border contour matching the card border */}
              <polyline
                points="14,0 1,10 14,20"
                stroke="#7c3aed"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>

            {/* Speech Bubble Header */}
            <div className={styles.bubbleHeader}>
              <div className={styles.brandBadge}>
                {/* Brand icon / logo */}
                <div className={styles.brandIcon}>
                  <ShieldAlert size={12} />
                </div>
                <span className={styles.brandName}>Sterling Logs</span>
              </div>
              <span className={styles.noticeTag}>{currentItem.badge}</span>
            </div>

            {/* Speech Bubble Message */}
            <div className={styles.bubbleBody}>
              <p key={currentItem.id} className={styles.bubbleText}>
                {currentItem.text}
              </p>
            </div>

            {/* Hint link to view full policy */}
            <div className={styles.bubbleFooter}>
              <span className={styles.readPolicyHint}>
                Tap to read full policy <ExternalLink size={10} />
              </span>
            </div>

            {/* Bottom-Right Purple Checkmark Badge */}
            <div className={styles.verifiedBadge} title="Verified Sterling Security Notice">
              <Check size={13} strokeWidth={3} color="#ffffff" />
            </div>
          </div>
        </div>

        {/* ─── Bottom Ribbon: Dark Purple Doodle Strip + Ticker + Carousel Dots ─── */}
        <div className={styles.bottomRibbon}>
          {/* Repeating NOTICE Ticker Tape */}
          <div className={styles.tickerWrapper} aria-hidden="true">
            <div className={styles.tickerTrack}>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              {/* Duplicate set for seamless continuous marquee */}
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
              <span className={styles.tickerItem}>NOTICE</span>
              <span className={styles.tickerDivider}>|</span>
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div
            className={styles.dotsContainer}
            role="tablist"
            aria-label="Notice slide controls"
          >
            {NOTICE_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={currentIndex === idx}
                aria-label={`Notice slide ${idx + 1}: ${item.tag}`}
                className={`${styles.dot} ${currentIndex === idx ? styles.dotActive : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(idx);
                }}
              />
            ))}
          </div>

          {/* Optional Prev/Next Controls on hover */}
          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous notice"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next notice"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Comprehensive Anti-Fraud & Legal Terms Modal ─── */}
      {isModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className={styles.modalSheet}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderIcon}>
                <ShieldAlert size={20} />
              </div>
              <div className={styles.modalHeaderContent}>
                <h3 id="modal-title" className={styles.modalTitle}>
                  Strict Anti-Fraud & Compliance Policy
                </h3>
                <span className={styles.modalBadge}>Sterling Logs · Legal Terms</span>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              <div className={styles.calloutBox}>
                <AlertTriangle size={18} className={styles.calloutIcon} />
                <div>
                  <strong>Zero-Tolerance Fraud Prohibition:</strong> Sterling Logs maintains an absolute zero-tolerance policy against cybercrime, financial fraud, phishing, carding, scamming, unauthorized penetration, or any illicit activities.
                </div>
              </div>

              <div className={styles.termsSection}>
                <h4>
                  <Scale size={15} /> 1. Civil and Criminal Legal Liability
                </h4>
                <p>
                  Any individual or entity utilizing accounts, phone numbers, proxies, webmails, or working tools acquired via Sterling Logs does so strictly at their own discretion. If you use any asset for fraudulent purposes or violations of local/international law, <strong>you are strictly on your own</strong> and assume 100% sole civil, criminal, and financial liability. Sterling Logs disclaims all responsibility for buyer conduct.
                </p>
              </div>

              <div className={styles.termsSection}>
                <h4>
                  <Lock size={15} /> 2. Educational, Testing & Recovery Scope
                </h4>
                <p>
                  All digital assets and tools supplied on this platform are provisioned exclusively for authorized social media account recovery, security penetration testing, digital marketing analytics, and educational research.
                </p>
              </div>

              <div className={styles.termsSection}>
                <h4>
                  <ShieldCheck size={15} /> 3. Property & Non-Private Usage Terms
                </h4>
                <p>
                  Any phone numbers, virtual OTP credentials, or sessions provisioned through our platform are not your private personal property and are not reserved exclusively for private ownership. All assets are subject to platform compliance monitoring.
                </p>
              </div>

              <div className={styles.termsSection}>
                <h4>
                  <ShieldAlert size={15} /> 4. Law Enforcement Cooperation
                </h4>
                <p>
                  Sterling Logs actively cooperates with competent law enforcement and cybersecurity incident response teams. Malicious actors or reported fraudulent activities will result in immediate permanent account termination and forfeiture of funds.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalAcceptBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <Check size={16} />
                I Understand & Acknowledge Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AntiFraudNotice;
