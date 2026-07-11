import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { newsletterSubscribersTable } from "@/lib/db/schema";

export async function GET() {
  try {
    await connectDB();
    const subscribers = await newsletterSubscribersTable
      .find()
      .sort({ subscribedAt: -1 })
      .lean()
      .exec();

    return NextResponse.json(
      subscribers.map((subscriber: any) => ({
        ...subscriber,
        id: subscriber._id?.toString?.() ?? subscriber.id,
        _id: subscriber._id?.toString?.() ?? subscriber.id,
        subscribedAt: subscriber.subscribedAt ?? subscriber.createdAt,
      })),
    );
  } catch (error) {
    console.error("GET /api/admin/newsletter-subscribers error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la récupération des abonnés.",
      },
      { status: 500 },
    );
  }
}
