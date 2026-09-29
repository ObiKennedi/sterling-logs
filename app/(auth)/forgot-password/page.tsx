"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";
import formStyles from "@/components/auth/AuthForms.module.scss";
import layoutStyles from "@/components/auth/AuthLayout/AuthLayout.module.scss";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);

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
        setErrorMessage(data.error || "Failed to send verification code.");
        return;
      }

      // If simulated in development without Resend key, preserve simulatedOtp in query for quick testing
      const simQuery = data.simulated && data.simulatedOtp ? `&sim=${data.simulatedOtp}` : "";
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}${simQuery}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a single-use 6-digit verification code from Resend."
    >
      <AuthErrorCard
        code={errorCode || undefined}
        error={errorMessage}
        onDismiss={() => {
          setErrorCode(null);
          setErrorMessage(null);
        }}
      />

      <form onSubmit={handleSendOtp} className={formStyles.form}>
        <div className={formStyles.inputGroup}>
          <label className={formStyles.label} htmlFor="forgotEmail">
            Account Email Address
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <Mail size={16} />
            </span>
            <input
              id="forgotEmail"
              type="email"
              className={`${formStyles.input} ${formStyles.inputWithIcon}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          className={formStyles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Sending OTP via Resend...</span>
            </>
          ) : (
            <>
              <KeyRound size={16} />
              <span>Send 6-Digit Code</span>
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
