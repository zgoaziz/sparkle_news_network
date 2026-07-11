import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sponsorsTable } from "@/lib/db/schema";

export async function GET() {
  try {
    await connectDB();
    const sponsors = await sponsorsTable
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return NextResponse.json(
      sponsors.map((sponsor: any) => ({
        ...sponsor,
        id: sponsor._id?.toString?.() ?? sponsor.id,
      })),
    );
  } catch (error) {
    console.error("GET /api/admin/sponsors error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la récupération des sponsors.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const created = await sponsorsTable.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({
      ok: true,
      route: "/api/admin/sponsors",
      created: true,
      sponsor: {
        id: created._id.toString(),
        ...created.toObject(),
      },
    });
  } catch (error) {
    console.error("POST /api/admin/sponsors error", error);
    return NextResponse.json(
      { ok: false, message: "Erreur interne lors de la création du sponsor." },
      { status: 500 },
    );
  }
}
