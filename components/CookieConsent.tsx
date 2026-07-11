"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted-all");
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookie-consent", "rejected-all");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pb-20 sm:pb-6 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-lg">Ce site utilise des témoins</h3>
          <p className="text-sm text-muted-foreground">
            Nous utilisons des témoins pour améliorer votre expérience.{" "}
            <Link href="/politique-de-confidentialite" className="text-[#006FE6] hover:underline font-medium">
              Politique de confidentialité
            </Link>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
          <Button variant="outline" onClick={() => setIsVisible(false)} className="sm:w-auto">
            Personnaliser
          </Button>
          <Button variant="outline" onClick={handleRejectAll} className="sm:w-auto">
            Tout refuser
          </Button>
          <Button onClick={handleAcceptAll} className="sparkle-gradient text-white border-0 sm:w-auto">
            Tout accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
