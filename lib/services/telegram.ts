import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/utils/format";

export interface TelegramConfig {
  botToken: string;
  adminChatId: string;
  botUsername: string;
  appUrl: string;
}

export function getTelegramConfig(): TelegramConfig {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "8798167600:AAEOErRWFTokcFbW0AR2zrzmE4f9YsfR_WE",
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || "5744607990",
    botUsername: process.env.TELEGRAM_BOT_USERNAME || "SterlingLogsMarketBot",
    appUrl:
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
  };
}

/**
 * Low-level Telegram API fetcher
 */
async function callTelegramApi(endpoint: string, payload: Record<string, unknown>) {
  const { botToken } = getTelegramConfig();
  if (!botToken) {
    console.warn("[Telegram Bot] Bot token not configured.");
    return { ok: false, error: "Bot token not configured" };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.ok) {
      console.warn(`[Telegram API Error] /${endpoint}:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`[Telegram API Exception] /${endpoint}:`, err);
    return { ok: false, error: err instanceof Error ? err.message : "API Call failed" };
  }
}

/**
 * Sends a message to a chat (default admin chat)
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: {
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
    replyMarkup?: Record<string, unknown>;
  }
) {
  return callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options?.parseMode || "HTML",
    reply_markup: options?.replyMarkup,
    disable_web_page_preview: true,
  });
}

/**
 * Answers Telegram Callback Query (for button presses)
 */
export async function answerTelegramCallback(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) {
  return callTelegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

/**
 * Edits a message text in-place in Telegram
 */
export async function editTelegramMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  options?: {
    parseMode?: "HTML" | "Markdown";
    replyMarkup?: Record<string, unknown>;
  }
) {
  return callTelegramApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: options?.parseMode || "HTML",
    reply_markup: options?.replyMarkup,
    disable_web_page_preview: true,
  });
}

export interface OrderAlertParams {
  orderNumber: string;
  productTitle: string;
  totalPrice: number;
  customerEmail: string;
  customerTelegram?: string;
  paymentGateway?: string;
  paymentReference?: string;
  senderName?: string;
  senderBank?: string;
  notes?: string;
}

/**
 * Sends a real-time order alert with interactive APPROVE and REJECT buttons
 * to Nathaniel Chinwendu's Telegram chat.
 */
export async function sendOrderAlertToAdmin(params: OrderAlertParams) {
  const { adminChatId, appUrl } = getTelegramConfig();
  if (!adminChatId) return { ok: false, error: "Admin chat ID not set" };

  const officialBank = process.env.OFFICIAL_BANK_NAME || "PalmPay";
  const officialAccountNum = process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557";
  const officialAccountName = process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu";

  const gatewayLabel =
    (params.paymentGateway || "palmpay").toLowerCase() === "palmpay"
      ? "PalmPay Transfer"
      : params.paymentGateway?.toUpperCase() || "PALMPAY";

  const lines = [
    `🚨 <b>NEW ORDER &amp; PAYMENT ALERT!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 <b>Order ID:</b> <code>#${params.orderNumber}</code>`,
    `💰 <b>Amount:</b> <b>${formatNaira(params.totalPrice)}</b>`,
    `🏷 <b>Product:</b> ${escapeHtml(params.productTitle)}`,
    `👤 <b>Customer:</b> <code>${escapeHtml(params.customerEmail)}</code>`,
  ];

  if (params.customerTelegram) {
    lines.push(`📱 <b>Customer Telegram:</b> ${escapeHtml(params.customerTelegram)}`);
  }

  lines.push(
    `💳 <b>Payment Gateway:</b> ${escapeHtml(gatewayLabel)}`,
    `🏦 <b>Receiving Account:</b> ${officialBank} (${officialAccountNum} - ${officialAccountName})`
  );

  if (params.senderName || params.senderBank) {
    lines.push(
      `📝 <b>Sender Info:</b> ${escapeHtml([params.senderName, params.senderBank].filter(Boolean).join(" • "))}`
    );
  }

  if (params.paymentReference) {
    lines.push(`🔖 <b>Narration / Ref:</b> <code>${escapeHtml(params.paymentReference)}</code>`);
  }

  if (params.notes && !params.notes.includes(params.senderName || "")) {
    lines.push(`💬 <b>Note:</b> ${escapeHtml(params.notes)}`);
  }

  lines.push(
    `⏱ <b>Time:</b> ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👇 <b>Action Required:</b> Verify the credit in your PalmPay app, then click below to approve or decline:`
  );

  const adminDashboardUrl = `${appUrl}/admin`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "✅ Approve & Dispatch",
          callback_data: `approve_order:${params.orderNumber}`,
        },
        {
          text: "❌ Reject Order",
          callback_data: `reject_order:${params.orderNumber}`,
        },
      ],
      [
        {
          text: "🌐 Open Admin Dashboard",
          url: adminDashboardUrl,
        },
      ],
    ],
  };

  return sendTelegramMessage(adminChatId, lines.join("\n"), {
    parseMode: "HTML",
    replyMarkup,
  });
}

export interface WalletFundingAlertParams {
  reference: string;
  amount: number;
  userEmail: string;
  senderName?: string;
  senderBank?: string;
}

/**
 * Sends a wallet funding alert to Admin with Approve/Reject buttons
 */
export async function sendWalletFundingAlertToAdmin(params: WalletFundingAlertParams) {
  const { adminChatId, appUrl } = getTelegramConfig();
  if (!adminChatId) return { ok: false, error: "Admin chat ID not set" };

  const officialBank = process.env.OFFICIAL_BANK_NAME || "PalmPay";
  const officialAccountNum = process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557";
  const officialAccountName = process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu";

  const lines = [
    `💳 <b>NEW WALLET DEPOSIT CLAIM!</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>Customer:</b> <code>${escapeHtml(params.userEmail)}</code>`,
    `💰 <b>Deposit Amount:</b> <b>${formatNaira(params.amount)}</b>`,
    `🏦 <b>Bank Credited:</b> ${officialBank} (${officialAccountNum} - ${officialAccountName})`,
    `🔖 <b>Tx Reference:</b> <code>${escapeHtml(params.reference)}</code>`,
  ];

  if (params.senderName || params.senderBank) {
    lines.push(
      `📝 <b>Sender:</b> ${escapeHtml([params.senderName, params.senderBank].filter(Boolean).join(" • "))}`
    );
  }

  lines.push(
    `⏱ <b>Time:</b> ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👇 Click below to credit this user's wallet:`
  );

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "✅ Credit Wallet",
          callback_data: `approve_funding:${params.reference}`,
        },
        {
          text: "❌ Reject Deposit",
          callback_data: `reject_funding:${params.reference}`,
        },
      ],
      [
        {
          text: "🌐 Open Admin Command Center",
          url: `${appUrl}/admin`,
        },
      ],
    ],
  };

  return sendTelegramMessage(adminChatId, lines.join("\n"), {
    parseMode: "HTML",
    replyMarkup,
  });
}

/**
 * Handles incoming webhook updates from Telegram (Callback queries & Chat commands)
 */
export async function handleTelegramUpdate(update: Record<string, any>) {
  const config = getTelegramConfig();

  // 1. Handle Interactive Inline Button Clicks (callback_query)
  if (update.callback_query) {
    const cq = update.callback_query;
    const fromId = String(cq.from?.id || "");
    const data = String(cq.data || "");
    const messageId = cq.message?.message_id;
    const chatId = cq.message?.chat?.id || fromId;
    const originalText = cq.message?.text || "";

    // Security check: Only authorized admin can approve or reject
    if (config.adminChatId && fromId !== config.adminChatId) {
      await answerTelegramCallback(cq.id, "⛔ Unauthorized. Only administrator can approve.", true);
      return { ok: false, error: "Unauthorized caller" };
    }

    // Action A: Approve Order
    if (data.startsWith("approve_order:")) {
      const orderNumber = data.replace("approve_order:", "").trim();

      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ orderNumber }, { id: orderNumber }],
          },
        });

        if (!order) {
          await answerTelegramCallback(cq.id, `⚠️ Order #${orderNumber} not found in database.`, true);
          return { ok: false, error: "Order not found" };
        }

        // Update order status in Neon DB
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "COMPLETED",
            notes: order.notes
              ? `${order.notes} • Approved by Nathaniel Chinwendu via Telegram Bot`
              : "Approved by Nathaniel Chinwendu via Telegram Bot",
          },
        });

        // Feedback alert to Telegram client
        await answerTelegramCallback(cq.id, `✅ Order #${orderNumber} successfully approved!`, false);

        // Edit the original message in Telegram to reflect approval
        const approvedNotice =
          `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
          `✅ <b>STATUS: APPROVED &amp; COMPLETED</b>\n` +
          `👤 <b>Approved By:</b> Nathaniel Chinwendu (@OFFICiall_BElite)\n` +
          `📅 <b>Approved At:</b> ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} (${new Date().toLocaleDateString("en-GB")})\n` +
          `⚡ Delivery credentials unlocked for customer.`;

        await editTelegramMessage(chatId, messageId, originalText + approvedNotice, {
          replyMarkup: {
            inline_keyboard: [
              [
                {
                  text: "🌐 View in Admin Dashboard",
                  url: `${config.appUrl}/admin`,
                },
              ],
            ],
          },
        });

        return { ok: true, action: "order_approved", orderNumber };
      } catch (err) {
        console.error("[Telegram Bot] Error approving order:", err);
        await answerTelegramCallback(cq.id, "❌ Error saving approval in database.", true);
        return { ok: false, error: "Database error" };
      }
    }

    // Action B: Reject Order
    if (data.startsWith("reject_order:")) {
      const orderNumber = data.replace("reject_order:", "").trim();

      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ orderNumber }, { id: orderNumber }],
          },
        });

        if (!order) {
          await answerTelegramCallback(cq.id, `Order #${orderNumber} not found.`, true);
          return { ok: false, error: "Order not found" };
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "REFUNDED",
            notes: order.notes
              ? `${order.notes} • Rejected by admin via Telegram`
              : "Rejected by admin via Telegram",
          },
        });

        await answerTelegramCallback(cq.id, `❌ Order #${orderNumber} marked as REJECTED.`, false);

        const rejectedNotice =
          `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
          `❌ <b>STATUS: REJECTED / DECLINED</b>\n` +
          `👤 <b>Declined By:</b> Nathaniel Chinwendu\n` +
          `📅 <b>Declined At:</b> ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

        await editTelegramMessage(chatId, messageId, originalText + rejectedNotice, {
          replyMarkup: {
            inline_keyboard: [
              [
                {
                  text: "🌐 View in Admin Dashboard",
                  url: `${config.appUrl}/admin`,
                },
              ],
            ],
          },
        });

        return { ok: true, action: "order_rejected", orderNumber };
      } catch (err) {
        console.error("[Telegram Bot] Error rejecting order:", err);
        await answerTelegramCallback(cq.id, "Error updating order.", true);
        return { ok: false, error: "Database error" };
      }
    }

    // Action C: Approve Wallet Funding
    if (data.startsWith("approve_funding:")) {
      const reference = data.replace("approve_funding:", "").trim();

      try {
        const tx = await prisma.walletTransaction.findFirst({
          where: { reference },
          include: { user: true },
        });

        if (!tx) {
          await answerTelegramCallback(cq.id, `Transaction ${reference} not found.`, true);
          return { ok: false, error: "Tx not found" };
        }

        if (tx.status === "SUCCESS") {
          await answerTelegramCallback(cq.id, `Transaction ${reference} is already credited.`, true);
          return { ok: true, message: "Already credited" };
        }

        // Credit user balance and set transaction to SUCCESS
        await prisma.$transaction([
          prisma.walletTransaction.update({
            where: { id: tx.id },
            data: { status: "SUCCESS" },
          }),
          prisma.user.update({
            where: { id: tx.userId },
            data: {
              balance: {
                increment: tx.amount,
              },
            },
          }),
        ]);

        await answerTelegramCallback(cq.id, `✅ Wallet credited with ${formatNaira(tx.amount)}!`, false);

        const creditNotice =
          `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
          `✅ <b>STATUS: WALLET CREDITED</b>\n` +
          `💰 <b>Amount:</b> ${formatNaira(tx.amount)}\n` +
          `👤 <b>User:</b> ${tx.user?.email || tx.userId}\n` +
          `📅 <b>Credited At:</b> ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

        await editTelegramMessage(chatId, messageId, originalText + creditNotice, {
          replyMarkup: {
            inline_keyboard: [
              [
                {
                  text: "🌐 View Users & Wallets",
                  url: `${config.appUrl}/admin`,
                },
              ],
            ],
          },
        });

        return { ok: true, action: "wallet_credited", reference };
      } catch (err) {
        console.error("[Telegram Bot] Error crediting wallet:", err);
        await answerTelegramCallback(cq.id, "Error crediting wallet in database.", true);
        return { ok: false, error: "Database error" };
      }
    }

    // Action D: Reject Wallet Funding
    if (data.startsWith("reject_funding:")) {
      const reference = data.replace("reject_funding:", "").trim();

      try {
        await prisma.walletTransaction.updateMany({
          where: { reference },
          data: { status: "FAILED" },
        });

        await answerTelegramCallback(cq.id, `Deposit ${reference} marked as FAILED.`, false);

        const rejectNotice =
          `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
          `❌ <b>STATUS: DEPOSIT REJECTED</b>\n` +
          `📅 <b>Declined At:</b> ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

        await editTelegramMessage(chatId, messageId, originalText + rejectNotice);
        return { ok: true, action: "funding_rejected", reference };
      } catch (err) {
        return { ok: false, error: "Database error" };
      }
    }
  }

  // 2. Handle Text Commands Sent Directly to the Bot
  if (update.message && update.message.text) {
    const text = update.message.text.trim();
    const chatId = update.message.chat.id;
    const fromId = String(update.message.from?.id || chatId);

    // Command: /start
    if (text === "/start" || text.startsWith("/start")) {
      const welcome = [
        `👋 <b>Welcome Nathaniel Chinwendu to Sterling Logs Command Bot!</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `This bot is synced with <b>Sterling Logs Marketplace</b>.`,
        ``,
        `🔔 <b>How It Works:</b>`,
        `1. Buyers transfer Naira to your PalmPay account:`,
        `   • Bank: <b>PalmPay</b>`,
        `   • Account Number: <code>7061449557</code>`,
        `   • Account Name: <b>Nathaniel Chinwendu</b>`,
        `2. As soon as a buyer clicks "I Have Paid", you will receive an instant alert here with:`,
        `   • Buyer's email &amp; Telegram`,
        `   • Amount transferred`,
        `   • Narration / Sender name`,
        `3. You can click <b>[✅ Approve &amp; Dispatch]</b> directly here to complete the order!`,
        ``,
        `<b>Bot Commands:</b>`,
        `• /pending - View unconfirmed orders`,
        `• /stats - Overview of total sales &amp; volume`,
        `• /account - View your receiving account details`,
        `• /help - Display this guide`,
      ];

      await sendTelegramMessage(chatId, welcome.join("\n"), {
        parseMode: "HTML",
        replyMarkup: {
          inline_keyboard: [
            [
              { text: "⏳ View Pending Orders", callback_data: "cmd_pending" },
              { text: "🌐 Open Admin Dashboard", url: `${config.appUrl}/admin` },
            ],
          ],
        },
      });
      return { ok: true, handled: "start" };
    }

    // Command: /account
    if (text === "/account") {
      const officialBank = process.env.OFFICIAL_BANK_NAME || "PalmPay";
      const officialAccountNum = process.env.OFFICIAL_ACCOUNT_NUMBER || "7061449557";
      const officialAccountName = process.env.OFFICIAL_ACCOUNT_NAME || "Nathaniel Chinwendu";

      const info = [
        `🏦 <b>Sterling Logs Official Receiving Account</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `• Bank: <b>${officialBank}</b>`,
        `• Account Number: <code>${officialAccountNum}</code>`,
        `• Account Name: <b>${officialAccountName}</b>`,
        ``,
        `All buyers checking out via Direct Bank Transfer are instructed to transfer to this account.`,
      ];

      await sendTelegramMessage(chatId, info.join("\n"), { parseMode: "HTML" });
      return { ok: true, handled: "account" };
    }

    // Command: /pending
    if (text === "/pending" || text === "cmd_pending") {
      try {
        const pendingOrders = await prisma.order.findMany({
          where: {
            status: { in: ["ESCROW_ACTIVE", "PENDING_APPROVAL"] },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        if (pendingOrders.length === 0) {
          await sendTelegramMessage(
            chatId,
            `✨ <b>All caught up!</b> No pending orders awaiting approval right now.`,
            { parseMode: "HTML" }
          );
          return { ok: true, handled: "pending_empty" };
        }

        for (const order of pendingOrders) {
          await sendTelegramMessage(
            chatId,
            [
              `📦 <b>Order #${order.orderNumber}</b>`,
              `💰 Amount: <b>${formatNaira(order.totalPrice)}</b>`,
              `🏷 Item: ${escapeHtml(order.productTitle)}`,
              `👤 Customer: <code>${escapeHtml(order.customerEmail)}</code>`,
              `💳 Gateway: ${escapeHtml(order.paymentGateway.toUpperCase())}`,
              order.notes ? `📝 Note: ${escapeHtml(order.notes)}` : "",
              `⏱ Placed: ${order.createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
            ]
              .filter(Boolean)
              .join("\n"),
            {
              parseMode: "HTML",
              replyMarkup: {
                inline_keyboard: [
                  [
                    {
                      text: "✅ Approve",
                      callback_data: `approve_order:${order.orderNumber}`,
                    },
                    {
                      text: "❌ Reject",
                      callback_data: `reject_order:${order.orderNumber}`,
                    },
                  ],
                ],
              },
            }
          );
        }

        return { ok: true, handled: "pending_list" };
      } catch (err) {
        await sendTelegramMessage(chatId, "Failed to fetch pending orders from database.");
        return { ok: false, error: "Database error" };
      }
    }

    // Command: /approve <orderId>
    if (text.startsWith("/approve")) {
      const parts = text.split(" ");
      const orderNumber = parts[1]?.trim();
      if (!orderNumber) {
        await sendTelegramMessage(chatId, "Usage: <code>/approve STL-XXXXXX</code>", { parseMode: "HTML" });
        return { ok: false };
      }

      try {
        const order = await prisma.order.findFirst({
          where: { OR: [{ orderNumber }, { id: orderNumber }] },
        });

        if (!order) {
          await sendTelegramMessage(chatId, `Order #${orderNumber} not found.`);
          return { ok: false };
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "COMPLETED",
            notes: order.notes
              ? `${order.notes} • Approved via Telegram command`
              : "Approved via Telegram command",
          },
        });

        await sendTelegramMessage(
          chatId,
          `✅ <b>Order #${orderNumber} Approved!</b> Credentials dispatched to ${order.customerEmail}.`,
          { parseMode: "HTML" }
        );
        return { ok: true };
      } catch (err) {
        await sendTelegramMessage(chatId, "Failed to update order in database.");
        return { ok: false };
      }
    }

    // Command: /help
    if (text === "/help") {
      const help = [
        `🤖 <b>Sterling Logs Bot Help</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `• /pending - View unconfirmed orders`,
        `• /approve [ORDER_ID] - Approve order`,
        `• /reject [ORDER_ID] - Reject order`,
        `• /account - View receiving account details`,
        `• /start - Restart bot overview`,
      ];
      await sendTelegramMessage(chatId, help.join("\n"), { parseMode: "HTML" });
      return { ok: true };
    }
  }

  return { ok: true, handled: "unprocessed" };
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
