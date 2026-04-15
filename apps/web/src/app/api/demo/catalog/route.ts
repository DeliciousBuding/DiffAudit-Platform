import { NextResponse } from "next/server";
import { DEMO_CATALOG_ENTRIES } from "@/lib/demo-snapshot";

export const dynamic = "force-dynamic";

/** GET /api/demo/catalog — returns demo snapshot catalog data */
export async function GET() {
  return NextResponse.json(DEMO_CATALOG_ENTRIES);
}
