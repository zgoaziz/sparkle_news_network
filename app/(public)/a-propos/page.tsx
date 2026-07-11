import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Zap, Shield, Users } from "lucide-react";
const logo = "/logo.png";

const VALUES = [
  { icon: Globe, title: "Couverture mondiale", desc: "Une veille permanente sur l'actualité mondiale pour vous apporter les informations essentielles." },
  { icon: Zap, title: "Rapidité & précision", desc: "Des articles publiés en temps réel, rigoureusement vérifiés par notre équipe de journalistes." },
  { icon: Shield, title: "Indépendance éditoriale", desc: "Sparkle News est 100% indépendant. Notre seul engagement est envers la vérité." },
  { icon: Users, title: "Communauté engagée", desc: "Une communauté de lecteurs passionnés qui participent au débat et enrichissent l'information." },
];

import { db } from "@/lib/db";
import { articlesTable, usersTable, categoriesTable } from "@/lib/db/schema";

interface SiteStats {
  articlesPublished: number;
  journalists: number;
  categories: number;
  totalViews: number;
  monthlyViews: number;
}

async function fetchStats(): Promise<SiteStats | null> {
  try {
    if (!process.env.MONGODB_URI) {
      return null;
    }

    await db.connect();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      articlesPublished,
      journalists,
      categories,
      viewsAgg,
      monthlyViewsAgg,
    ] = await Promise.all([
      articlesTable.countDocuments({ status: "published" }),
      usersTable.countDocuments({ role: { $in: ["editor", "admin"] }, status: "active" }),
      categoriesTable.countDocuments({}),
      articlesTable.aggregate<{ total: number }>([
        { $match: { status: "published" } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]).exec(),
      articlesTable.aggregate<{ total: number }>([
        { $match: { status: "published", publishedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]).exec(),
    ]);

    const totalViews = viewsAgg[0]?.total ?? 0;
    const monthlyViews = monthlyViewsAgg[0]?.total ?? 0;

    return {
      articlesPublished,
      journalists,
      categories,
      totalViews,
      monthlyViews,
    };
  } catch (err) {
    console.error("[AboutPage] fetchStats DB error:", err);
    return null;
  }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M+";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 0) + "k+";
  return n.toString();
}

export default async function AboutPage() {
  const stats = await fetchStats();

  const statItems = [
    {
      value: stats ? formatCount(stats.monthlyViews) : "—",
      label: "Lecteurs/mois",
    },
    {
      value: stats ? `${stats.articlesPublished}+` : "—",
      label: "Articles publiés",
    },
    {
      value: stats ? `${stats.journalists}` : "—",
      label: "Journalistes",
    },
    {
      value: stats ? `${stats.categories}` : "—",
      label: "Thématiques couvertes",
    },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="sparkle-gradient-hero py-20 px-4 text-center text-white">
        <img src={logo} alt="Sparkle News" className="h-20 w-auto mx-auto mb-6 rounded-2xl shadow-lg" />
        <h1 className="text-4xl md:text-5xl font-black mb-4">À propos de Sparkle News</h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
          Fondé en 2020, Sparkle News Network est le média de référence francophone pour l'actualité technologique, économique et mondiale.
        </p>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-4 text-[#003B8F] dark:text-white">Notre mission</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Dans un monde saturé d'informations, Sparkle News s'engage à vous apporter l'essentiel — des analyses approfondies, des reportages exclusifs et une couverture en temps réel des événements qui façonnent notre avenir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-card-border rounded-2xl p-6 flex gap-4">
              <div className="w-12 h-12 sparkle-gradient rounded-xl flex items-center justify-center shrink-0">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats dynamiques */}
        <div className="sparkle-gradient rounded-2xl p-8 text-white text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-black mb-1">{value}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/contact">
            <Button size="lg" className="sparkle-gradient text-white border-0 hover:opacity-90 px-10">
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
