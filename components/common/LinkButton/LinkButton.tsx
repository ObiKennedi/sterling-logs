import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./LinkButton.module.scss";

export interface LinkButtonProps {
  href?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  className?: string;
  target?: string;
  onClick?: () => void;
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  href = "/signup",
  children = "Sign Up",
  variant = "primary",
  size = "md",
  showArrow = true,
  className = "",
  target,
  onClick,
}) => {
  const sizeClass =
    size === "sm"
      ? styles.sizeSm
      : size === "lg"
      ? styles.sizeLg
      : styles.sizeMd;

  const variantClass =
    variant === "secondary"
      ? styles.variantSecondary
      : variant === "outline"
      ? styles.variantOutline
      : variant === "ghost"
      ? styles.variantGhost
      : styles.variantPrimary;

  const combinedClasses = `${styles.linkBtn} ${sizeClass} ${variantClass} ${className}`.trim();

  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <span className={styles.arrowIcon} aria-hidden="true">
          <ArrowRight />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} target={target} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={combinedClasses} onClick={onClick}>
      {content}
    </button>
  );
};

export default LinkButton;
