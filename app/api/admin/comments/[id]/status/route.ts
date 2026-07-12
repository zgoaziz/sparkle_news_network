import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { commentsTable } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getAuthErrorResponse() {
  return NextResponse.json(
    { ok: false, message: "Unauthorized" },
    { status: 401 },
  );
}

function getForbiddenResponse() {
  return NextResponse.json(
    { ok: false, message: "Forbidden" },
    { status: 403 },
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    const user = getAuthUser(req);
    if (!user?.userId) {
      return getAuthErrorResponse();
    }
    if (user.role !== "admin" && user.role !== "editor") {
      return getForbiddenResponse();
    }

    const body = await req.json();
    const status = body?.status;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { ok: false, message: "Statut invalide" },
        { status: 400 },
      );
    }

    await connectDB();
    const updated = await commentsTable
      .findByIdAndUpdate(p.id, { status, updatedAt: new Date() }, { new: true })
      .lean()
      .exec();

    const updatedComment = updated as any;
    if (!updatedComment) {
      return NextResponse.json(
        { ok: false, message: "Commentaire introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Statut mis à jour",
      comment: {
        id: updatedComment._id?.toString?.() || updatedComment.id,
        status: updatedComment.status,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/comments/[id]/status error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la mise à jour du commentaire" },
      { status: 500 },
    );
  }
}
