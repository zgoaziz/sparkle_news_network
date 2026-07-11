import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/confirm-email?token=${token}`;
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
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
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
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
