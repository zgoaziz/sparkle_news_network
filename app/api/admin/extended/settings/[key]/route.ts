import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } | Promise<{ key: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/admin-extended/settings/[key]",
    key: p.key,
  });
}
