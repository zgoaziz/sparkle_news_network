import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { articlesTable, categoriesTable, usersTable } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function buildArticleSummary(
  articles: any[],
  catMap: Record<string, any>,
  authorMap: Record<string, { _id: any; name: string; avatar: string | null }>,
) {
  return articles.map((a) => ({
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
    author: authorMap[a.authorId.toString()]
      ? {
          id: authorMap[a.authorId.toString()]._id.toString(),
          name: authorMap[a.authorId.toString()].name,
          avatar: authorMap[a.authorId.toString()].avatar,
        }
      : {
          id: a.authorId.toString(),
          name: "Unknown",
          avatar: null,
        },
  }));
}

export async function getCatAndAuthorMaps(articles: any[]) {
  const categoryIds = [
    ...new Set(articles.map((a) => a.categoryId).filter(Boolean)),
  ];
  const authorIds = [...new Set(articles.map((a) => a.authorId))];

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
    categories.map((c) => [c._id.toString(), c]),
  );
  const authorMap = Object.fromEntries(
    authors.map((a) => [a._id.toString(), a]),
  );
  return { catMap, authorMap };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 12, 50);
    const offset = (page - 1) * limit;
    const categoryId = searchParams.get("categoryId") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "latest";

    const conditions: any = { status: "published" };
    if (categoryId) conditions.categoryId = categoryId;
    if (search) conditions.title = { $regex: search, $options: "i" };
    if (tag) conditions.tags = tag;

    const sortField: Record<string, 1 | -1> =
      sort === "popular"
        ? { likes: -1 }
        : sort === "views"
          ? { views: -1 }
          : { publishedAt: -1 };

    const [articles, total] = await Promise.all([
      articlesTable
        .find(conditions)
        .select(
          "title slug excerpt coverImage publishedAt readTime views likes featured tags categoryId authorId",
        )
        .sort(sortField)
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      articlesTable.countDocuments(conditions),
    ]);

    const { catMap, authorMap } = await getCatAndAuthorMaps(articles);
    const summarized = await buildArticleSummary(articles, catMap, authorMap);

    return NextResponse.json({
      articles: summarized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET articles error:", err);
    return NextResponse.json(
      {
        articles: [],
        total: 0,
        page: 1,
        totalPages: 0,
        error: "Internal Server Error",
        message: "Erreur lors de la récupération des articles.",
      },
      { status: 200 },
    );
  }
}
