import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { favoritesTable } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  {
    params,
  }: { params: { articleId: string } | Promise<{ articleId: string }> },
) {
  try {
    await connectDB();
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or missing token" },
        { status: 401 },
      );
    }

    const p = await params;
    await favoritesTable.findOneAndUpdate(
      { userId: authUser.userId, articleId: p.articleId },
      {
        $setOnInsert: {
          userId: authUser.userId,
          articleId: p.articleId,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ message: "Added to favorites" });
  } catch (err) {
    console.error("POST /api/favorites/[articleId] error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Impossible d'ajouter aux favoris.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: { params: { articleId: string } | Promise<{ articleId: string }> },
) {
  try {
    await connectDB();
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or missing token" },
        { status: 401 },
      );
    }

    const p = await params;
    await favoritesTable
      .deleteOne({ userId: authUser.userId, articleId: p.articleId })
      .exec();

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("DELETE /api/favorites/[articleId] error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Impossible de supprimer des favoris.",
      },
      { status: 500 },
    );
  }
}
