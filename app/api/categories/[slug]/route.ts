import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { categoriesTable, articlesTable } from "@/lib/db/schema";
import { buildArticleSummary, getCatAndAuthorMaps } from "../../articles/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } | Promise<{ slug: string }> },
) {
  try {
    const p = await params;
    await connectDB();

    // Find the category by slug
    const category = (await categoriesTable.findOne({ slug: p.slug }).lean().exec()) as any;
    if (!category) {
      return NextResponse.json(
        {
          ok: false,
          message: "Catégorie indisponible",
        },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = 9; // Display 9 articles per page
    const offset = (page - 1) * limit;

    const conditions = {
      categoryId: category._id,
      status: "published",
    };

    const [articles, total] = await Promise.all([
      articlesTable
        .find(conditions)
        .sort({ publishedAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      articlesTable.countDocuments(conditions),
    ]);

    const { catMap, authorMap } = await getCatAndAuthorMaps(articles);
    const formattedArticles = await buildArticleSummary(articles, catMap, authorMap);

    return NextResponse.json({
      ok: true,
      category: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
      },
      articles: formattedArticles,
      total,
    });
  } catch (error) {
    console.error("GET /api/categories/[slug] error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur serveur lors de la récupération de la catégorie",
      },
      { status: 500 },
    );
  }
}
