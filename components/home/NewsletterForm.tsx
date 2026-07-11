"use client";

import { useState } from "react";
import { useSubscribeNewsletter } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    subscribe.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          toast.success("Abonnement confirme !");
          setEmail("");
        },
        onError: () => toast.error("Erreur lors de l'abonnement."),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
        className="h-9 text-sm"
        required
      />
      <Button type="submit" className="sparkle-gradient text-white border-0 h-9 text-sm font-bold" disabled={subscribe.isPending}>
        {subscribe.isPending ? "Envoi..." : "S'abonner"}
      </Button>
    </form>
  );
}
