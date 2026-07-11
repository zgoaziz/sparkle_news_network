import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { categoriesTable } from "@/lib/db/schema";

export async function GET() {
  try {
    await connectDB();
    const categories = await categoriesTable
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return NextResponse.json({
      ok: true,
      route: "/api/admin/categories",
      categories,
    });
  } catch (error) {
    console.error("GET /api/admin/categories error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la récupération des catégories.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const created = await categoriesTable.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({
      ok: true,
      route: "/api/admin/categories",
      created: true,
      category: { id: created._id.toString() },
    });
  } catch (error) {
    console.error("POST /api/admin/categories error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la création de la catégorie.",
      },
      { status: 500 },
    );
  }
}
