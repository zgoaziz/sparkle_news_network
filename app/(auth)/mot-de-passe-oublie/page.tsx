"use client";
import { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ChevronLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    forgotPassword.mutate({ data: { email } }, {
      onSuccess: () => setSent(true),
      onError: () => toast.error("Erreur lors de l'envoi"),
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <Link href="/connexion" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft className="h-4 w-4" /> Retour à la connexion
        </Link>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email envoyé !</h1>
            <p className="text-muted-foreground mb-6">Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.</p>
            <Link href="/connexion">
              <Button className="sparkle-gradient text-white border-0">Retour à la connexion</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[#003B8F] dark:text-white mb-2">Mot de passe oublié</h1>
              <p className="text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@example.com" required className="pl-10" />
                </div>
              </div>
              <Button type="submit" className="w-full sparkle-gradient text-white border-0 h-11 font-semibold" disabled={forgotPassword.isPending}>
                {forgotPassword.isPending ? "Envoi..." : "Envoyer le lien"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
