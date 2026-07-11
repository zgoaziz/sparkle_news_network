import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sponsorsTable } from "@/lib/db/schema";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    const data = await req.json();
    const updated = await sponsorsTable
      .findByIdAndUpdate(
        p.id,
        { ...data, updatedAt: new Date() },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Sponsor introuvable." },
        { status: 404 },
      );
    }

    const sponsorData = updated as any;
    return NextResponse.json({
      ok: true,
      route: "/api/admin/sponsors/[id]",
      updated: true,
      sponsor: { id: sponsorData._id.toString(), ...sponsorData },
    });
  } catch (error) {
    console.error("PUT /api/admin/sponsors/[id] error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la mise à jour du sponsor.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    await sponsorsTable.findByIdAndDelete(p.id).exec();
    return NextResponse.json({
      ok: true,
      route: "/api/admin/sponsors/[id]",
      deleted: true,
      id: p.id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/sponsors/[id] error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la suppression du sponsor.",
      },
      { status: 500 },
    );
  }
}
