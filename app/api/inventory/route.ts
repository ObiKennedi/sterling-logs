import { NextRequest, NextResponse } from "next/server";
import { getLogProvider } from "@/lib/providers";
import { AccountCategory, ApiResponse, InventoryProduct } from "@/types/inventory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") as AccountCategory) || undefined;

    const provider = getLogProvider();
    const products = await provider.getProducts(category);

    const responsePayload: ApiResponse<InventoryProduct[]> = {
      success: true,
      data: products,
      source: provider.isMock ? "mock" : "external",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve inventory";

    const responsePayload: ApiResponse<InventoryProduct[]> = {
      success: false,
      error: message,
      source: "mock",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload, { status: 500 });
  }
}
