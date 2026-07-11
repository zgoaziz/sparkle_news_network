import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Validation error", message: "Token and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Validation error", message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = await usersTable.findOne({ resetToken: token });
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "Bad request", message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await usersTable.updateOne(
      { _id: user._id },
      { $set: { passwordHash, resetToken: null, resetTokenExpiresAt: null } }
    );

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Erreur lors de la réinitialisation du mot de passe." },
      { status: 500 }
    );
  }
}
