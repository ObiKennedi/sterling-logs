"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { signUp, signIn } from "@/lib/auth-client";
import formStyles from "@/components/auth/AuthForms.module.scss";
import layoutStyles from "@/components/auth/AuthLayout/AuthLayout.module.scss";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);
    setErrorMessage(null);

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setErrorCode("PASSWORD_TOO_SHORT");
      return;
    }

    if (password !== confirmPassword) {
      setErrorCode("PASSWORD_MISMATCH");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("You must accept the terms of service to create an account.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (res?.error) {
        setErrorCode(res.error.code || "USER_ALREADY_EXISTS");
        setErrorMessage(res.error.message || "Failed to create account.");
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
      console.warn("[Auth SignUp Exception]:", err);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      title="Create Your Account"
      subtitle="Join thousands of media buyers and scale real organic traffic securely."
    >
      <AuthErrorCard
        code={errorCode || undefined}
        error={errorMessage}
        onDismiss={() => {
          setErrorCode(null);
          setErrorMessage(null);
        }}
      />

      {/* Google Quick Sign-Up */}
      <button
        type="button"
        className={formStyles.googleBtn}
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isLoading}
      >
        <span className={formStyles.googleIconWrapper}>
          {isGoogleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <GoogleIcon size={18} />
          )}
        </span>
        <span>Sign up with Google</span>
      </button>

      <div className={formStyles.dividerRow}>or register with email</div>

      <form onSubmit={handleCredentialsSignUp} className={formStyles.form}>
        <div className={formStyles.inputGroup}>
          <label className={formStyles.label} htmlFor="signupName">
            Full Name
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <User size={16} />
            </span>
            <input
              id="signupName"
              type="text"
              className={`${formStyles.input} ${formStyles.inputWithIcon}`}
              placeholder="e.g. Tunde Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div className={formStyles.inputGroup}>
          <label className={formStyles.label} htmlFor="signupEmail">
            Email Address
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <Mail size={16} />
            </span>
            <input
              id="signupEmail"
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
          <label className={formStyles.label} htmlFor="signupPassword">
            Password (min. 8 characters)
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <Lock size={16} />
            </span>
            <input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              className={`${formStyles.input} ${formStyles.inputWithIcon} ${formStyles.inputWithToggle}`}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <label className={formStyles.label} htmlFor="signupConfirmPassword">
            Confirm Password
          </label>
          <div className={formStyles.inputWrapper}>
            <span className={formStyles.inputIconLeft}>
              <Lock size={16} />
            </span>
            <input
              id="signupConfirmPassword"
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

        <label className={formStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <span>
            I agree to the <Link href="/terms" className={formStyles.forgotLink}>Terms of Service</Link> and{" "}
            <Link href="/privacy" className={formStyles.forgotLink}>Escrow Policy</Link>
          </span>
        </label>

        <button
          type="submit"
          className={formStyles.submitBtn}
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Creating Your Account...</span>
            </>
          ) : (
            <>
              <span>Create Account &amp; Get Started</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className={layoutStyles.bottomNav}>
        Already have an account?
        <Link href="/login">Log In</Link>
      </div>
    </AuthLayout>
  );
}
