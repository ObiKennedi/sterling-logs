import { LogProvider } from "./types";
import { MockLogProvider } from "./mockProvider";
import { ExternalApiAdapter } from "./externalApiAdapter";

export * from "./types";
export * from "./mockProvider";
export * from "./externalApiAdapter";

let cachedKey: string | null = null;
let cachedUrl: string | null = null;
let cachedProvider: LogProvider | null = null;

/**
 * Resolves the inventory provider.
 * Automatically checks for any changes to EXTERNAL_API_KEY or EXTERNAL_API_BASE_URL.
 * If you update the key in .env.local, it immediately creates a new adapter
 * and pulls the new inventory on the next request.
 */
export function getLogProvider(): LogProvider {
  const explicitMode = process.env.LOGS_API_PROVIDER?.toLowerCase();
  const apiKey = (
    process.env.EXTERNAL_API_KEY ||
    process.env.IFECO_API_KEY ||
    ""
  ).trim();
  const baseUrl = (
    process.env.EXTERNAL_API_BASE_URL ||
    "https://ifecologs.com/api"
  ).trim();

  // If already instantiated with the exact same credentials, return cached
  if (cachedProvider && cachedKey === apiKey && cachedUrl === baseUrl) {
    return cachedProvider;
  }

  // Update tracking credentials
  cachedKey = apiKey;
  cachedUrl = baseUrl;

  // If explicit mode is mock, force mock
  if (explicitMode === "mock" && !apiKey) {
    console.log("[LogProvider] Safe Naira Mock Provider Active.");
    cachedProvider = new MockLogProvider();
    return cachedProvider;
  }

  // If user has provided an API key in env, immediately pull live logs & prices!
  if (apiKey.length > 0) {
    console.log(
      `[LogProvider] ⚡ API Key detected (${apiKey.substring(0, 8)}...)! Connecting to live provider at: ${baseUrl}`
    );
    cachedProvider = new ExternalApiAdapter({ apiKey, baseUrl });
    return cachedProvider;
  }

  // Fallback to safe mock
  console.log("[LogProvider] Running in Safe Naira Mode (No external API key set yet).");
  cachedProvider = new MockLogProvider();
  return cachedProvider;
}

export const logProvider = getLogProvider();
