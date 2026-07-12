import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { articlesTable, categoriesTable, usersTable } from "@/lib/db/schema";

function buildSummary(
  article: any,
  catMap: Record<string, any>,
  authorMap: Record<string, any>,
) {
  return {
    id: article._id.toString(),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt,
    readTime: article.readTime,
    views: article.views,
    likes: article.likes,
    featured: article.featured,
    tags: article.tags,
    category:
      article.categoryId && catMap[article.categoryId.toString()]
        ? {
            id: catMap[article.categoryId.toString()]._id.toString(),
            name: catMap[article.categoryId.toString()].name,
            slug: catMap[article.categoryId.toString()].slug,
            color: catMap[article.categoryId.toString()].color,
            description: catMap[article.categoryId.toString()].description,
            articleCount: 0,
          }
        : null,
    author: authorMap[article.authorId?.toString()]
      ? {
          id: authorMap[article.authorId.toString()]._id.toString(),
          name: authorMap[article.authorId.toString()].name,
          avatar: authorMap[article.authorId.toString()].avatar,
        }
      : {
          id: article.authorId?.toString() || "unknown",
          name: "Unknown",
          avatar: null,
        },
  };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 6, 24);

    const featuredArticles = await articlesTable
      .find({ status: "published", featured: true })
      .select(
        "title slug excerpt coverImage publishedAt readTime views likes featured tags categoryId authorId",
      )
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    const baseArticles =
      featuredArticles.length > 0
        ? featuredArticles
        : await articlesTable
            .find({ status: "published" })
            .select(
              "title slug excerpt coverImage publishedAt readTime views likes featured tags categoryId authorId",
            )
            .sort({ publishedAt: -1 })
            .limit(limit)
            .lean()
            .exec();

    const categoryIds = [
      ...new Set(
        baseArticles.map((article: any) => article.categoryId).filter(Boolean),
      ),
    ];
    const authorIds = [
      ...new Set(
        baseArticles.map((article: any) => article.authorId).filter(Boolean),
      ),
    ];

    const [categories, authors] = await Promise.all([
      categoryIds.length > 0
        ? categoriesTable.find({ _id: { $in: categoryIds } }).exec()
        : [],
      authorIds.length > 0
        ? usersTable
            .find({ _id: { $in: authorIds } })
            .select("id name avatar")
            .exec()
        : [],
    ]);

    const catMap = Object.fromEntries(
      categories.map((category: any) => [category._id.toString(), category]),
    );
    const authorMap = Object.fromEntries(
      authors.map((author: any) => [author._id.toString(), author]),
    );

    const summaries = baseArticles.map((article: any) =>
      buildSummary(article, catMap, authorMap),
    );

    return NextResponse.json(summaries);
  } catch (error) {
    console.error("GET /api/articles/featured error", error);
    return NextResponse.json([], { status: 200 });
  }
}
