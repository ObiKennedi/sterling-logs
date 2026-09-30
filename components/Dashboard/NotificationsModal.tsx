"use client";

import React from "react";
import { X, Bell, ShieldCheck, Zap, Wallet, CheckCircle2 } from "lucide-react";
import { formatNaira } from "@/lib/utils/format";
import styles from "./NotificationsModal.module.scss";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  orderCount: number;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  balance,
  orderCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>
            <Bell size={20} color="#004bef" />
            <span>Alerts &amp; Notifications</span>
          </h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.notifItem}>
            <div className={styles.notifIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <ShieldCheck size={20} />
            </div>
            <div className={styles.notifContent}>
              <h4>24h Escrow Protection Active</h4>
              <p>
                All log purchases and virtual phone numbers are protected by our automatic 24-hour escrow replacement policy.
              </p>
              <span>System Notice • Always Active</span>
            </div>
          </div>

          <div className={styles.notifItem}>
            <div className={styles.notifIcon} style={{ background: "rgba(0, 75, 239, 0.1)", color: "#004bef" }}>
              <Wallet size={20} />
            </div>
            <div className={styles.notifContent}>
              <h4>Wallet Ready: {formatNaira(balance)}</h4>
              <p>
                Your Naira wallet is connected and primed for instant 1-click checkout across all goods.
              </p>
              <span>Instant Wallet Engine</span>
            </div>
          </div>

          <div className={styles.notifItem}>
            <div className={styles.notifIcon} style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
              <Zap size={20} />
            </div>
            <div className={styles.notifContent}>
              <h4>Instant Delivery Guarantee</h4>
              <p>
                Credentials, session cookies, and 2FA secrets appear directly in your Vault in under 2 seconds.
              </p>
              <span>Automated Dispatch</span>
            </div>
          </div>

          {orderCount > 0 && (
            <div className={styles.notifItem}>
              <div className={styles.notifIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                <CheckCircle2 size={20} />
              </div>
              <div className={styles.notifContent}>
                <h4>{orderCount} Order(s) in Vault</h4>
                <p>
                  You have active logs and items in your vault ready to be downloaded or used.
                </p>
                <span>Orders Tracked</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
