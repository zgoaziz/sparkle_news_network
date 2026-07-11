import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { categoriesTable, articlesTable } from "@/lib/db/schema";

export async function GET() {
  try {
    await connectDB();

    const categories = await categoriesTable
      .find({})
      .select("name slug description color createdAt")
      .sort({ name: 1 })
      .lean()
      .exec();

    // Count published articles per category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat: any) => {
        const articleCount = await articlesTable.countDocuments({
          categoryId: cat._id,
          status: "published",
        });
        return {
          id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description ?? null,
          color: cat.color ?? null,
          articleCount,
        };
      })
    );

    return NextResponse.json(categoriesWithCount);
  } catch (err) {
    console.error("GET categories error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
