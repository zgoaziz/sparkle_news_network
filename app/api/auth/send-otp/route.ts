import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { sendOtpEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Validation error", message: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersTable.findOne({
      email: new RegExp(`^${normalizedEmail}$`, "i"),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not found", message: "Aucun compte trouvé pour cet email." },
        { status: 404 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: "Votre compte est déjà vérifié.",
        success: true,
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await usersTable.updateOne(
      { _id: user._id },
      { $set: { otpCode, otpExpiresAt } },
    );

    await sendOtpEmail(normalizedEmail, otpCode);

    return NextResponse.json({
      success: true,
      message: "Un code de vérification a été envoyé à votre adresse email.",
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Impossible d'envoyer le code de vérification pour le moment.",
      },
      { status: 500 },
    );
  }
}
