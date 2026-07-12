import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    const user = getAuthUser(req);

    if (!user?.userId) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const data = await req.json();
    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof data?.role === "string") {
      update.role = data.role;
    }

    if (typeof data?.status === "string") {
      update.status = data.status;
    }

    const updated = (await usersTable
      .findByIdAndUpdate(p.id, update, { new: true })
      .lean()
      .exec()) as any;

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Utilisateur mis à jour",
      user: {
        id: updated._id?.toString() || updated.id,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  return PATCH(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    const user = getAuthUser(req);

    if (!user?.userId) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const deleted = (await usersTable
      .findByIdAndDelete(p.id)
      .lean()
      .exec()) as any;

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Utilisateur supprimé",
      id: p.id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 },
    );
  }
}
