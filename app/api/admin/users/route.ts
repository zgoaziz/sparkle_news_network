import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 15, 50);
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || undefined;

    const conditions: any = {};
    if (search) {
      conditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      usersTable
        .find(conditions)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      usersTable.countDocuments(conditions),
    ]);

    const formattedUsers = users.map((user: any) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({
      ok: true,
      route: "/api/admin/users",
      users: formattedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/users error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur interne lors de la récupération des utilisateurs.",
      },
      { status: 500 },
    );
  }
}
