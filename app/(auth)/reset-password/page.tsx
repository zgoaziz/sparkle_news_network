"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle, ChevronLeft, Loader2 } from "lucide-react";
import axios from "axios";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useEffect(() => {
    // Run only once during hydration / mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get("token"));
      setTokenLoaded(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères");
      return;
    }
    if (!token) {
      toast.error("Jeton manquant");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setSuccess(true);
      toast.success("Mot de passe réinitialisé !");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  if (!tokenLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#006FE6] animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lien invalide</h1>
          <p className="text-muted-foreground mb-6">Le jeton de réinitialisation est manquant ou invalide.</p>
          <Link href="/connexion">
            <Button variant="outline">Retour à la connexion</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Mot de passe réinitialisé !</h1>
            <p className="text-muted-foreground mb-6">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <Link href="/connexion">
              <Button className="sparkle-gradient text-white border-0">Se connecter</Button>
            </Link>
          </div>
        ) : (
          <>
            <Link href="/connexion" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ChevronLeft className="h-4 w-4" /> Retour à la connexion
            </Link>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[#003B8F] dark:text-white mb-2">Nouveau mot de passe</h1>
              <p className="text-muted-foreground">Choisissez un nouveau mot de passe sécurisé.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="pl-10" />
                </div>
              </div>
              <Button type="submit" className="w-full sparkle-gradient text-white border-0 h-11 font-semibold" disabled={loading}>
                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
