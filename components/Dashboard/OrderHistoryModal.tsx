"use client";

import React, { useState } from "react";
import { X, Clock, Lock, Copy, Check, ShieldCheck, ArrowRight, Package } from "lucide-react";
import { OrderResult } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";
import styles from "./OrderHistoryModal.module.scss";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderResult[];
  onNavigateToVault: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onNavigateToVault,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>
            <Clock size={20} color="#004bef" />
            <span>Order History &amp; Vault Logs</span>
          </h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={36} color="#94a3b8" />
              <h4 style={{ margin: 0, color: "#0f172a" }}>No Orders Yet</h4>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>
                You have not purchased any logs or numbers yet. Browse categories to get started.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.orderId} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div className={styles.orderInfo}>
                    <h4>{order.productTitle}</h4>
                    <span>
                      Order #{order.orderId} • {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <span style={{ fontWeight: 800, color: "#004bef", fontSize: "1rem" }}>
                      {formatNaira(order.totalPrice)}
                    </span>
                    <span
                      className={`${styles.statusPill} ${
                        order.status === "ESCROW_ACTIVE" ? styles.active : styles.completed
                      }`}
                    >
                      <ShieldCheck size={11} />
                      {order.status === "ESCROW_ACTIVE" ? "24h Escrow Active" : "Completed"}
                    </span>
                  </div>
                </div>

                {order.deliveryItems && order.deliveryItems.length > 0 && (
                  <div className={styles.credBox}>
                    {order.deliveryItems.map((item, idx) => (
                      <div key={item.id || idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className={styles.credLine}>
                          <span>User/Line: {item.username || "Standard User"}</span>
                        </div>
                        {item.credentials && (
                          <div className={styles.credLine}>
                            <code style={{ color: "#4ade80" }}>{item.credentials}</code>
                            <button
                              type="button"
                              className={styles.copyBtn}
                              onClick={() => handleCopy(item.credentials || "", `hist-${order.orderId}-${idx}`)}
                            >
                              {copiedKey === `hist-${order.orderId}-${idx}` ? <Check size={11} /> : <Copy size={11} />}
                              <span>{copiedKey === `hist-${order.orderId}-${idx}` ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {orders.length > 0 && (
            <button
              type="button"
              style={{
                background: "#004bef",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "12px",
                fontWeight: 700,
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: "pointer",
                marginTop: "4px",
              }}
              onClick={() => {
                onClose();
                onNavigateToVault();
              }}
            >
              <Lock size={15} />
              <span>Go to Full Vault (Export Cookies &amp; 2FA)</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
