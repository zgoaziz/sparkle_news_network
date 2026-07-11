import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/comments/[id]",
    articleId: p.id,
    comments: [],
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/comments/[id]",
    id: p.id,
  });
}
