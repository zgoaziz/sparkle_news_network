import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sponsorsTable } from "@/lib/db/schema";

type SponsorDocument = {
  isActive?: boolean;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string | string[]>> },
) {
  try {
    const p = await params;
    const id =
      typeof p.id === "string" ? p.id : Array.isArray(p.id) ? p.id[0] : "";
    await connectDB();
    const sponsor = (await sponsorsTable
      .findById(id)
      .lean()
      .exec()) as SponsorDocument | null;
    if (!sponsor) {
      return NextResponse.json(
        { ok: false, message: "Sponsor introuvable." },
        { status: 404 },
      );
    }

    const updated = (await sponsorsTable
      .findByIdAndUpdate(
        id,
        { isActive: !sponsor.isActive, updatedAt: new Date() },
        { new: true },
      )
      .lean()
      .exec()) as SponsorDocument | null;

    return NextResponse.json({
      ok: true,
      route: "/api/admin/sponsors/[id]/toggle",
      id,
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
