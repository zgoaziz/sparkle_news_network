import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sponsorsTable } from "@/lib/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    const sponsor = (await sponsorsTable.findById(p.id).lean().exec()) as any;
    if (!sponsor) {
      return NextResponse.json(
        { ok: false, message: "Sponsor introuvable." },
        { status: 404 },
      );
    }

    const updated = (await sponsorsTable
      .findByIdAndUpdate(
        p.id,
        { isActive: !sponsor.isActive, updatedAt: new Date() },
        { new: true },
      )
      .lean()
      .exec()) as any;

    return NextResponse.json({
      ok: true,
      route: "/api/admin/sponsors/[id]/toggle",
      id: p.id,
      isActive: updated?.isActive ?? false,
    });
  } catch (error) {
    console.error("PATCH /api/admin/sponsors/[id]/toggle error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors du changement d'état du sponsor.",
      },
      { status: 500 },
    );
  }
}
