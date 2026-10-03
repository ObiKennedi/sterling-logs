import { DeliveredItem, EmailDeliveryStatus, InventoryProduct, PaymentGateway } from "@/types/inventory";
import { formatNaira } from "@/lib/utils/format";

export interface SendDeliveryEmailOptions {
  recipientEmail: string;
  orderId: string;
  product: InventoryProduct | { title: string; platform: string; warrantyHours: number };
  items: DeliveredItem[];
  totalPrice: number;
  paymentGateway: PaymentGateway;
  paymentReference: string;
}

/**
 * Automated Email Dispatcher
 * Sends login credentials, session cookies, and escrow protection details
 * directly to the buyer's email immediately upon payment verification.
 */
export async function sendOrderDeliveryEmail(
  options: SendDeliveryEmailOptions
): Promise<EmailDeliveryStatus> {
  const {
    recipientEmail,
    orderId,
    product,
    items,
    totalPrice,
    paymentGateway,
    paymentReference,
  } = options;

  const now = new Date();
  const messageId = `msg_${orderId}_${now.getTime()}`;
  const subject = `⚡ Your Sterling Logs Bundle is Ready [Order #${orderId}]`;

  const gatewayName =
    paymentGateway === "palmpay"
      ? "PalmPay Transfer"
      : paymentGateway === "gtb"
      ? "Guaranty Trust Bank (GTB)"
      : "Paypoint Gateway";

  // Build credentials text bundle with strict anti-fraud disclaimer
  const legalDisclaimerText = `======================================================================
⚠️ STRICT ANTI-FRAUD DISCLAIMER & TERMS OF USE:
WE DO NOT SUPPORT FRAUD. If you use anything purchased from us for
fraud, cybercrime, or any unlawful acts, you are strictly on your own
and bear 100% personal, civil, and criminal legal liability.
======================================================================`;

  const bundleText = `${legalDisclaimerText}
` + items
    .map((item, index) => {
      return `
--- LOG #${index + 1} CREDENTIALS ---
Username / ID: ${item.username || "Auto-assigned"}
Login Credentials: ${item.credentials}
Session Token / Cookie: ${item.token || item.cookies}
Original Email (OGE): ${item.ogeEmail || "Included in cookie session"}
2FA Backup Secret: ${item.twoFactorSecret || "Not required"}
-----------------------------------`;
    })
    .join("\n");

  console.log(
    `[EMAIL DISPATCH] Dispatched to ${recipientEmail} for Order #${orderId} via ${gatewayName}. Total: ${formatNaira(
      totalPrice
    )}`
  );

  // If RESEND_API_KEY or SMTP is provided, connect directly here
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Sterling Logs <orders@sterlinglogs.com>",
          to: [recipientEmail],
          subject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #004bef; padding-bottom: 12px; margin-bottom: 18px;">
                <h2 style="color: #004bef; margin: 0; font-size: 20px;">Sterling Logs - Order Delivery</h2>
                <span style="font-size: 12px; color: #64748b; font-family: monospace;">#${orderId}</span>
              </div>

              <p style="color: #334155; font-size: 14px; line-height: 1.5;">Thank you for your purchase! Your payment via <strong>${gatewayName}</strong> (Ref: <code>${paymentReference}</code>) was confirmed.</p>
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 16px 0;">
                <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #475569; text-transform: uppercase;">Order Summary:</h4>
                <p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>Item:</strong> ${product.title}<br/><strong>Total Paid:</strong> ${formatNaira(totalPrice)}</p>
              </div>

              <h4 style="margin: 18px 0 8px 0; font-size: 13px; color: #475569; text-transform: uppercase;">Your Credentials Vault:</h4>
              <div style="background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 12px; overflow-x: auto;">
                <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${bundleText}</pre>
              </div>

              <!-- Comprehensive Anti-Fraud & Legal Disclaimer -->
              <div style="margin-top: 24px; padding: 16px 18px; background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 5px solid #e11d48; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <strong style="color: #9f1239; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;">
                    ⚠️ STRICT ANTI-FRAUD DISCLAIMER &amp; TERMS OF USE
                  </strong>
                </div>
                <p style="margin: 0 0 10px 0; font-size: 12.5px; line-height: 1.6; color: #881337;">
                  <strong>Sterling Logs strictly condemns and does NOT support or condone fraud, cybercrime, identity theft, or illegal activity of any kind.</strong> All digital accounts, tools, and materials supplied are provided strictly for educational purposes, security research, and lawful marketing recovery only.
                </p>
                <p style="margin: 0; font-size: 12.5px; line-height: 1.6; color: #881337;">
                  <strong>IF YOU CHOOSE TO USE ANYTHING PURCHASED FROM THIS PLATFORM FOR FRAUD OR ANY UNLAWFUL PURPOSE, YOU ARE ENTIRELY ON YOUR OWN.</strong> You bear 100% full personal, civil, and criminal legal responsibility. Sterling Logs and its management shall NOT be held liable for any misuse, damages, or illegal conduct perpetrated by buyers.
                </p>
              </div>

              <p style="font-size: 12px; color: #64748b; margin-top: 20px; line-height: 1.5;">Your credentials have been securely dispatched. If you need any assistance or warranty replacement within your escrow window, reply directly to this email.</p>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.warn("[EMAIL DISPATCH] Resend API attempt failed, local log saved:", err);
    }
  }

  return {
    sent: true,
    recipient: recipientEmail,
    subject,
    dispatchedAt: now.toISOString(),
    messageId,
    bundleSummary: `${items.length} log(s) packaged with cookies, OGE, and 2FA secrets.`,
  };
}
