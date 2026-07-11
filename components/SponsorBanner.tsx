"use client";
import { useGetSponsors, type Sponsor } from "@/lib/api-client";
import { ExternalLink, Megaphone } from "lucide-react";

interface SponsorBannerProps {
  /** "sidebar" shows only sidebar-placed sponsors; "both" shows all active ones */
  placement?: "sidebar" | "both";
  className?: string;
  title?: string;
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        sponsor.linkUrl ? "cursor-pointer" : ""
      }`}
    >
      {/* Accent gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 sparkle-gradient" />

      <div className="flex items-start gap-3">
        {sponsor.imageUrl ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 mt-0.5 border border-border">
            <img src={sponsor.imageUrl} alt={sponsor.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#006FE6]/10 shrink-0 mt-0.5">
            <Megaphone className="h-4.5 w-4.5 text-[#006FE6]" style={{ height: "1.1rem", width: "1.1rem" }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006FE6]/70">
              Sponsorisé
            </span>
          </div>
          <p className="font-semibold text-sm leading-snug text-foreground mb-1">{sponsor.name}</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{sponsor.content}</p>
          {sponsor.linkUrl && (
            <div className="flex items-center gap-1 mt-2 text-xs text-[#006FE6] font-medium group-hover:underline">
              En savoir plus
              <ExternalLink className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (sponsor.linkUrl) {
    return (
      <a href={sponsor.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

export function SponsorBanner({ placement = "sidebar", className = "", title = "Partenaires" }: SponsorBannerProps) {
  const { data } = useGetSponsors(placement);
  const sponsors = Array.isArray(data) ? data.filter((s) => s.isActive) : [];

  if (sponsors.length === 0) return null;

  return (
    <aside className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2">
          {title}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-3">
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} />
        ))}
      </div>
    </aside>
  );
}
