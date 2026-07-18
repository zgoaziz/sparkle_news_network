import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  articlesTable,
  categoriesTable,
  usersTable,
  readingHistoryTable,
} from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export async function buildArticleSummary(
  articles: any[],
  catMap: Record<string, any>,
  authorMap: Record<string, any>,
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

export async function getCatAndAuthorMaps(articles: any[]) {
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
  const authorIds = [...new Set(articles.map((a) => a.authorId))];

  const [categories, authors] = (await Promise.all([
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
  ])) as [any[], any[]];

  const catMap = Object.fromEntries(
    categories.map((c) => [c._id.toString(), c]),
  );
  const authorMap = Object.fromEntries(
    authors.map((a) => [a._id.toString(), a]),
  );
  return { catMap, authorMap };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const article = await articlesTable
      .findOne({ slug, status: "published" })
      .lean()
      .exec();

    if (!article) {
      return NextResponse.json(
        { error: "Not found", message: "Article introuvable" },
        { status: 404 },
      );
    }

    const articleDoc = article as any;
    await articlesTable
      .updateOne({ _id: articleDoc._id }, { $inc: { views: 1 } })
      .exec();

    const authUser = getAuthUser(req);
    if (authUser) {
      await readingHistoryTable.findOneAndUpdate(
        { userId: authUser.userId, articleId: articleDoc._id },
        { $set: { readAt: new Date() } },
        { upsert: true },
      );
    }

    const articleData = article as any;
    const { catMap, authorMap } = await getCatAndAuthorMaps([articleData]);
    const [summarized] = await buildArticleSummary(
      [articleData],
      catMap,
      authorMap,
    );

    return NextResponse.json({
      ...summarized,
      content: articleData.content,
      status: articleData.status,
      seoTitle: articleData.seoTitle,
      seoDescription: articleData.seoDescription,
      createdAt: articleData.createdAt,
      updatedAt: articleData.updatedAt,
    });
  } catch (err) {
    console.error("GET /api/articles/[slug] error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Erreur lors de la récupération de l'article.",
      },
      { status: 500 },
    );
  }
}
