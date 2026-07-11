import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable, Notification } from "@/lib/db/schema";
import { hashPassword, signToken } from "@/lib/auth";
import crypto from "crypto";
import { sendConfirmationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Validation error", message: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Validation error", message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await usersTable.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (existing) {
      return NextResponse.json(
        { error: "Conflict", message: "Email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    const user = await usersTable.create({
      name,
      email,
      passwordHash,
      role: "user",
      status: "active",
      emailVerified: false,
      confirmationToken,
    });

    try {
      await sendConfirmationEmail(email, confirmationToken);
    } catch (mailError) {
      console.error("Erreur d'envoi d'email d'inscription:", mailError);
    }

    try {
      await Notification.create({
        title: "Nouvel utilisateur inscrit",
        message: `${name} (${email}) vient de créer un compte.`,
        type: "user_signup",
        link: "/admin/utilisateurs",
      });
    } catch (notifErr) {
      console.error("Erreur création notification:", notifErr);
    }

    return NextResponse.json(
      {
        message: "Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          status: user.status,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Erreur lors de l'inscription." },
      { status: 500 }
    );
  }
}
