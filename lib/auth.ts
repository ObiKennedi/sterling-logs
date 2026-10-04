import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

const hasValidDbUrl =
  Boolean(process.env.DATABASE_URL) &&
  !process.env.DATABASE_URL?.includes("YOUR_NEON_PASSWORD") &&
  !process.env.DATABASE_URL?.includes("YOUR_PASSWORD");

export const auth = betterAuth({
  ...(hasValidDbUrl
    ? {
        database: prismaAdapter(prisma, {
          provider: "postgresql",
        }),
      }
    : {}),
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "sterling-logs-secret-encryption-key-min-32-chars-long",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        returned: true,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID),
    },
  },
});
