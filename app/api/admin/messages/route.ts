import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { contactMessagesTable } from "@/lib/db/schema";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      contactMessagesTable
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      contactMessagesTable.countDocuments(),
    ]);

    return NextResponse.json({
      messages: messages.map((message: any) => ({
        ...message,
        id: message._id?.toString?.() ?? message.id,
        _id: message._id?.toString?.() ?? message.id,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/messages error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la récupération des messages.",
      },
      { status: 500 },
    );
  }
}
