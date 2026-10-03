import { NextRequest, NextResponse } from "next/server";
import {
  handleTelegramUpdate,
  getTelegramConfig,
  sendTelegramMessage,
} from "@/lib/services/telegram";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/telegram
 * Receives incoming updates (callback_query approvals, commands) from Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[Telegram Webhook] Incoming update:", JSON.stringify(body).slice(0, 300));

    const result = await handleTelegramUpdate(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error processing Telegram update";
    console.error("[Telegram Webhook] Error:", errorMsg);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * GET /api/webhooks/telegram
 * Webhook health check, test ping, and optional auto-registration helper.
 *
 * Query options:
 * - ?test=true -> Sends a test alert message to Nathaniel's Telegram chat
 * - ?setWebhook=true&url=https://your-domain.com -> Registers the webhook with Telegram Bot API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const config = getTelegramConfig();

  const isTest = searchParams.get("test") === "true";
  const setWebhook = searchParams.get("setWebhook") === "true";
  const customUrl = searchParams.get("url");

  // 1. Send test ping to Admin Telegram chat
  if (isTest) {
    if (!config.adminChatId) {
      return NextResponse.json(
        { success: false, error: "TELEGRAM_ADMIN_CHAT_ID is not configured" },
        { status: 400 }
      );
    }

    const testMsg = [
      `🚀 <b>Sterling Logs Bot Live!</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Hello <b>Nathaniel Chinwendu</b>!`,
      `Your Telegram bot is successfully connected to <b>Sterling Logs</b>.`,
      ``,
      `🏦 <b>Registered Palmpay Account:</b>`,
      `• Bank: <b>${process.env.OFFICIAL_BANK_NAME || "PalmPay"}</b>`,
      `• Account: <code>${process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557"}</code>`,
      `• Name: <b>${process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu"}</b>`,
      ``,
      `When buyers complete bank transfers, you will receive interactive notifications right here to approve or decline in 1-click.`,
    ].join("\n");

    const sendRes = await sendTelegramMessage(config.adminChatId, testMsg, {
      parseMode: "HTML",
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: "✅ Bot Working",
              callback_data: "test_bot_ok",
            },
            {
              text: "💻 Admin Dashboard",
              url: `${config.appUrl}/admin`,
            },
          ],
        ],
      },
    });

    return NextResponse.json({
      success: sendRes.ok,
      telegramResponse: sendRes,
      message: sendRes.ok
        ? "Test message successfully dispatched to Nathaniel Chinwendu's Telegram!"
        : "Failed to send message. Please ensure you have opened the bot @SterlingLogsMarketBot and clicked /start",
    });
  }

  // 2. Register Webhook with Telegram API
  if (setWebhook) {
    const targetUrl = customUrl || `${config.appUrl}/api/webhooks/telegram`;
    try {
      const resp = await fetch(
        `https://api.telegram.org/bot${config.botToken}/setWebhook?url=${encodeURIComponent(
          targetUrl
        )}`
      );
      const data = await resp.json();
      return NextResponse.json({
        success: data.ok,
        targetUrl,
        telegramResponse: data,
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: err instanceof Error ? err.message : "Failed to set webhook",
        },
        { status: 500 }
      );
    }
  }

  // 3. Status Inquiry
  let botInfo: Record<string, unknown> = {};
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
    botInfo = await meRes.json();
  } catch {
    // Ignore offline error
  }

  return NextResponse.json({
    status: "active",
    botUsername: config.botUsername,
    adminChatId: config.adminChatId,
    receivingAccount: {
      bank: process.env.OFFICIAL_BANK_NAME || "PalmPay",
      accountNumber: process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557",
      accountName: process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu",
    },
    botInfo,
    instructions: {
      testUrl: "/api/webhooks/telegram?test=true",
      webhookUrl: "/api/webhooks/telegram",
    },
  });
}
