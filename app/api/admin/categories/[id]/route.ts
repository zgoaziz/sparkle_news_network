import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { articlesTable, categoriesTable } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    const category = (await categoriesTable
      .findById(p.id)
      .lean()
      .exec()) as any;

    if (!category) {
      return NextResponse.json(
        { ok: false, message: "Catégorie introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, category });
  } catch (error) {
    console.error("GET /api/admin/categories/[id] error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la récupération de la catégorie" },
      { status: 500 },
    );
  }
}

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
    const updated = await categoriesTable
      .findByIdAndUpdate(
        p.id,
        { ...data, updatedAt: new Date() },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Catégorie introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Catégorie mise à jour",
      category: updated,
    });
  } catch (error) {
    console.error("PUT /api/admin/categories/[id] error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la mise à jour de la catégorie" },
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

    const objectId = new Types.ObjectId(p.id);
    await articlesTable.updateMany(
      { categoryId: objectId },
      { $unset: { categoryId: "" }, updatedAt: new Date() },
    );

    const deleted = await categoriesTable.findByIdAndDelete(p.id).lean().exec();

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "Catégorie introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Catégorie supprimée",
      id: p.id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/categories/[id] error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la suppression de la catégorie" },
      { status: 500 },
    );
  }
}
