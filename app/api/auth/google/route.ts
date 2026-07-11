import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { usersTable, Notification } from "@/lib/db/schema";
import { hashPassword, signToken } from "@/lib/auth";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Validation error", message: "Google credential is required" },
        { status: 400 }
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token", message: "Invalid Google token payload" },
        { status: 400 }
      );
    }

    const { email, name, picture, sub: googleId } = payload;
    if (!email || !name) {
      return NextResponse.json(
        { error: "Invalid payload", message: "Email and name are required from Google" },
        { status: 400 }
      );
    }

    let user = await usersTable.findOne({ email: new RegExp(`^${email}$`, "i") });

    if (!user) {
      const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex")); // random secure password
      user = await usersTable.create({
        name,
        email,
        passwordHash,
        googleId,
        avatar: picture,
        role: "user",
        status: "active",
        emailVerified: true, // Google emails are pre-verified
      });

      try {
        await Notification.create({
          title: "Nouvel utilisateur inscrit (Google)",
          message: `${name} (${email}) vient de créer un compte via Google.`,
          type: "user",
          read: false,
        });
      } catch (notifError) {
        console.error("Erreur notification:", notifError);
      }
    } else {
      // Update existing user with googleId and avatar if missing
      const updates: any = {};
      if (!user.googleId) updates.googleId = googleId;
      if (!user.avatar && picture) updates.avatar = picture;
      if (Object.keys(updates).length > 0) {
        user = await usersTable.findOneAndUpdate({ _id: user._id }, { $set: updates }, { new: true });
      }
    }

    if (user.status === "disabled") {
      return NextResponse.json(
        { error: "Forbidden", message: "Compte désactivé" },
        { status: 403 }
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
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { error: "Authentication failed", message: "Échec de l'authentification Google" },
      { status: 500 }
    );
  }
}
