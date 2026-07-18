import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service:
    process.env.SMTP_SERVICE ||
    (process.env.SMTP_HOST?.includes("gmail") ? "gmail" : undefined),
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s+/g, ""),
  },
  logger: process.env.NODE_ENV !== "production",
  debug: process.env.NODE_ENV !== "production",
});

function resolveFrontendUrl() {
  const configured =
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL;

  const productionHost =
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configured) {
    const trimmed = configured.trim().replace(/\/$/, "");

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmed) &&
        productionHost
      ) {
        return `https://${productionHost}`.replace(/\/$/, "");
      }

      return trimmed;
    }

    if (/^localhost(:\d+)?$|^127\.0\.0\.1(:\d+)?$/i.test(trimmed)) {
      if (productionHost) {
        return `https://${productionHost}`.replace(/\/$/, "");
      }

      return `http://${trimmed}`;
    }

    return `https://${trimmed}`;
  }

  if (productionHost) {
    return `https://${productionHost}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmUrl = `${resolveFrontendUrl()}/confirm-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Confirmez votre compte Sparkle News",
      html: `
        <h1>Bienvenue sur Sparkle News !</h1>
        <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
        <a href="${confirmUrl}">${confirmUrl}</a>
        <p>Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email.</p>
      `,
    });
    console.log("Email de confirmation envoyé à:", email);
  } catch (error) {
    console.error("Erreur d'envoi d'email de confirmation:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${resolveFrontendUrl()}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour continuer :</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Ce lien est valable pendant 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
      `,
    });
    console.log("Email de réinitialisation envoyé à:", email);
  } catch (error) {
    console.error("Erreur d'envoi d'email de réinitialisation:", error);
    throw error;
  }
}

export async function sendOtpEmail(email: string, otpCode: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Votre code de vérification Sparkle News",
      html: `
        <h1>Code de vérification</h1>
        <p>Voici votre code de vérification pour finaliser votre inscription :</p>
        <h2>${otpCode}</h2>
        <p>Ce code expire dans 10 minutes.</p>
      `,
    });
    console.log("Code OTP envoyé à:", email);
  } catch (error) {
    console.error("Erreur d'envoi du code OTP:", error);
    throw error;
  }
}
