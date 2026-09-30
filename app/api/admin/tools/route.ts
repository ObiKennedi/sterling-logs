import { NextRequest, NextResponse } from "next/server";
import {
  getWorkingTools,
  saveWorkingTool,
  deleteWorkingTool,
} from "@/lib/storage/workingTools";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tools = await getWorkingTools();
    return NextResponse.json({
      success: true,
      data: tools,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load working tools";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, link, description, price, stock, tags, platform } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Tool name is required." },
        { status: 400 }
      );
    }

    if (!link || typeof link !== "string" || !link.trim()) {
      return NextResponse.json(
        { success: false, error: "Telegram bot link or tool URL is required." },
        { status: 400 }
      );
    }

    const createdTool = await saveWorkingTool({
      name,
      link,
      description,
      price: price !== undefined && price !== "" ? Number(price) : 5000,
      stock: stock !== undefined && stock !== "" && Number(stock) > 0 ? Number(stock) : undefined,
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : ["Telegram Bot", "Direct Access"],
      platform: platform || "Telegram Bot",
    });

    return NextResponse.json({
      success: true,
      data: createdTool,
      message: `Tool "${createdTool.name}" successfully added to Working Tools!`,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to save tool";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Tool ID is required for deletion." },
        { status: 400 }
      );
    }

    const deleted = await deleteWorkingTool(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Tool with ID "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tool successfully removed.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete tool";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
