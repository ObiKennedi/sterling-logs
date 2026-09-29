import React, { useId } from "react";
import Link from "next/link";
import styles from "./Logo.module.scss";

export interface LogoProps {
  variant?: "default" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "default",
  size = "md",
  showText = true,
  className = "",
  href = "/",
}) => {
  const rawId = useId();
  const gradientId = `sterling-logo-grad-${rawId.replace(/:/g, "")}`;

  const sizeClass =
    size === "sm"
      ? styles.sizeSm
      : size === "lg"
      ? styles.sizeLg
      : styles.sizeMd;

  const variantClass =
    variant === "white"
      ? styles.variantWhite
      : variant === "dark"
      ? styles.variantDark
      : styles.variantDefault;

  const content = (
    <>
      <div className={styles.iconContainer}>
        <svg
          className={styles.logoSvg}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="32"
              y2="32"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2563eb" />
              <stop offset="0.5" stopColor="#004bef" />
              <stop offset="1" stopColor="#002f99" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
          <rect
            x="0.75"
            y="0.75"
            width="30.5"
            height="30.5"
            rx="7.25"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
          />
          {/* Modern monogram / verified log emblem */}
          <path
            d="M20.5 11.5C20.5 11.5 18.8 9.5 16 9.5C13 9.5 11.5 11 11.5 12.5C11.5 15.2 14.2 15.8 16.8 16.7C19.8 17.7 21.5 18.8 21.5 21.2C21.5 23.8 19 25 16 25C12.8 25 11 22.8 11 22.8"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="23.5" cy="8.5" r="2.5" fill="#00d284" />
        </svg>
      </div>

      {showText && (
        <span className={styles.brandText}>
          <span className={styles.brandPrimary}>Sterling</span>
          <span className={styles.brandSecondary}>Logs</span>
        </span>
      )}
    </>
  );

  const containerClasses = `${styles.logoWrapper} ${sizeClass} ${variantClass} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={containerClasses} aria-label="Sterling Logs">
        {content}
      </Link>
    );
  }

  return <div className={containerClasses}>{content}</div>;
};

export default Logo;
