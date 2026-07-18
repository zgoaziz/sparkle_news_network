import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { articlesTable, categoriesTable, usersTable } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 15, 50);
    const offset = (page - 1) * limit;
    const status = searchParams.get("status") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    const conditions: any = {};
    if (status) conditions.status = status;
    if (categoryId) conditions.categoryId = categoryId;
    if (search) conditions.title = { $regex: search, $options: "i" };

    const [articles, total] = await Promise.all([
      articlesTable
        .find(conditions)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      articlesTable.countDocuments(conditions),
    ]);

    const categoryIds = [
      ...new Set(
        articles.flatMap((article: any) => {
          const ids = [];
          if (article.categoryId) ids.push(article.categoryId.toString());
          if (Array.isArray(article.categoryIds)) {
            article.categoryIds.forEach((id: any) => {
              if (id) ids.push(id.toString());
            });
          }
          return ids;
        })
      ),
    ];
    const authorIds = [
      ...new Set(articles.map((article: any) => article.authorId)),
    ];

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

    const categoryMap = Object.fromEntries(
      categories.map((category: any) => [category._id.toString(), category]),
    );
    const authorMap = Object.fromEntries(
      authors.map((author: any) => [author._id.toString(), author]),
    );

    const formattedArticles = articles.map((article: any) => {
      const articleCategoryIds = Array.isArray(article.categoryIds)
        ? article.categoryIds.map((id: any) => id.toString())
        : article.categoryId
        ? [article.categoryId.toString()]
        : [];
      
      const articleCategories = articleCategoryIds
        .map((id: string) => {
          const cat = categoryMap[id];
          return cat
            ? {
                id,
                name: cat.name || "",
                slug: cat.slug || "",
                color: cat.color || null,
              }
            : null;
        })
        .filter(Boolean);

      return {
        id: article._id.toString(),
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        status: article.status,
        featured: article.featured,
        tags: article.tags,
        views: article.views,
        likes: article.likes,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        category: articleCategories[0] || null,
        categories: articleCategories,
        author: authorMap[article.authorId?.toString()] || null,
      };
    });

    return NextResponse.json({
      articles: formattedArticles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/articles error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la récupération des articles.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = getAuthUser(req);
    const data = await req.json();

    if (!user?.userId) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Explicitly handle categoryIds: ensure primary categoryId stays in sync
    const articleData: any = {
      ...data,
      authorId: data.authorId || user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      articleData.categoryIds = data.categoryIds;
      articleData.categoryId = data.categoryIds[0];
    } else if (data.categoryId) {
      articleData.categoryId = data.categoryId;
      articleData.categoryIds = [data.categoryId];
    }

    if (articleData.status === "published" && !articleData.publishedAt) {
      articleData.publishedAt = new Date();
    }

    const created = await new (articlesTable as any)(articleData, { strict: false }).save();
    return NextResponse.json({
      ok: true,
      route: "/api/admin/articles",
      created: true,
      article: { id: created._id.toString() },
    });
  } catch (error) {
    console.error("POST /api/admin/articles error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la création de l'article.",
      },
      { status: 500 },
    );
  }
}
