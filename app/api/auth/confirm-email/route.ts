import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Validation error", message: "Token is required" },
        { status: 400 }
      );
    }

    const user = await usersTable.findOne({ confirmationToken: token });
    if (!user) {
      return NextResponse.json(
        { error: "Bad request", message: "Invalid token" },
        { status: 400 }
      );
    }

    await usersTable.updateOne(
      { _id: user._id },
      { $set: { emailVerified: true, confirmationToken: null } }
    );

    return NextResponse.json({
      message: "Email confirmé avec succès ! Vous pouvez maintenant vous connecter.",
    });
  } catch (err) {
    console.error("Confirm email error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Erreur lors de la confirmation d'email." },
      { status: 500 }
    );
  }
}
