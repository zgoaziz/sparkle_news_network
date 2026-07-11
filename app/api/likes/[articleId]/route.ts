import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  {
    params,
  }: { params: { articleId: string } | Promise<{ articleId: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/likes/[articleId]/POST",
    articleId: p.articleId,
  });
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: { params: { articleId: string } | Promise<{ articleId: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/likes/[articleId]/DELETE",
    articleId: p.articleId,
  });
}
