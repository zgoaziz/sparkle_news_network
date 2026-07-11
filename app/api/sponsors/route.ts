import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { sponsorsTable } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement");

    const filter: any = {};
    if (placement && placement !== "all") {
      // Match sponsors for this placement or "both"
      filter.$or = [{ placement }, { placement: "both" }];
    }

    const sponsors = await sponsorsTable
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const result = sponsors.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      content: s.content,
      linkUrl: s.linkUrl ?? null,
      imageUrl: s.imageUrl ?? null,
      placement: s.placement,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET sponsors error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
