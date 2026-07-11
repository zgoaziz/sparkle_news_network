import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { commentsTable, usersTable, articlesTable } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 15, 50);
    const offset = (page - 1) * limit;
    const status = searchParams.get("status") || undefined;

    const conditions: any = {};
    if (status && status !== "all") {
      conditions.status = status;
    }

    const comments = await commentsTable
      .find(conditions)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("userId", "name avatar")
      .populate("articleId", "title")
      .lean()
      .exec();

    const total = await commentsTable.countDocuments(conditions);

    const formattedComments = comments.map((comment: any) => ({
      id: comment._id.toString(),
      content: comment.content,
      status: comment.status,
      articleId:
        comment.articleId?._id?.toString() ||
        comment.articleId?.toString() ||
        "",
      articleTitle: comment.articleId?.title || null,
      author: {
        name: comment.userId?.name || "Utilisateur inconnu",
        avatar: comment.userId?.avatar || null,
      },
      createdAt: comment.createdAt,
    }));

    return NextResponse.json({
      ok: true,
      route: "/api/admin/comments",
      comments: formattedComments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/comments error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la récupération des commentaires.",
      },
      { status: 500 },
    );
  }
}
