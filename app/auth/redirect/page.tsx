"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/Loader";

export default function AuthRedirectPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState("Verifying security clearance...");

  useEffect(() => {
    let isCancelled = false;

    async function checkRoleAndRedirect(attempt = 1) {
      try {
        setStatusText("Resolving account permissions...");
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();

        if (isCancelled) return;

        if (data.authenticated) {
          if (data.role === "admin") {
            setStatusText("Redirecting to Admin Control Center...");
            router.replace("/admin");
          } else {
            setStatusText("Redirecting to User Dashboard...");
            router.replace("/dashboard");
          }
          return;
        }

        // If not authenticated yet and attempt < 4, wait briefly and retry in case session cookie is syncing
        if (attempt < 4) {
          setTimeout(() => {
            if (!isCancelled) checkRoleAndRedirect(attempt + 1);
          }, 500);
          return;
        }

        // Fallback to user dashboard
        setStatusText("Redirecting to User Dashboard...");
        router.replace("/dashboard");
      } catch (err) {
        console.warn("[Auth Redirect Error]:", err);
        if (!isCancelled) {
          router.replace("/dashboard");
        }
      }
    }

    checkRoleAndRedirect();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return (
    <Loader
      fullScreen
      variant="escrow"
      size="lg"
      showBrand
      showEscrowBadge
      text={statusText}
      subtext="Please wait while we prepare your secure session and route to your command center."
    />
  );
}
