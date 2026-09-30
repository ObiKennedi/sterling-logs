import fs from "fs";
import path from "path";
import { InventoryProduct } from "@/types/inventory";

export interface WorkingToolItem {
  id: string;
  name: string;
  description: string;
  link: string;
  category: "working_tools";
  platform: string;
  price: number;
  currency: string;
  stock: number; // Number of pieces
  tags: string[];
  createdAt: string;
}

const DEFAULT_TOOLS: WorkingToolItem[] = [];

// Storage file resolution
function getStorageFilePath(): string {
  return path.join(process.cwd(), "data", "working-tools.json");
}

let inMemoryCache: WorkingToolItem[] | null = null;

export async function getWorkingTools(): Promise<WorkingToolItem[]> {
  if (inMemoryCache !== null) {
    return inMemoryCache;
  }

  const filePath = getStorageFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        inMemoryCache = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn("[WorkingTools] Could not read from storage file:", error);
  }

  // Fallback to empty list
  inMemoryCache = [];
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(inMemoryCache, null, 2), "utf-8");
  } catch (err) {
    console.warn("[WorkingTools] Could not write tools file:", err);
  }

  return inMemoryCache;
}

export async function getWorkingToolById(id: string): Promise<WorkingToolItem | null> {
  const tools = await getWorkingTools();
  return tools.find((t) => t.id === id) || null;
}

export async function saveWorkingTool(toolInput: {
  name: string;
  link: string;
  description?: string;
  price?: number;
  stock?: number;
  tags?: string[];
  platform?: string;
}): Promise<WorkingToolItem> {
  const currentTools = await getWorkingTools();

  // Normalize link: if starts with @ convert to https://t.me/
  let cleanLink = toolInput.link.trim();
  if (cleanLink.startsWith("@")) {
    cleanLink = `https://t.me/${cleanLink.slice(1)}`;
  } else if (!cleanLink.startsWith("http://") && !cleanLink.startsWith("https://")) {
    if (cleanLink.includes("t.me/") || cleanLink.includes("telegram.me/")) {
      cleanLink = `https://${cleanLink}`;
    } else {
      cleanLink = `https://t.me/${cleanLink}`;
    }
  }

  // Randomly assign a number of pieces if not specified by admin
  const randomPieces = Math.floor(Math.random() * 26) + 14; // Between 14 and 40 pieces
  const pieces =
    toolInput.stock !== undefined && Number(toolInput.stock) > 0
      ? Number(toolInput.stock)
      : randomPieces;

  // Admin decides price (defaults to 5000 if not specified)
  const price = toolInput.price !== undefined ? Math.max(0, Number(toolInput.price)) : 5000;

  const newTool: WorkingToolItem = {
    id: `tool_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: toolInput.name.trim(),
    description:
      toolInput.description?.trim() ||
      "Direct Telegram bot for automated account and session management.",
    link: cleanLink,
    category: "working_tools",
    platform: toolInput.platform?.trim() || "Telegram Bot",
    price,
    currency: "₦",
    stock: pieces,
    tags:
      toolInput.tags && toolInput.tags.length > 0
        ? toolInput.tags
        : ["Telegram Bot", "Direct Tool", "Verified"],
    createdAt: new Date().toISOString(),
  };

  const updatedTools = [newTool, ...currentTools];
  inMemoryCache = updatedTools;

  const filePath = getStorageFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(updatedTools, null, 2), "utf-8");
  } catch (err) {
    console.warn("[WorkingTools] Could not persist tool to file system:", err);
  }

  return newTool;
}

export async function decrementToolStock(toolId: string, quantity: number = 1): Promise<boolean> {
  const currentTools = await getWorkingTools();
  const index = currentTools.findIndex((t) => t.id === toolId);
  if (index === -1) return false;

  const updated = [...currentTools];
  const newStock = Math.max(0, (updated[index].stock || 0) - quantity);
  updated[index] = { ...updated[index], stock: newStock };
  inMemoryCache = updated;

  const filePath = getStorageFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("[WorkingTools] Could not save decremented stock:", err);
  }

  return true;
}

export async function deleteWorkingTool(id: string): Promise<boolean> {
  const currentTools = await getWorkingTools();
  const filtered = currentTools.filter((t) => t.id !== id);

  if (filtered.length === currentTools.length) {
    return false;
  }

  inMemoryCache = filtered;
  const filePath = getStorageFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.warn("[WorkingTools] Could not update storage file upon delete:", err);
  }

  return true;
}

/**
 * Maps working tools to public InventoryProduct shape.
 * CRITICAL SECURITY & BUSINESS RULE:
 * The link is NOT included in the public inventory response.
 * Users only receive the link inside their Vault AFTER purchasing.
 */
export function workingToolsToInventory(tools: WorkingToolItem[]): InventoryProduct[] {
  return tools.map((tool) => ({
    id: tool.id,
    title: tool.name,
    category: "working_tools",
    itemType: "tool",
    platform: tool.platform || "Telegram Bot",
    year: "2026",
    followers: `${tool.stock} pieces`,
    tags: tool.tags || ["Telegram Bot", "Direct Access"],
    originalPrice: Math.round(tool.price * 1.3),
    sellingPrice: tool.price,
    currency: tool.currency || "₦",
    stock: tool.stock, // pieces available
    isPopular: true,
    format: "Telegram Bot Link",
    warrantyHours: 24,
    verificationSnippet: "🔒 Unlocked & delivered to Vault upon purchase",
    description: tool.description,
    // Do NOT expose public link before purchase
    link: undefined,
    raw: {
      isTelegramBot: true,
      pieces: tool.stock,
      requiresPurchase: true,
    },
  }));
}
