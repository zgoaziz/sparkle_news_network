"use client";
import Link from "next/link";
import { useState } from "react";
import { useListCategories, useSubscribeNewsletter } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Linkedin, Facebook, Instagram, Youtube, Rss } from "lucide-react";

const APROPOS = [
  ["Accueil", "/"],
  ["Actualités", "/actualites"],
  ["Catégories", "/categories"],
  ["Qui sommes-nous ?", "/a-propos"],
  ["Contact", "/contact"],
];

export function Footer() {
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();
  const { data: categoriesData } = useListCategories();
  const categories = (categoriesData as any)?.categories || (categoriesData as any)?.data || (Array.isArray(categoriesData) ? categoriesData : []);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ data: { email } }, {
      onSuccess: () => { toast.success("Abonnement confirme !"); setEmail(""); },
      onError: () => toast.error("Erreur lors de l abonnement."),
    });
  }

  return (
    <footer className="bg-[#071A33] text-white mt-12">

      {/* ── Newsletter band ─────────────────────────── */}
      <div className="sparkle-gradient">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black">Restez informe chaque matin</h3>
            <p className="text-white/75 text-sm mt-1">La newsletter Sparkle News : les infos essentielles, sans spam.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto min-w-[320px]">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white h-10" />
            <Button type="submit" disabled={subscribe.isPending} className="bg-white text-[#006FE6] hover:bg-white/90 font-bold border-0 shrink-0 h-10 px-5">
              {subscribe.isPending ? "..." : "S abonner"}
            </Button>
          </form>
        </div>
      </div>

      {/* ── Main footer grid ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <img src="/logo.png" alt="Sparkle News Logo" className="h-16 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="text-white/55 text-sm leading-relaxed mb-5">
            L actualite qui eclaire le monde. Technologie, intelligence artificielle, business et innovations mondiales.
          </p>
          {/* Social */}
          <div className="flex items-center gap-3">
            {[
              { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/sparkle-news-network/?viewAsMember=true" },
              { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61557477545725" },
              { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/sparklenewsnetwork/" },
              { Icon: Youtube, label: "Youtube", href: "https://www.linkedin.com/company/sparkle-news-network/?viewAsMember=true" },
              { Icon: Rss, label: "RSS", href: "/actualites" },
            ].map(({ Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#006FE6] flex items-center justify-center transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Rubriques */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-white/40 mb-4">Rubriques</h4>
          <ul className="space-y-2.5">
            {categories.length > 0 ? categories.map((category: any) => (
              <li key={category.id || category.slug}>
                <Link href={`/categories/${category.slug}`} className="text-sm text-white/65 hover:text-white transition-colors">
                  {category.name}
                </Link>
              </li>
            )) : (
              <li className="text-sm text-white/50">Aucune rubrique disponible pour le moment.</li>
            )}
          </ul>
        </div>

        {/* Navigation & A propos */}
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-white/40 mb-4">Navigation</h4>
          <ul className="space-y-2.5">
            {APROPOS.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-white/65 hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ─────────────────────────────── */}
      <div className="border-t border-white/10 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/35">
          <span>&copy; {new Date().getFullYear()} Sparkle News Network. Tous droits reserves.</span>
          <span>Fait avec passion pour l information libre et independante.</span>
        </div>
      </div>
    </footer>
  );
}
