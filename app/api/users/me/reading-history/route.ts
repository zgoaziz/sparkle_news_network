import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  readingHistoryTable,
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

    const history = await readingHistoryTable
      .find({ userId: authUser.userId })
      .sort({ readAt: -1 })
      .limit(20)
      .lean()
      .exec();

    if (history.length === 0) {
      return NextResponse.json([]);
    }

    const articleIds = history.map((h: any) => h.articleId);
    const articles = await articlesTable
      .find({ _id: { $in: articleIds } })
      .lean()
      .exec();

    const categoryIds = [
      ...new Set(
        articles.flatMap((a: any) => {
          const ids = [];
          if (a.categoryId) ids.push(a.categoryId.toString());
          if (Array.isArray(a.categoryIds)) {
            a.categoryIds.forEach((id: any) => {
              if (id) ids.push(id.toString());
            });
          }
          return ids;
        })
      ),
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

    const articleMap = Object.fromEntries(
      articles.map((a: any) => [
        a._id.toString(),
        {
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
          tags: a.tags || [],
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
          categories: Array.isArray(a.categoryIds)
            ? a.categoryIds
                .map((id: any) => {
                  const cat = catMap[id.toString()];
                  return cat
                    ? {
                        id: cat._id.toString(),
                        name: cat.name,
                        slug: cat.slug,
                        color: cat.color,
                        description: cat.description,
                        articleCount: 0,
                      }
                    : null;
                })
                .filter(Boolean)
            : a.categoryId && catMap[a.categoryId.toString()]
            ? [
                {
                  id: catMap[a.categoryId.toString()]._id.toString(),
                  name: catMap[a.categoryId.toString()].name,
                  slug: catMap[a.categoryId.toString()].slug,
                  color: catMap[a.categoryId.toString()].color,
                  description: catMap[a.categoryId.toString()].description,
                  articleCount: 0,
                },
              ]
            : [],
          author:
            a.authorId && authorMap[a.authorId.toString()]
              ? {
                  id: authorMap[a.authorId.toString()]._id.toString(),
                  name: authorMap[a.authorId.toString()].name,
                  avatar: authorMap[a.authorId.toString()].avatar,
                }
              : { id: a.authorId.toString(), name: "Unknown", avatar: null },
        },
      ]),
    );

    const orderedArticles = articleIds
      .map((id: any) => articleMap[id.toString()])
      .filter(Boolean);

    return NextResponse.json(orderedArticles);
  } catch (err) {
    console.error("GET /api/users/me/reading-history error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Erreur lors de la récupération de l'historique.",
      },
      { status: 500 },
    );
  }
}
