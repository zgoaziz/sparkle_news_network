"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLogin } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (data: any) => {
          const token = data?.token || data?.data?.token;
          const user = data?.user || data?.data?.user;
          if (token && user) {
            login(token, user);
            toast.success(`Bienvenue, ${user.name} !`);
            if (user.role === "admin" || user.role === "editor") router.push("/admin");
            else router.push("/dashboard");
          } else {
            toast.error("Erreur de connexion");
          }
        },
        onError: (err: any) => {
          toast.error(err?.data?.message || err?.response?.data?.message || "Identifiants invalides");
        },
      }
    );
  }

  async function handleGoogleSuccess(credentialResponse: any) {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        toast.success(`Bienvenue, ${data.user.name} !`);
        if (data.user.role === "admin" || data.user.role === "editor") router.push("/admin");
        else router.push("/dashboard");
      } else {
        toast.error(data.message || "Erreur d'authentification Google");
      }
    } catch (e) {
      toast.error("Erreur de connexion avec Google");
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#003B8F] relative items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, #65BDF2 0%, transparent 50%)" }} />
        <div className="relative text-center text-white px-12">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Sparkle News" className="h-24 w-auto object-contain" />
          </Link>
          <h2 className="text-4xl font-black mb-4">Sparkle News Network</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Restez connecté à l’actualité, aux débats et aux analyses qui comptent.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
              <img src="/logo.png" alt="Sparkle News" className="h-8 w-auto object-contain" />
              <span className="text-xl font-black text-[#003B8F]">Sparkle<span className="text-[#006FE6]"> News</span></span>
            </Link>
            <h1 className="text-3xl font-black text-[#003B8F] dark:text-white mb-2">Connexion</h1>
            <p className="text-muted-foreground">Accédez à votre espace personnel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@example.com" required className="pl-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/mot-de-passe-oublie" className="text-xs text-[#006FE6] hover:text-[#003B8F] transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full sparkle-gradient text-white border-0 hover:opacity-90 h-11 text-base font-semibold" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <span className="border-b border-border w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-muted-foreground uppercase font-semibold">ou continuer avec</span>
            <span className="border-b border-border w-1/5 lg:w-1/4"></span>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("La connexion avec Google a échoué.")}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="text-[#006FE6] hover:text-[#003B8F] font-medium transition-colors">S'inscrire</Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}
