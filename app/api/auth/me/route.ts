import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = getAuthUser(req);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or missing token" },
        { status: 401 }
      );
    }

    const user = await usersTable.findOne({ _id: payload.userId });
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "User not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Erreur lors de la récupération du profil." },
      { status: 500 }
    );
  }
}
