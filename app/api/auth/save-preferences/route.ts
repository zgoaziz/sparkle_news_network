import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, categories } = await req.json();

    if (!userId || !Array.isArray(categories)) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "userId and categories are required",
        },
        { status: 400 },
      );
    }

    const normalizedCategories = categories
      .map((category: unknown) =>
        typeof category === "string" ? category : "",
      )
      .filter(Boolean);

    await usersTable.updateOne(
      { _id: userId },
      { $set: { preferredCategories: normalizedCategories } },
    );

    return NextResponse.json({
      success: true,
      message: "Préférences enregistrées avec succès.",
    });
  } catch (err) {
    console.error("Save preferences error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Impossible d'enregistrer les préférences.",
      },
      { status: 500 },
    );
  }
}
