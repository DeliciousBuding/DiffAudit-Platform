import { NextResponse } from "next/server";
import { DEMO_ATTACK_DEFENSE_ROWS } from "@/lib/demo-snapshot";

export const dynamic = "force-dynamic";

/** GET /api/demo/attack-defense-table — returns demo snapshot results */
export async function GET() {
  return NextResponse.json({ rows: DEMO_ATTACK_DEFENSE_ROWS });
}
