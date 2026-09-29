"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";
import formStyles from "@/components/auth/AuthForms.module.scss";
import layoutStyles from "@/components/auth/AuthLayout/AuthLayout.module.scss";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") || "";
  const simOtp = searchParams.get("sim") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(simOtp);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync email from params
  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (simOtp) setOtp(simOtp);
  }, [emailParam, simOtp]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);
    setErrorMessage(null);

    if (!otp || otp.length !== 6) {
      setErrorCode("INVALID_OTP");
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorCode("PASSWORD_TOO_SHORT");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorCode("PASSWORD_MISMATCH");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          type: "password_reset",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to verify code.");
        return;
      }

      setSuccessMessage("Your password has been successfully updated! Redirecting to login...");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !email) return;

    try {
      setIsResending(true);
      setErrorCode(null);
      setErrorMessage(null);

      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          type: "password_reset",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to resend code.");
        return;
      }

      setResendCooldown(60);
      if (data.simulated && data.simulatedOtp) {
        setOtp(data.simulatedOtp);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend";
      setErrorMessage(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Enter Verification Code"
      subtitle={`We sent a 6-digit single-use code to ${email || "your email"}.`}
    >
      <AuthErrorCard
        code={errorCode || undefined}
        error={errorMessage}
        onDismiss={() => {
          setErrorCode(null);
          setErrorMessage(null);
        }}
      />

      {successMessage && (
        <div className={formStyles.successNotice}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Dev helper notice when running simulated without Resend key */}
      {simOtp && (
        <div className={formStyles.successNotice}>
          <CheckCircle2 size={18} />
          <div>
            <strong>Dev Mode Active:</strong>
            <div style={{ marginTop: "2px" }}>
              Code automatically filled from simulation: <code>{simOtp}</code>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleVerifyAndReset} className={formStyles.form}>
        <div className={formStyles.inputGroup}>
          <label className={formStyles.label} htmlFor="otpCode">
            <span>6-Digit Verification Code</span>
            <span style={{ fontSize: "0.725rem", color: "var(--primary)" }}>
              Expires in 10 mins
            </span>
          </label>
          <input
            id="otpCode"
            type="text"
            maxLength={6}
            className={`${formStyles.input} ${formStyles.otpInput}`}
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            required
            autoFocus
          />
        </div>

        <div className={formStyles.inputGroup}>
          <label className={formStyles.label} htmlFor="newPassword">
            New Password (min. 8 characters)
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <Lock size={16} />
            </span>
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              className={`${formStyles.input} ${formStyles.inputWithIcon} ${formStyles.inputWithToggle}`}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className={formStyles.togglePasswordBtn}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className={formStyles.inputGroup}>
          <label className={formStyles.label} htmlFor="confirmNewPassword">
            Confirm New Password
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <Lock size={16} />
            </span>
            <input
              id="confirmNewPassword"
              type={showPassword ? "text" : "password"}
              className={`${formStyles.input} ${formStyles.inputWithIcon}`}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className={formStyles.resendRow}>
          <span>Didn&apos;t receive the code?</span>
          <button
            type="button"
            className={formStyles.resendBtn}
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || isResending}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : isResending
              ? "Sending..."
              : "Resend Code"}
          </button>
        </div>

        <button
          type="submit"
          className={formStyles.submitBtn}
          disabled={isLoading || Boolean(successMessage)}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying &amp; Updating...</span>
            </>
          ) : (
            <>
              <span>Update Password &amp; Log In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className={layoutStyles.bottomNav}>
        Remember your password?
        <Link href="/login">Back to Log In</Link>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
