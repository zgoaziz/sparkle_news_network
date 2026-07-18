import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { newsletterSubscribersTable, Notification } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.data?.email || body?.email;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, message: "Adresse email invalide." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if already subscribed
    const existing = await newsletterSubscribersTable.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Cet email est déjà abonné." },
        { status: 400 }
      );
    }

    // Save subscriber
    const newSubscriber = new newsletterSubscribersTable({ email });
    await newSubscriber.save();

    // Create admin notification
    const newNotification = new Notification({
      title: "Nouvel abonnement newsletter",
      message: `L'adresse email ${email} s'est abonnée à la newsletter.`,
      type: "system",
      read: false,
      link: "/admin/newsletter",
    });
    await newNotification.save();

    return NextResponse.json({ ok: true, message: "Abonnement enregistré !" });
  } catch (error: any) {
    console.error("POST /api/newsletter/subscribe error", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erreur lors de l'enregistrement de l'abonnement.",
      },
      { status: 500 }
    );
  }
}
