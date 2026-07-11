import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/admin/categories/[id]",
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
    route: "/api/admin/categories/[id]",
    deleted: true,
    id: p.id,
  });
}
