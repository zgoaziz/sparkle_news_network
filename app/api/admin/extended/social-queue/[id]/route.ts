import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/admin-extended/social-queue/[id]",
    id: p.id,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/admin-extended/social-queue/[id]",
    deleted: true,
    id: p.id,
  });
}
