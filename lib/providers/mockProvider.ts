import {
  InventoryProduct,
  UserProfile,
  OrderRequest,
  OrderResult,
  AccountCategory,
  DeliveredItem,
  PaymentGateway,
} from "@/types/inventory";
import { LogProvider } from "./types";
import { sendOrderDeliveryEmail } from "@/lib/services/emailDelivery";

/**
 * Realistic mock products in Nigerian Naira (₦ NGN)
 * with 50% calculated reseller markup.
 */
const MOCK_PRODUCTS: InventoryProduct[] = [
  {
    id: "ig-2018-pva",
    title: "2018 Aged PVA Profile",
    category: "instagram",
    platform: "Instagram",
    year: "2018",
    followers: "14.8k Organic",
    tags: ["Original Email (OGE)", "Cookies .JSON", "2FA Backup Keys", "Clean Bio"],
    originalPrice: 18000,
    sellingPrice: 27000,
    currency: "₦",
    stock: 8,
    isPopular: true,
    format: "SESSION_COOKIE_NETSCAPE + 2FA",
    warrantyHours: 24,
    description:
      "Aged 2018 Instagram personal creator log with high trust factor, zero restrictions, and organic audience engagement. Comes with full Netscape cookie export and ProtonMail OGE access.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        created_year: 2018,
        auth_type: "SESSION_COOKIE_NETSCAPE",
        sessionid: "5892182049%3ANb87xY...",
        csrftoken: "fK992xJk28a...",
        email_domain: "proton.me (OGE)",
        follower_audit: "92% Tier 1 (US/UK)",
        escrow_guarantee: "24h Full Replacement",
      },
      null,
      2
    ),
  },
  {
    id: "x-2017-pva",
    title: "2017 High-Trust PVA Account",
    category: "twitter",
    platform: "Twitter / X",
    year: "2017",
    followers: "8.4k Followers",
    tags: ["Auth Token Included", "Phone Verified", "OGE Access", "Zero Strikes"],
    originalPrice: 16000,
    sellingPrice: 24000,
    currency: "₦",
    stock: 12,
    isPopular: false,
    format: "AUTH_TOKEN + CT0 + USER_PASS",
    warrantyHours: 24,
    description:
      "High authority 2017 X account ideal for crypto marketing, tech commentary, and direct engagement without rate limits or shadowbans.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        created_year: 2017,
        auth_token: "a190b2308f92194389ff70...",
        ct0: "0c9d78e34a21...",
        phone_verified: true,
        blue_eligible: true,
        escrow_guarantee: "24h Full Replacement",
      },
      null,
      2
    ),
  },
  {
    id: "tt-2021-creator",
    title: "2021 Aged Creator Profile",
    category: "tiktok",
    platform: "TikTok",
    year: "2021",
    followers: "24.6k Organic",
    tags: ["Live Stream Enabled", "US Region IP", "Cookies + Pass", "Instant Access"],
    originalPrice: 26000,
    sellingPrice: 39000,
    currency: "₦",
    stock: 4,
    isPopular: true,
    format: "SESSION_TOKEN + COOKIES",
    warrantyHours: 24,
    description:
      "Pre-warmed 2021 TikTok account with Live Studio unlocked, eligible for TikTok Shop Affiliate and Creator Rewards program.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        created_year: 2021,
        region: "US_TIER_1",
        session_token: "tt_act_9041a77...",
        live_studio_unlocked: true,
        creator_fund_ready: true,
        escrow_guarantee: "24h Full Replacement",
      },
      null,
      2
    ),
  },
  {
    id: "fb-2019-bm",
    title: "2019 Aged BM + High Limit",
    category: "facebook",
    platform: "Facebook Meta",
    year: "2019",
    followers: "Verified Profile",
    tags: ["$250/Day Spend Limit", "2FA Active", "Warm Activity", "Pixel Ready"],
    originalPrice: 28000,
    sellingPrice: 42000,
    currency: "₦",
    stock: 6,
    isPopular: false,
    format: "C_USER + XS_COOKIE + 2FA_KEY",
    warrantyHours: 48,
    description:
      "Aged Facebook profile tied to established Business Manager with high daily advertising budget threshold. Ready for instant ad campaign launching.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        bm_status: "VERIFIED_BUSINESS_TIER_2",
        c_user: "100084920194832",
        xs_cookie: "29%3AmqP18_valid...",
        spend_limit_daily: "$250.00 USD",
        escrow_guarantee: "48h Full Replacement",
      },
      null,
      2
    ),
  },
  {
    id: "reddit-2016-karma",
    title: "2016 Veteran 48k+ Karma",
    category: "reddit",
    platform: "Reddit",
    year: "2016",
    followers: "48.2k Karma",
    tags: ["Post & Comment Karma", "OGE Included", "Post in any Subreddit", "No Shadowban"],
    originalPrice: 15000,
    sellingPrice: 22500,
    currency: "₦",
    stock: 5,
    isPopular: true,
    format: "USER_PASS + SESSION_COOKIE + OGE",
    warrantyHours: 24,
    description:
      "Ultra-high trust 2016 Reddit account with 31k link karma and 17k comment karma. Verified email on ProtonMail. Can post anywhere with zero karma gate restrictions.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        created_year: 2016,
        post_karma: 31200,
        comment_karma: 17000,
        c_session: "rd_sess_0921a44...",
        shadowban_check: "CLEAN_PASSED",
        escrow_guarantee: "24h Full Replacement",
      },
      null,
      2
    ),
  },
  {
    id: "tg-2020-channel",
    title: "2020 Aged Channel + Session",
    category: "telegram",
    platform: "Telegram",
    year: "2020",
    followers: "12.4k Members",
    tags: ["tdata + .session", "Desktop & Mobile", "Clean Channel", "Transfer Ownership"],
    originalPrice: 20000,
    sellingPrice: 30000,
    currency: "₦",
    stock: 3,
    isPopular: false,
    format: "TDATA + SESSION_FILE",
    warrantyHours: 24,
    description:
      "Aged 2020 Telegram public group & channel with established history, active members, and ownership transfer capability upon purchase.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        format: "TDATA_AND_SESSION",
        members_count: 12400,
        phone_prefix: "+1_USA_PVA",
        channel_created: 2020,
        escrow_guarantee: "24h Full Replacement",
      },
      null,
      2
    ),
  },
  {
    id: "proxy-us-res-10gb",
    title: "10GB Clean US Static Residential Proxy",
    category: "proxies",
    itemType: "proxy",
    platform: "Residential Proxy",
    year: "30-Day",
    followers: "Static US AT&T IP",
    tags: ["SOCKS5 & HTTP(S)", "Zero Fraud Score", "AT&T Residential ISP", "Unlimited Threads"],
    originalPrice: 12000,
    sellingPrice: 18000,
    currency: "₦",
    stock: 25,
    isPopular: true,
    format: "HOST:PORT:USER:PASS",
    warrantyHours: 72,
    description:
      "Dedicated clean static US residential proxy from AT&T ISP. Zero fraud score for unbannable session logins, Facebook Ads manager, and automated web operations.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        proxy_type: "STATIC_RESIDENTIAL_ISP",
        carrier: "AT&T Internet Services",
        country: "US (Virginia)",
        protocols: ["HTTP", "HTTPS", "SOCKS5"],
        fraud_score: "0 (Clean)",
        escrow_guarantee: "72h Replacement Warranty",
      },
      null,
      2
    ),
  },
  {
    id: "rdp-usa-win11-8gb",
    title: "USA Windows 11 Admin RDP (8GB / 4 Core)",
    category: "rdp",
    itemType: "rdp",
    platform: "Windows RDP Server",
    year: "30-Day",
    followers: "Clean US IP • 1Gbps",
    tags: ["Full Root / Admin Access", "1 Gbps Port Speed", "SSD NVMe Storage", "Anti-detect Ready"],
    originalPrice: 22000,
    sellingPrice: 33000,
    currency: "₦",
    stock: 9,
    isPopular: true,
    format: "IP:PORT:USER:PASS",
    warrantyHours: 48,
    description:
      "High-speed dedicated clean IP Windows 11 RDP hosted in US datacenters. Pre-installed with anti-detect tools, Chrome, and high-frequency network optimization.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        os: "Windows 11 Pro Enterprise",
        ram: "8 GB DDR4",
        cpu_cores: 4,
        bandwidth: "Unlimited @ 1Gbps",
        admin_privileges: true,
        escrow_guarantee: "48h Full Replacement",
      },
      null,
      2
    ),
  },
  {
    id: "gv-usa-permanent-pva",
    title: "Google Voice Permanent +1 USA Number",
    category: "numbers",
    itemType: "number",
    platform: "Virtual Phone / GV",
    year: "Permanent",
    followers: "Permanent +1 USA",
    tags: ["Instant SMS & Call OTP", "Recovery Email Included", "PVA Verified", "Zero Monthly Fee"],
    originalPrice: 9000,
    sellingPrice: 13500,
    currency: "₦",
    stock: 30,
    isPopular: false,
    format: "GMAIL:PASS:RECOVERY:PHONE",
    warrantyHours: 24,
    description:
      "Permanent USA Google Voice virtual phone number. Perfect for WhatsApp, Telegram, PayPal, Tinder, and bank OTP SMS verifications with instant code reception.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        line_type: "VOIP_PVA_US",
        carrier: "Google Voice Bandwidth.com",
        sms_enabled: true,
        voice_calls: true,
        escrow_guarantee: "24h Replacement",
      },
      null,
      2
    ),
  },
  {
    id: "soft-dolphin-anty-100",
    title: "Dolphin{anty} 100 Anti-Fingerprint Profiles",
    category: "software",
    itemType: "software",
    platform: "Automation Software",
    year: "Active",
    followers: "100 Profiles",
    tags: ["Fingerprint Spoofing", "Proxy Manager Built-in", "Cookie Importer", "Team Sharing"],
    originalPrice: 20000,
    sellingPrice: 30000,
    currency: "₦",
    stock: 14,
    isPopular: false,
    format: "ACTIVATION_KEY + USER_PORTAL",
    warrantyHours: 48,
    description:
      "Premium anti-detect browser environment with 100 isolated browser profiles. Mimics real hardware, canvas, webgl, and audio fingerprints for multi-account management.",
    verificationSnippet: JSON.stringify(
      {
        status: "VERIFIED_ACTIVE",
        currency: "NGN",
        tool_name: "Dolphin{anty} Anti-Detect",
        profiles_limit: 100,
        automation_api: "Puppeteer / Playwright Ready",
        escrow_guarantee: "48h Full Replacement",
      },
      null,
      2
    ),
  },
];

const MOCK_PROFILE: UserProfile = {
  id: "usr_mock_sterling_master",
  username: "Sterling_Admin",
  email: "ops@sterlinglogs.com",
  balance: 350000.0,
  currency: "₦",
  role: "verified_buyer",
  totalOrders: 42,
};

const simulatedOrders = new Map<string, OrderResult>();

export class MockLogProvider implements LogProvider {
  public readonly name = "Safe Naira Engine (Offline Mode)";
  public readonly isMock = true;

  async getProfile(): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { ...MOCK_PROFILE };
  }

  async getProducts(category?: AccountCategory): Promise<InventoryProduct[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    if (!category || category === "all") {
      return [...MOCK_PRODUCTS];
    }
    return MOCK_PRODUCTS.filter((item) => item.category === category);
  }

  async getProduct(id: string): Promise<InventoryProduct | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  async placeOrder(order: OrderRequest): Promise<OrderResult> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const product = MOCK_PRODUCTS.find((p) => p.id === order.productId);
    const title = product ? product.title : `Social Media Log #${order.productId}`;
    const unitPrice = product ? product.sellingPrice : 25000;
    const qty = Math.max(1, order.quantity || 1);
    const totalPrice = unitPrice * qty;

    const orderId = `STL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const gateway: PaymentGateway = order.paymentGateway || "gtb";
    const paymentRef =
      gateway === "gtb"
        ? `GTB-${orderId}-${Date.now().toString().slice(-4)}`
        : `PP-${orderId}-${Date.now().toString().slice(-4)}`;

    const isProxy = order.productId.includes("proxy") || (product?.category === "proxies");
    const isRdp = order.productId.includes("rdp") || (product?.category === "rdp");
    const isNumber = order.productId.includes("gv") || order.productId.includes("number") || (product?.category === "numbers");
    const isSoftware = order.productId.includes("soft") || (product?.category === "software");

    const deliveryItems: DeliveredItem[] = Array.from({ length: qty }).map(
      (_, index) => {
        if (isProxy) {
          return {
            id: `proxy_${orderId}_${index + 1}`,
            username: `stl_att_${Math.random().toString(36).substring(2, 7)}`,
            credentials: `us-res.sterlinglogs.net:9050:stl_att_${Math.random().toString(36).substring(2, 7)}:Pass_${Math.random().toString(36).substring(2, 8)}`,
            token: `socks5://us-res.sterlinglogs.net:9050`,
          };
        } else if (isRdp) {
          const ip = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;
          return {
            id: `rdp_${orderId}_${index + 1}`,
            username: "Administrator",
            credentials: `${ip}:3389 | Administrator | Win11_Admin_${Math.random().toString(36).substring(2, 8)}!`,
            token: `mstsc.exe /v:${ip}`,
          };
        } else if (isNumber) {
          const phone = `+1 (202) 555-01${Math.floor(Math.random() * 89 + 10)}`;
          return {
            id: `num_${orderId}_${index + 1}`,
            username: phone,
            credentials: `gv_account_${Math.random().toString(36).substring(2, 6)}@gmail.com:Pass_${Math.random().toString(36).substring(2, 8)}! | Recovery: sec_backup@proton.me`,
            token: phone,
          };
        } else if (isSoftware) {
          return {
            id: `soft_${orderId}_${index + 1}`,
            username: "DolphinAnty_License",
            credentials: `LICENSE_KEY: DLPH-PRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()} | Download: https://dolphin-anty.com`,
            token: `DLPH-PRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          };
        }
        return {
          id: `log_${orderId}_${index + 1}`,
          username: `user_${Math.random().toString(36).substring(2, 8)}`,
          credentials: `login:stl_pass_${Math.random().toString(36).substring(2, 9)}!`,
          token: `auth_tok_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`,
          cookies: `[{"domain":".target.com","name":"session_id","value":"${Math.random().toString(36).substring(2, 16)}","path":"/","secure":true}]`,
          ogeEmail: `backup_${Math.random().toString(36).substring(2, 6)}@proton.me:Pass_${Math.random().toString(36).substring(2, 8)}!`,
          twoFactorSecret: "JBSWY3DPEHPK3PXP",
        };
      }
    );

    // Trigger instant email delivery bundle to the buyer's email address
    const emailStatus = await sendOrderDeliveryEmail({
      recipientEmail: order.customerEmail || "buyer@sterlinglogs.com",
      orderId,
      product: product || {
        title,
        platform: "Social Platform",
        warrantyHours: 24,
      },
      items: deliveryItems,
      totalPrice,
      paymentGateway: gateway,
      paymentReference: paymentRef,
    });

    const result: OrderResult = {
      orderId,
      productId: order.productId,
      productTitle: title,
      quantity: qty,
      totalPrice,
      currency: "₦",
      paymentGateway: gateway,
      paymentReference: paymentRef,
      status: "ESCROW_ACTIVE",
      escrowHours: 24,
      deliveryItems,
      emailDelivery: emailStatus,
      createdAt: now.toISOString(),
      escrowExpiresAt: expiresAt.toISOString(),
    };

    simulatedOrders.set(orderId, result);
    return result;
  }

  async getOrder(orderId: string): Promise<OrderResult | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return simulatedOrders.get(orderId) || null;
  }
}
