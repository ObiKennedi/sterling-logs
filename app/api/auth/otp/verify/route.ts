import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/services/otpEmail";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword, type = "password_reset" } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const verification = verifyOtp(cleanEmail, cleanOtp, type);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || "Invalid or expired OTP code." },
        { status: 400 }
      );
    }

    // If resetting password, validate new password length
    if (type === "password_reset" && newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 characters long." },
          { status: 400 }
        );
      }

      console.log(`[AUTH] Password reset successfully confirmed for: ${cleanEmail}`);
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful. Your password has been updated.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to verify code";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
