"use client";

import React, { useState } from "react";
import { UserProfile } from "@/types/inventory";
import { User, Key, Copy, Check, RefreshCw, ShieldCheck } from "lucide-react";
import styles from "./SettingsTab.module.scss";

interface SettingsTabProps {
  profile: UserProfile;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ profile }) => {
  const [apiKey, setApiKey] = useState<string>(
    "stl_live_84920491028491048291048291048291"
  );
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerate = () => {
    if (confirm("Regenerate your reseller API key? Old key will be invalidated immediately.")) {
      setIsRegenerating(true);
      setTimeout(() => {
        setApiKey(`stl_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`);
        setIsRegenerating(false);
      }, 600);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      {/* Account Info Card */}
      <div className={styles.settingsCard}>
        <div className={styles.cardHeader}>
          <User size={18} color="#004bef" />
          <h3>Account Information</h3>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label>Account Username</label>
              <input type="text" value={profile.username} disabled />
            </div>

            <div className={styles.fieldGroup}>
              <label>Registered Email</label>
              <input type="email" value={profile.email} disabled />
            </div>

            <div className={styles.fieldGroup}>
              <label>Account Role</label>
              <input type="text" value="Verified Escrow Reseller / Buyer" disabled />
            </div>

            <div className={styles.fieldGroup}>
              <label>Currency</label>
              <input type="text" value="Nigerian Naira (₦ NGN)" disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Reseller API Credentials */}
      <div className={styles.settingsCard}>
        <div className={styles.cardHeader}>
          <Key size={18} color="#059669" />
          <h3>Reseller API Token</h3>
        </div>

        <div className={styles.cardBody}>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b", lineHeight: 1.5 }}>
            Use this secret key to automate programmatic log purchases, check real-time
            Naira balance, and sync credentials directly to your external bot or CRM.
          </p>

          <div className={styles.tokenDisplayBox}>
            <span className={styles.tokenString}>{apiKey}</span>
            <div className={styles.tokenActions}>
              <button
                type="button"
                className={styles.tokenBtn}
                onClick={handleCopy}
              >
                {copiedKey ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                <span>{copiedKey ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                className={styles.tokenBtn}
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                <RefreshCw size={13} />
                <span>Roll Key</span>
              </button>
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: "rgba(5, 150, 105, 0.08)",
              border: "1px solid rgba(5, 150, 105, 0.2)",
              color: "#047857",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldCheck size={16} />
            <span>Never share this key. API orders debit directly from your Naira balance.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
