import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } | Promise<{ slug: string }> },
) {
  const p = await params;
  return NextResponse.json({
    ok: true,
    route: "/api/categories/[slug]",
    slug: p.slug,
    articles: [],
  });
}
