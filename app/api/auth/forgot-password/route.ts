import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Validation error", message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await usersTable.findOne({ email: new RegExp(`^${email}$`, "i") });
    console.log("Tentative de mot de passe oublié pour:", email);

    if (user) {
      console.log("Utilisateur trouvé, envoi du mail...");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600 * 1000);
      await usersTable.updateOne(
        { _id: user._id },
        { $set: { resetToken: token, resetTokenExpiresAt: expiresAt } }
      );

      try {
        await sendPasswordResetEmail(email, token);
      } catch (mailError) {
        console.error("Erreur d'envoi d'email de réinitialisation:", mailError);
      }
    } else {
      console.log("Utilisateur NON trouvé pour cet email.");
    }

    return NextResponse.json({
      message: "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Erreur lors de la réinitialisation." },
      { status: 500 }
    );
  }
}
