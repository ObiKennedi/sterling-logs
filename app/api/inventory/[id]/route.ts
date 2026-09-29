import { NextRequest, NextResponse } from "next/server";
import { getLogProvider } from "@/lib/providers";
import { ApiResponse, InventoryProduct } from "@/types/inventory";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const provider = getLogProvider();
    const product = await provider.getProduct(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Product with ID '${id}' not found`,
          source: provider.isMock ? "mock" : "external",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const responsePayload: ApiResponse<InventoryProduct> = {
      success: true,
      data: product,
      source: provider.isMock ? "mock" : "external",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve product details";

    return NextResponse.json(
      {
        success: false,
        error: message,
        source: "mock",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
