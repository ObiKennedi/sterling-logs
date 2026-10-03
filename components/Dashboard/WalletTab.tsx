"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Building,
  CreditCard,
  Zap,
} from "lucide-react";
import { formatNaira } from "@/lib/utils/format";
import styles from "./WalletTab.module.scss";

interface WalletTabProps {
  balance: number;
  onFundWallet: (amount: number, gateway: "palmpay" | "gtb" | "paypoint") => Promise<void>;
}

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000, 250000];

export const WalletTab: React.FC<WalletTabProps> = ({ balance, onFundWallet }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState<string>("25000");
  const [selectedGateway, setSelectedGateway] = useState<"palmpay" | "gtb" | "paypoint">("palmpay");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fundingSuccessMessage, setFundingSuccessMessage] = useState<string | null>(null);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(String(amount));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setSelectedAmount(Number(val) || 0);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInitiateFunding = async () => {
    const amountToFund = Number(customAmount);
    if (!amountToFund || amountToFund < 1000) {
      alert("Minimum wallet funding amount is ₦1,000");
      return;
    }

    try {
      setIsProcessing(true);
      await onFundWallet(amountToFund, selectedGateway);
      setFundingSuccessMessage(
        `Deposit request for ${formatNaira(amountToFund)} submitted! Administrator Nathaniel Chinwendu has been notified on Telegram to verify and credit your wallet.`
      );
      setTimeout(() => setFundingSuccessMessage(null), 8000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Funding initiation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.walletContainer}>
      {/* Balance Hero Card */}
      <div className={styles.balanceHeroCard}>
        <div className={styles.balanceInfo}>
          <span className={styles.balanceLabel}>Total Available Naira Balance</span>
          <div className={styles.balanceNumber}>{formatNaira(balance)}</div>
          <div className={styles.balanceTrustNotice}>
            <ShieldCheck size={16} />
            <span>100% Escrow Protected • Instant 1-Click Purchase Ready</span>
          </div>
        </div>

        <div className={styles.heroActionWrapper}>
          <button
            type="button"
            className={styles.heroFundBtn}
            onClick={() => {
              const el = document.getElementById("fundingSection");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <ArrowUpRight size={18} />
            <span>Fund Wallet Now</span>
          </button>
        </div>
      </div>

      {/* Funding Success Banner */}
      {fundingSuccessMessage && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: "rgba(0, 210, 132, 0.12)",
            border: "1px solid rgba(0, 210, 132, 0.3)",
            color: "#047857",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={20} />
          <span>{fundingSuccessMessage}</span>
        </div>
      )}

      {/* Funding Section */}
      <div id="fundingSection" className={styles.fundingSection}>
        {/* Left: Funding Form */}
        <div className={styles.fundingCard}>
          <h3 className={styles.fundingCardTitle}>
            <Wallet size={20} color="#004bef" />
            Top Up Your Sterling Naira Wallet
          </h3>

          {/* Quick Preset Buttons */}
          <div className={styles.inputGroup}>
            <label>Select Quick Amount:</label>
            <div className={styles.presetAmountsGrid}>
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`${styles.presetBtn} ${
                    selectedAmount === amt ? styles.presetActive : ""
                  }`}
                  onClick={() => handlePresetClick(amt)}
                >
                  {formatNaira(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="customAmount">Or Enter Amount (NGN):</label>
            <div className={styles.customAmountInputWrapper}>
              <span className={styles.nairaPrefix}>₦</span>
              <input
                id="customAmount"
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="25000"
              />
            </div>
          </div>

          {/* Gateway Choice */}
          <div className={styles.inputGroup}>
            <label>Choose Deposit Method:</label>
            <div className={styles.gatewayPicker}>
              <div
                className={`${styles.gatewayCard} ${
                  selectedGateway === "palmpay" ? styles.gatewaySelected : ""
                }`}
                onClick={() => setSelectedGateway("palmpay")}
              >
                <div className={styles.gatewayTitle}>
                  <Building size={16} color="#7c3aed" />
                  PalmPay Transfer
                </div>
                <div className={styles.gatewaySub}>Instant Telegram sync</div>
              </div>

              <div
                className={`${styles.gatewayCard} ${
                  selectedGateway === "gtb" ? styles.gatewaySelected : ""
                }`}
                onClick={() => setSelectedGateway("gtb")}
              >
                <div className={styles.gatewayTitle}>
                  <Building size={16} color="#ea580c" />
                  GTBank Transfer
                </div>
                <div className={styles.gatewaySub}>GTB transfer channel</div>
              </div>

              <div
                className={`${styles.gatewayCard} ${
                  selectedGateway === "paypoint" ? styles.gatewaySelected : ""
                }`}
                onClick={() => setSelectedGateway("paypoint")}
              >
                <div className={styles.gatewayTitle}>
                  <CreditCard size={16} color="#0284c7" />
                  Paypoint Virtual Acc
                </div>
                <div className={styles.gatewaySub}>Virtual account</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.submitFundBtn}
            onClick={handleInitiateFunding}
            disabled={isProcessing}
          >
            <Zap size={16} />
            <span>
              {isProcessing
                ? "Submitting Deposit..."
                : `Fund ${formatNaira(Number(customAmount) || 0)}`}
            </span>
          </button>
        </div>

        {/* Right: Automated Account Details */}
        <div className={styles.fundingCard}>
          <h3 className={styles.fundingCardTitle}>
            <Building size={20} color="#059669" />
            Official Receiving Account
          </h3>

          <p style={{ fontSize: "0.84rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            Transfer directly to the account details below. Your payment will be verified
            and credited via Telegram instant approval.
          </p>

          <div className={styles.dedicatedAccountCard}>
            <div className={styles.accountHeader}>
              <span>Bank Name</span>
              <strong style={{ color: "#0b132b" }}>
                {selectedGateway === "palmpay"
                  ? "PalmPay"
                  : selectedGateway === "gtb"
                  ? "Guaranty Trust Bank (GTB)"
                  : "Wema Bank / Paypoint"}
              </strong>
            </div>

            <div className={styles.accountHeader}>
              <span>Account Number</span>
              <span style={{ color: "#059669", fontWeight: 700 }}>
                {selectedGateway === "palmpay" ? "Verified Receiving" : "Auto-Credit"}
              </span>
            </div>

            <div className={styles.accNumberRow}>
              <span className={styles.accNumber}>
                {selectedGateway === "palmpay"
                  ? "7061449557"
                  : selectedGateway === "gtb"
                  ? "0194829104"
                  : "9041849201"}
              </span>
              <button
                type="button"
                className={styles.presetBtn}
                style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                onClick={() =>
                  copyToClipboard(
                    selectedGateway === "palmpay"
                      ? "7061449557"
                      : selectedGateway === "gtb"
                      ? "0194829104"
                      : "9041849201",
                    "acc_num"
                  )
                }
              >
                {copiedKey === "acc_num" ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                <span>{copiedKey === "acc_num" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className={styles.accountHeader}>
              <span>Account Name</span>
              <strong style={{ color: "#0b132b" }}>
                {selectedGateway === "palmpay"
                  ? "Nathaniel Chinwendu"
                  : "STERLING LOGS / RESELLER VAULT"}
              </strong>
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: "rgba(0, 75, 239, 0.05)",
              border: "1px solid rgba(0, 75, 239, 0.15)",
              fontSize: "0.8125rem",
              color: "#1e3a8a",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>Zero deposit fees. Funds are protected by our escrow guarantee.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTab;
