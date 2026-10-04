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
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";
import { formatNaira } from "@/lib/utils/format";
import styles from "./WalletTab.module.scss";

interface WalletTabProps {
  balance: number;
  onFundWallet: (amount: number, gateway: "palmpay", senderName: string) => Promise<void>;
}

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000, 250000];

export const WalletTab: React.FC<WalletTabProps> = ({ balance, onFundWallet }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState<string>("25000");
  const [senderAccountName, setSenderAccountName] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<"palmpay">("palmpay");
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

    if (!senderAccountName.trim()) {
      setNameError("Please enter your account name so we know who sent what.");
      const inputEl = document.getElementById("senderAccountNameInput");
      inputEl?.focus();
      return;
    }
    setNameError(null);

    try {
      setIsProcessing(true);
      await onFundWallet(amountToFund, selectedGateway, senderAccountName.trim());
      setFundingSuccessMessage(
        `Fund request of ${formatNaira(amountToFund)} submitted! Admin Nathaniel Chinwendu has been notified on Telegram to verify funds sent from "${senderAccountName.trim()}" and credit your wallet.`
      );
      setSenderAccountName("");
      setTimeout(() => setFundingSuccessMessage(null), 10000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Funding initiation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const amountToFund = Number(customAmount) || 0;

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

      {/* Funding Section Grid */}
      <div id="fundingSection" className={styles.fundingSection}>
        {/* Main Funding Card: Linear 4-Step Flow */}
        <div className={styles.fundingCard}>
          <h3 className={styles.fundingCardTitle}>
            <Wallet size={20} color="#004bef" />
            Top Up Your Sterling Naira Wallet
          </h3>

          {/* STEP 1: Select Deposit Amount */}
          <div className={styles.stepBlock}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge}>1</span>
              <h4 className={styles.stepTitle}>Select Deposit Amount</h4>
            </div>

            <p className={styles.stepSubtext}>
              Pick a quick amount or enter the exact Naira amount you want to add to your wallet.
            </p>

            {/* Quick Preset Buttons */}
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

            {/* Custom Amount Input */}
            <div className={styles.inputGroup} style={{ marginTop: "4px" }}>
              <label htmlFor="customAmount">Or Enter Custom Amount (NGN):</label>
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

            {/* Deposit Method Indicator */}
            <div className={styles.gatewayPicker} style={{ gridTemplateColumns: "1fr" }}>
              <div className={`${styles.gatewayCard} ${styles.gatewaySelected}`}>
                <div className={styles.gatewayTitle}>
                  <Building size={16} color="#7c3aed" />
                  PalmPay Direct Bank Transfer
                </div>
                <div className={styles.gatewaySub}>
                  Zero FX markup • Instant admin verification via Telegram &amp; Dashboard
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Transfer to Receiving Account (Above the Fund Request Button) */}
          <div className={styles.stepBlock}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge}>2</span>
              <h4 className={styles.stepTitle}>Transfer to Official Receiving Account</h4>
            </div>

            <div className={styles.transferAmountCallout}>
              <span>Amount to Transfer:</span>
              <strong>{formatNaira(amountToFund)}</strong>
            </div>

            <div className={styles.dedicatedAccountCard}>
              <div className={styles.accountHeader}>
                <span>Bank Name</span>
                <strong style={{ color: "#0b132b", fontSize: "0.875rem" }}>PalmPay</strong>
              </div>

              <div className={styles.accountHeader}>
                <span>Account Number</span>
                <span style={{ color: "#059669", fontWeight: 700 }}>Verified Receiving</span>
              </div>

              <div className={styles.accNumberRow}>
                <span className={styles.accNumber}>7061449557</span>
                <button
                  type="button"
                  className={styles.presetBtn}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  onClick={() => copyToClipboard("7061449557", "acc_num")}
                >
                  {copiedKey === "acc_num" ? (
                    <Check size={14} color="#059669" />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span>{copiedKey === "acc_num" ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <div className={styles.accountHeader}>
                <span>Account Name</span>
                <strong style={{ color: "#0b132b", fontSize: "0.875rem" }}>
                  Nathaniel Chinwendu
                </strong>
              </div>
            </div>
          </div>

          {/* STEP 3: Demand Sender Account Name */}
          <div className={styles.stepBlock}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge}>3</span>
              <h4 className={styles.stepTitle}>
                Your Sender Account Name <span style={{ color: "#dc2626" }}>*</span>
              </h4>
            </div>

            <p className={styles.stepSubtext}>
              Enter the exact name on the PalmPay or bank account you sent funds from so we know who sent what.
            </p>

            <div className={styles.senderInputWrapper}>
              <input
                id="senderAccountNameInput"
                type="text"
                placeholder="e.g. Adeola Johnson or Emeka Okafor"
                value={senderAccountName}
                onChange={(e) => {
                  setSenderAccountName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                className={nameError ? styles.inputError : ""}
              />
              {nameError && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={14} />
                  <span>{nameError}</span>
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: The Fund Request Button (The LAST thing the user sees) */}
          <div className={styles.stepBlock}>
            <button
              type="button"
              id="submitFundRequestBtn"
              className={styles.submitFundBtn}
              onClick={handleInitiateFunding}
              disabled={isProcessing}
            >
              <Zap size={16} />
              <span>
                {isProcessing
                  ? "Submitting Fund Request..."
                  : `I Have Paid • Submit Fund Request (${formatNaira(amountToFund)})`}
              </span>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.775rem",
                color: "#64748b",
                textAlign: "center",
                marginTop: "4px",
              }}
            >
              <ShieldCheck size={14} color="#059669" />
              <span>
                Admin Nathaniel Chinwendu is alerted instantly on Telegram to verify &amp; credit your wallet.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Deposit Guide & Escrow Guarantee */}
        <div className={styles.guideCard}>
          <h3 className={styles.fundingCardTitle}>
            <ShieldCheck size={20} color="#059669" />
            Funding Instructions &amp; Escrow
          </h3>

          <ul className={styles.guideList}>
            <li className={styles.guideItem}>
              <span className={styles.guideNum}>1</span>
              <div className={styles.guideText}>
                <strong>Pick Your Amount</strong>
                <span>Choose any preset or enter a custom amount starting from ₦1,000.</span>
              </div>
            </li>

            <li className={styles.guideItem}>
              <span className={styles.guideNum}>2</span>
              <div className={styles.guideText}>
                <strong>Make Direct Transfer</strong>
                <span>
                  Transfer the exact amount to <strong>PalmPay (7061449557 - Nathaniel Chinwendu)</strong>.
                </span>
              </div>
            </li>

            <li className={styles.guideItem}>
              <span className={styles.guideNum}>3</span>
              <div className={styles.guideText}>
                <strong>Provide Sender Account Name</strong>
                <span>
                  Input the account name you sent from so our automated ledger can match and credit you.
                </span>
              </div>
            </li>

            <li className={styles.guideItem}>
              <span className={styles.guideNum}>4</span>
              <div className={styles.guideText}>
                <strong>Click Submit Fund Request</strong>
                <span>
                  Once submitted, the admin approves your transaction from the Command Center or Telegram bot.
                </span>
              </div>
            </li>
          </ul>

          <div
            style={{
              padding: "14px",
              borderRadius: "8px",
              background: "rgba(0, 75, 239, 0.05)",
              border: "1px solid rgba(0, 75, 239, 0.15)",
              fontSize: "0.8125rem",
              color: "#1e3a8a",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
              <Lock size={16} />
              <span>100% Escrow &amp; Balance Protection</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#334155", lineHeight: 1.45 }}>
              Your funds are strictly held in escrow until you verify log credentials or download session cookies. Zero hidden fees, zero card transaction charges.
            </p>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: "rgba(5, 150, 105, 0.06)",
              border: "1px solid rgba(5, 150, 105, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.8rem",
              color: "#065f46",
            }}
          >
            <Clock size={16} style={{ flexShrink: 0 }} />
            <span>Average approval time is under 2 minutes during active market hours.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTab;
