import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { articlesTable, categoriesTable, usersTable } from "@/lib/db/schema";

function buildArticleSummary(
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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const article = await articlesTable
      .findOne({ slug })
      .select("_id categoryId categoryIds")
      .lean()
      .exec();

    if (!article) {
      return NextResponse.json([], { status: 200 });
    }

    const articleData = article as any;
    const conditions: any = { status: "published" };
    
    const articleCategoryIds = Array.isArray(articleData.categoryIds) && articleData.categoryIds.length > 0
      ? articleData.categoryIds
      : articleData.categoryId
      ? [articleData.categoryId]
      : [];

    if (articleCategoryIds.length > 0) {
      conditions.$or = [
        { categoryId: { $in: articleCategoryIds } },
        { categoryIds: { $in: articleCategoryIds } }
      ];
    }

    const similarArticles = await articlesTable
      .find(conditions)
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean()
      .exec();

    const filtered = similarArticles
      .filter((a: any) => a._id.toString() !== articleData._id.toString())
      .slice(0, 3);

    const categoryIds = [
      ...new Set(
        filtered.flatMap((a: any) => {
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
    const authorIds = [...new Set(filtered.map((a: any) => a.authorId))];

    const [categories, authors] = await Promise.all([
      categoryIds.length > 0
        ? categoriesTable
            .find({ _id: { $in: categoryIds } })
            .lean()
            .exec()
        : [],
      authorIds.length > 0
        ? usersTable
            .find({ _id: { $in: authorIds } })
            .select("name avatar")
            .lean()
            .exec()
        : [],
    ]);

    const catMap = Object.fromEntries(
      categories.map((c: any) => [c._id.toString(), c]),
    );
    const authorMap = Object.fromEntries(
      authors.map((a: any) => [a._id.toString(), a]),
    );

    const summarized = buildArticleSummary(filtered, catMap, authorMap);

    return NextResponse.json(summarized);
  } catch (err) {
    console.error("GET /api/articles/[slug]/similar error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
