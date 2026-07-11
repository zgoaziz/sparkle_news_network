import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  favoritesTable,
  articlesTable,
  categoriesTable,
  usersTable,
} from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or missing token" },
        { status: 401 },
      );
    }

    const favorites = await favoritesTable
      .find({ userId: authUser.userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (favorites.length === 0) {
      return NextResponse.json([]);
    }

    const articleIds = favorites.map((f: any) => f.articleId);
    const articles = await articlesTable
      .find({ _id: { $in: articleIds } })
      .lean()
      .exec();

    const categoryIds = [
      ...new Set(articles.map((a: any) => a.categoryId).filter(Boolean)),
    ];
    const categories =
      categoryIds.length > 0
        ? await categoriesTable
            .find({ _id: { $in: categoryIds } })
            .lean()
            .exec()
        : [];

    const authorIds = [...new Set(articles.map((a: any) => a.authorId))];
    const authors =
      authorIds.length > 0
        ? await usersTable
            .find({ _id: { $in: authorIds } })
            .select("name avatar")
            .lean()
            .exec()
        : [];

    const catMap = Object.fromEntries(
      categories.map((c: any) => [c._id.toString(), c]),
    );
    const authorMap = Object.fromEntries(
      authors.map((a: any) => [a._id.toString(), a]),
    );

    const summaries = articles.map((a: any) => ({
      id: a._id.toString(),
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      coverImage: a.coverImage,
      publishedAt: a.publishedAt,
      readTime: a.readTime,
      views: a.views,
      likes: a.likes,
      featured: a.featured,
      tags: a.tags,
      category:
        a.categoryId && catMap[a.categoryId.toString()]
          ? {
              id: catMap[a.categoryId.toString()]._id.toString(),
              name: catMap[a.categoryId.toString()].name,
              slug: catMap[a.categoryId.toString()].slug,
              color: catMap[a.categoryId.toString()].color,
              description: catMap[a.categoryId.toString()].description,
              articleCount: 0,
            }
          : null,
      author:
        a.authorId && authorMap[a.authorId.toString()]
          ? {
              id: authorMap[a.authorId.toString()]._id.toString(),
              name: authorMap[a.authorId.toString()].name,
              avatar: authorMap[a.authorId.toString()].avatar,
            }
          : { id: a.authorId.toString(), name: "Unknown", avatar: null },
    }));

    return NextResponse.json(summaries);
  } catch (err) {
    console.error("GET /api/favorites error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Erreur lors de la récupération des favoris.",
      },
      { status: 500 },
    );
  }
}
