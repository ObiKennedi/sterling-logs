import React from "react";
import { AlertCircle, ShieldAlert, X } from "lucide-react";
import styles from "./AuthErrorCard.module.scss";

export interface AuthErrorCardProps {
  error?: string | null;
  code?: string;
  title?: string;
  onDismiss?: () => void;
  onAction?: () => void;
  actionText?: string;
  variant?: "danger" | "warning";
}

const ERROR_MAP: Record<string, { title: string; message: string }> = {
  INVALID_CREDENTIALS: {
    title: "Authentication Failed",
    message: "The email or password you entered is incorrect. Please check your credentials and try again.",
  },
  USER_ALREADY_EXISTS: {
    title: "Account Already Exists",
    message: "An account with this email address already exists. Please log in instead or reset your password.",
  },
  INVALID_OTP: {
    title: "Invalid Verification Code",
    message: "The 6-digit code you entered is invalid. Please double-check the email sent to your inbox.",
  },
  EXPIRED_OTP: {
    title: "Verification Code Expired",
    message: "This code has expired (valid for 10 minutes). Please request a fresh code to continue.",
  },
  PASSWORD_MISMATCH: {
    title: "Password Mismatch",
    message: "The passwords entered do not match. Please ensure both fields match exactly.",
  },
  PASSWORD_TOO_SHORT: {
    title: "Weak Password",
    message: "Password must be at least 8 characters long and contain a mix of letters and numbers.",
  },
  OAUTH_ERROR: {
    title: "Google Authentication Error",
    message: "Unable to complete Google sign-in. Please ensure third-party cookies are enabled or use email & password.",
  },
  RATE_LIMIT_EXCEEDED: {
    title: "Too Many Attempts",
    message: "You have exceeded the maximum allowed attempts. Please wait 60 seconds before trying again.",
  },
};

export const AuthErrorCard: React.FC<AuthErrorCardProps> = ({
  error,
  code,
  title,
  onDismiss,
  onAction,
  actionText,
  variant = "danger",
}) => {
  if (!error && !code) return null;

  const mapped = code ? ERROR_MAP[code] : undefined;
  const displayTitle = title || mapped?.title || (variant === "warning" ? "Notice" : "Authentication Error");
  const displayMessage = error || mapped?.message || "An unexpected error occurred. Please try again.";

  return (
    <div className={styles.errorCardWrapper} role="alert" aria-live="assertive">
      <div
        className={`${styles.errorCard} ${
          variant === "warning" ? styles.errorCardWarning : ""
        }`}
      >
        <div className={styles.iconBox}>
          {variant === "warning" ? (
            <ShieldAlert size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
        </div>

        <div className={styles.content}>
          <strong className={styles.title}>{displayTitle}</strong>
          <span className={styles.description}>{displayMessage}</span>

          {onAction && actionText && (
            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={onAction}
              >
                {actionText}
              </button>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={onDismiss}
            aria-label="Dismiss error notification"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthErrorCard;
