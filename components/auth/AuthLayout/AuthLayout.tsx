import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import styles from "./AuthLayout.module.scss";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className={styles.authWrapper}>
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      <div className={styles.topBar}>
        <Logo size="md" />
      </div>

      <div className={styles.authCard}>
        <div className={styles.cardHeader}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}
      </div>

      <div className={styles.trustBadges}>
        <span>
          <ShieldCheck size={14} color="#00d284" />
          100% Escrow Protected
        </span>
        <span>
          <Lock size={14} color="#004bef" />
          256-Bit SSL Encrypted
        </span>
      </div>
    </div>
  );
};

export default AuthLayout;
