import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { articlesTable } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    const article = (await articlesTable.findById(p.id).lean().exec()) as any;

    if (!article) {
      return NextResponse.json(
        { ok: false, message: "Article introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      article: {
        id: article._id.toString(),
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        categoryId: article.categoryId?.toString(),
        categoryIds: article.categoryIds?.map((id: any) => id.toString()) || (article.categoryId ? [article.categoryId.toString()] : []),
        authorId: article.authorId?.toString(),
        status: article.status,
        featured: article.featured,
        tags: article.tags,
        views: article.views,
        likes: article.likes,
        readTime: article.readTime,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/articles/[id] error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la récupération de l'article" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    const user = getAuthUser(req);

    if (!user?.userId) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const data = await req.json();

    const existing = await articlesTable.findById(p.id).lean().exec() as any;
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Article introuvable" },
        { status: 404 },
      );
    }

    // Explicitly handle categoryIds: ensure primary categoryId stays in sync
    const updatePayload: any = { ...data, updatedAt: new Date() };
    if (Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      updatePayload.categoryIds = data.categoryIds;
      // Keep primary categoryId as the first selected category
      updatePayload.categoryId = data.categoryIds[0];
    } else if (data.categoryId) {
      updatePayload.categoryId = data.categoryId;
      updatePayload.categoryIds = [data.categoryId];
    } else {
      updatePayload.categoryId = null;
      updatePayload.categoryIds = [];
    }

    if (updatePayload.status === "published") {
      if (!existing.publishedAt && !updatePayload.publishedAt) {
        updatePayload.publishedAt = new Date();
      }
    } else if (updatePayload.status === "draft") {
      updatePayload.publishedAt = null;
    }

    const updated = (await articlesTable
      .findByIdAndUpdate(
        p.id,
        { $set: updatePayload },
        { new: true, strict: false },
      )
      .lean()
      .exec()) as any;

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: "Article introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Article mis à jour",
      article: { id: updated._id.toString() },
    });
  } catch (error) {
    console.error("PUT /api/admin/articles/[id] error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la mise à jour de l'article" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await connectDB();
    const user = getAuthUser(req);

    if (!user?.userId) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const deleted = await articlesTable.findByIdAndDelete(p.id).lean().exec();

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "Article introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Article supprimé",
      id: p.id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/articles/[id] error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la suppression de l'article" },
      { status: 500 },
    );
  }
}

export { PUT as PATCH };

