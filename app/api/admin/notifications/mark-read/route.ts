import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/lib/db/schema";

export async function PUT(req: Request) {
  try {
    await connectDB();
    await Notification.updateMany(
      { read: false },
      { $set: { read: true } },
    ).exec();
    return NextResponse.json({
      ok: true,
      message: "Notifications marquées comme lues",
    });
  } catch (error) {
    console.error("PUT /api/admin/notifications/mark-read error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la mise à jour des notifications.",
      },
      { status: 500 },
    );
  }
}
