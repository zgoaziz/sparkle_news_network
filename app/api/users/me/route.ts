import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const payload = getAuthUser(req);

    if (!payload?.userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or missing token" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, avatar } = body || {};

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof name === "string" && name.trim()) {
      update.name = name.trim();
    }
    if (typeof avatar === "string") {
      update.avatar = avatar || null;
    }

    const updatedUser = (await usersTable
      .findByIdAndUpdate(payload.userId, update, { new: true })
      .lean()
      .exec()) as any;

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Not Found", message: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("PATCH /api/users/me error", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Erreur lors de la mise à jour du profil.",
      },
      { status: 500 },
    );
  }
}
