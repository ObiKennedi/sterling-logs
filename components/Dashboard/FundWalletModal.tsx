"use client";

import React, { useState } from "react";
import { X, Wallet, CheckCircle2, Copy, Check, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { formatNaira } from "@/lib/utils/format";
import styles from "./FundWalletModal.module.scss";

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onFundWallet: (amount: number, gateway: "gtb" | "paypoint") => Promise<void>;
}

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000, 250000];

export const FundWalletModal: React.FC<FundWalletModalProps> = ({
  isOpen,
  onClose,
  balance,
  onFundWallet,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState<string>("25000");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(String(amount));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setSelectedAmount(Number(val) || 0);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProceedFunding = async () => {
    const amount = Number(customAmount);
    if (!amount || amount < 1000) {
      alert("Minimum wallet funding is ₦1,000");
      return;
    }

    try {
      setIsProcessing(true);
      await onFundWallet(amount, "gtb");
      setSuccessMsg(`Your wallet has been credited with ${formatNaira(amount)} instantly!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Funding failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>
            <Wallet size={20} color="#004bef" />
            <span>Fund Naira Wallet</span>
          </h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.balanceSummary}>
            <div>
              <span className={styles.label}>Available Balance</span>
              <div className={styles.val}>{formatNaira(balance)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.2)", padding: "4px 10px", borderRadius: "9999px", color: "#34d399", fontWeight: 700 }}>
              <ShieldCheck size={13} />
              <span>Instant Credit Ready</span>
            </div>
          </div>

          {successMsg ? (
            <div className={styles.successNotice}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          ) : (
            <>
              <div className={styles.inputGroup}>
                <label>Enter Amount to Fund (₦)</label>
                <div className={styles.amountInputWrapper}>
                  <span className={styles.currencyPrefix}>₦</span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomChange}
                    placeholder="e.g. 25,000"
                  />
                </div>
              </div>

              <div className={styles.presetsGrid}>
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`${styles.presetBtn} ${selectedAmount === amt ? styles.presetActive : ""}`}
                    onClick={() => handleSelectPreset(amt)}
                  >
                    {formatNaira(amt)}
                  </button>
                ))}
              </div>

              {/* Bank Details info box */}
              <div className={styles.bankDetailsCard}>
                <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: "2px" }}>
                  Instant Virtual Dedicated Account
                </div>
                <div className={styles.bankRow}>
                  <span className={styles.bLabel}>Bank:</span>
                  <span className={styles.bVal}>Guaranty Trust Bank (GTBank)</span>
                </div>
                <div className={styles.bankRow}>
                  <span className={styles.bLabel}>Account Number:</span>
                  <span className={styles.bVal}>
                    <code>0129482104</code>
                    <button
                      type="button"
                      className={styles.copyInlineBtn}
                      onClick={() => handleCopy("0129482104", "acc")}
                    >
                      {copiedField === "acc" ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedField === "acc" ? "Copied" : "Copy"}</span>
                    </button>
                  </span>
                </div>
                <div className={styles.bankRow}>
                  <span className={styles.bLabel}>Account Name:</span>
                  <span className={styles.bVal}>Sterling Vault / Primex NG</span>
                </div>
              </div>

              <button
                type="button"
                className={styles.fundActionBtn}
                onClick={handleProceedFunding}
                disabled={isProcessing || !Number(customAmount)}
              >
                <Zap size={16} />
                <span>
                  {isProcessing
                    ? "Confirming Transaction..."
                    : `Credit Wallet Now with ${formatNaira(Number(customAmount) || 0)}`}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
