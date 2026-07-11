import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/admin-extended/social-accounts",
    accounts: [],
  });
}

export async function POST(req: Request) {
  return NextResponse.json({
    ok: true,
    route: "/api/admin-extended/social-accounts",
    created: true,
  });
}
