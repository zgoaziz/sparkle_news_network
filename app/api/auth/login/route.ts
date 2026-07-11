import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Validation error", message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await usersTable.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid credentials" },
        { status: 401 }
      );
    }
    if (user.status === "disabled") {
      return NextResponse.json(
        { error: "Unauthorized", message: "Account is disabled" },
        { status: 401 }
      );
    }
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Veuillez confirmer votre adresse email avant de vous connecter." },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });
    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Erreur lors de la connexion." },
      { status: 500 }
    );
  }
}
