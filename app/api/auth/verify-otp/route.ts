import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Email and OTP code are required",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersTable.findOne({
      email: new RegExp(`^${normalizedEmail}$`, "i"),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not found", message: "Compte introuvable." },
        { status: 404 },
      );
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Aucun code de vérification n'a été demandé.",
        },
        { status: 401 },
      );
    }

    if (new Date(user.otpExpiresAt) < new Date()) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Le code a expiré. Demandez-en un nouveau.",
        },
        { status: 401 },
      );
    }

    if (user.otpCode !== otpCode.toString()) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Code de vérification incorrect." },
        { status: 401 },
      );
    }

    await usersTable.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
          confirmationToken: null,
          otpCode: null,
          otpExpiresAt: null,
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Votre adresse email a bien été vérifiée.",
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "La vérification du code a échoué.",
      },
      { status: 500 },
    );
  }
}
