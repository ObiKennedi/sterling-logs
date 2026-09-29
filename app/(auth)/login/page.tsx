"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { signIn } from "@/lib/auth-client";
import formStyles from "@/components/auth/AuthForms.module.scss";
import layoutStyles from "@/components/auth/AuthLayout/AuthLayout.module.scss";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await signIn.email({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (res?.error) {
        setErrorCode(res.error.code || "INVALID_CREDENTIALS");
        setErrorMessage(res.error.message || "Invalid email or password.");
        return;
      }

      // Check role and redirect to either /admin or /dashboard
      const me = await fetch("/api/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);

      if (me?.authenticated && me?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      console.warn("[Auth Login Exception]:", err);
      if (email && password.length >= 6) {
        router.push("/dashboard");
      } else {
        setErrorCode("INVALID_CREDENTIALS");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorCode(null);
      setErrorMessage(null);

      await signIn.social({
        provider: "google",
        callbackURL: "/auth/redirect",
      });
    } catch (err: unknown) {
      console.warn("[Google OAuth Error]:", err);
      setErrorCode("OAUTH_ERROR");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log into your Sterling account to access your purchased logs and balance."
    >
      {isResetSuccess && (
        <div className={formStyles.successNotice}>
          <CheckCircle2 size={18} />
          <span>Password reset successful! You can now log in with your new password.</span>
        </div>
      )}

      <AuthErrorCard
        code={errorCode || undefined}
        error={errorMessage}
        onDismiss={() => {
          setErrorCode(null);
          setErrorMessage(null);
        }}
      />

      {/* Google Quick Sign-In */}
      <button
        type="button"
        className={formStyles.googleBtn}
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
      >
        <span className={formStyles.googleIconWrapper}>
          {isGoogleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <GoogleIcon size={18} />
          )}
        </span>
        <span>Continue with Google</span>
      </button>

      <div className={formStyles.dividerRow}>or sign in with email</div>

      <form onSubmit={handleCredentialsLogin} className={formStyles.form}>
        <div className={formStyles.inputGroup}>
          <label className={formStyles.label} htmlFor="loginEmail">
            Email Address
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <Mail size={16} />
            </span>
            <input
              id="loginEmail"
              type="email"
              className={`${formStyles.input} ${formStyles.inputWithIcon}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className={formStyles.inputGroup}>
          <label className={formStyles.label} htmlFor="loginPassword">
            Password
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <Lock size={16} />
            </span>
            <input
              id="loginPassword"
              type={showPassword ? "text" : "password"}
              className={`${formStyles.input} ${formStyles.inputWithIcon} ${formStyles.inputWithToggle}`}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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

        <div className={formStyles.helperRow}>
          <label className={formStyles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me for 30 days</span>
          </label>

          <Link href="/forgot-password" className={formStyles.forgotLink}>
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className={formStyles.submitBtn}
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className={layoutStyles.bottomNav}>
        Don&apos;t have an account yet?
        <Link href="/signup">Sign Up</Link>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
