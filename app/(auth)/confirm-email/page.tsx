"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Jeton de confirmation manquant.");
      return;
    }

    axios.get(`/api/auth/confirm-email?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Lien de confirmation invalide ou expiré.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-[#006FE6] animate-spin mb-4" />
            <h1 className="text-2xl font-bold">Vérification en cours...</h1>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email confirmé !</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link href="/connexion">
              <Button className="sparkle-gradient text-white border-0">Se connecter</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Échec de confirmation</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link href="/connexion">
              <Button variant="outline">Retour à la connexion</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
