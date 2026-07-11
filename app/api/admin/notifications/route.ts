import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/lib/db/schema";

export async function GET() {
  try {
    await connectDB();
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET /api/admin/notifications error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la récupération des notifications.",
      },
      { status: 500 },
    );
  }
}
