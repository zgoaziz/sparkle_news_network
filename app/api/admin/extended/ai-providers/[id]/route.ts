import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/admin-extended/ai-providers/[id]",
    updated: true,
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
    route: "/api/admin-extended/ai-providers/[id]",
    deleted: true,
    id: p.id,
  });
}
