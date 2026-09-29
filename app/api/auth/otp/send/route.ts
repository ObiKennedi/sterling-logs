import { NextRequest, NextResponse } from "next/server";
import { generateOtp, sendOtpEmail } from "@/lib/services/otpEmail";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type = "password_reset" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const otp = generateOtp(cleanEmail, type);
    const result = await sendOtpEmail(cleanEmail, otp, type);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      simulated: result.simulated,
      simulatedOtp: result.simulated ? result.simulatedOtp : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate verification code";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
