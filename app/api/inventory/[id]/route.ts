import { NextRequest, NextResponse } from "next/server";
import { getLogProvider } from "@/lib/providers";
import { ApiResponse, InventoryProduct } from "@/types/inventory";
import { getWorkingTools, workingToolsToInventory } from "@/lib/storage/workingTools";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check working tools first
    const workingTools = await getWorkingTools();
    const toolProducts = workingToolsToInventory(workingTools);
    const foundTool = toolProducts.find((t) => t.id === id);

    if (foundTool) {
      return NextResponse.json(
        {
          success: true,
          data: foundTool,
          source: "database",
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

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
