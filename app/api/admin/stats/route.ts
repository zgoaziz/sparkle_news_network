import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  articlesTable,
  categoriesTable,
  usersTable,
  commentsTable,
} from "@/lib/db/schema";

export async function GET() {
  await connectDB();

  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    totalUsers,
    totalCategories,
    totalComments,
    pendingComments,
    totalViewsResult,
    recentArticlesRaw,
    recentUsers,
    articlesByCategory,
    topArticles,
  ] = await Promise.all([
    articlesTable.countDocuments(),
    articlesTable.countDocuments({ status: "published" }),
    articlesTable.countDocuments({ status: "draft" }),
    usersTable.countDocuments(),
    categoriesTable.countDocuments(),
    commentsTable.countDocuments(),
    commentsTable.countDocuments({ status: "pending" }),
    articlesTable
      .aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }])
      .exec(),
    articlesTable.find().sort({ createdAt: -1 }).limit(5).exec(),
    usersTable.find().sort({ createdAt: -1 }).limit(5).exec(),
    articlesTable
      .aggregate([{ $group: { _id: "$categoryId", cnt: { $sum: 1 } } }])
      .exec(),
    articlesTable
      .find()
      .sort({ views: -1 })
      .limit(8)
      .select("title views")
      .exec(),
  ]);

  const categoryIds = [
    ...new Set([
      ...articlesByCategory.map((a: any) => a._id).filter(Boolean),
      ...recentArticlesRaw.flatMap((a: any) => {
        const ids = [];
        if (a.categoryId) ids.push(a.categoryId.toString());
        if (Array.isArray(a.categoryIds)) {
          a.categoryIds.forEach((id: any) => {
            if (id) ids.push(id.toString());
          });
        }
        return ids;
      })
    ]),
  ];
  const categories =
    categoryIds.length > 0
      ? await categoriesTable.find({ _id: { $in: categoryIds } }).exec()
      : [];
  const catMap = Object.fromEntries(
    categories.map((c: any) => [c._id.toString(), c]),
  );

  const authorIds = [...new Set(recentArticlesRaw.map((a: any) => a.authorId))];
  const authors =
    authorIds.length > 0
      ? await usersTable
          .find({ _id: { $in: authorIds } })
          .select("name avatar")
          .exec()
      : [];
  const authorMap = Object.fromEntries(
    authors.map((a: any) => [a._id.toString(), a]),
  );

  const recentArticles = recentArticlesRaw.map((a: any) => ({
    id: a._id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    categoryId: a.categoryId,
    category:
      a.categoryId && catMap[a.categoryId.toString()]
        ? { ...catMap[a.categoryId.toString()], articleCount: 0 }
        : null,
    categories: Array.isArray(a.categoryIds)
      ? a.categoryIds
          .map((id: any) => {
            const cat = catMap[id.toString()];
            return cat
              ? { ...cat, articleCount: 0 }
              : null;
          })
          .filter(Boolean)
      : a.categoryId && catMap[a.categoryId.toString()]
      ? [{ ...catMap[a.categoryId.toString()], articleCount: 0 }]
      : [],
    author: authorMap[a.authorId?.toString?.()] || {
      id: a.authorId,
      name: "Author",
      avatar: null,
    },
    status: a.status,
    featured: a.featured,
    tags: a.tags,
    views: a.views,
    likes: a.likes,
    readTime: a.readTime,
    seoTitle: a.seoTitle,
    seoDescription: a.seoDescription,
    publishedAt: a.publishedAt,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  return NextResponse.json({
    totalArticles,
    publishedArticles,
    draftArticles,
    totalUsers,
    totalCategories,
    totalComments,
    pendingComments,
    totalViews: Number(totalViewsResult[0]?.total || 0),
    recentArticles,
    recentUsers: recentUsers.map((u: any) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      avatar: u.avatar,
      createdAt: u.createdAt,
    })),
    articlesByCategory: articlesByCategory.map((a: any) => ({
      name: a._id
        ? catMap[a._id.toString()]?.name || "Uncategorized"
        : "Uncategorized",
      count: a.cnt,
    })),
    viewsByArticle: topArticles.map((a: any) => ({
      title: a.title,
      views: a.views,
    })),
  });
}
