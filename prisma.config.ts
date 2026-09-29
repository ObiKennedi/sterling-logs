import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.local first, then fallback to .env
config({ path: ".env.local" });
config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
