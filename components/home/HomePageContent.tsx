import Link from "next/link";
import type { ArticleSummary, Category } from "@/lib/api-client";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleCardsGrid } from "@/components/ui/article-card";
import { SponsorBanner } from "@/components/SponsorBanner";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { Button } from "@/components/ui/button";
import { buildCategorySections, fdate } from "@/lib/home-utils";
import { ChevronRight, Clock, Eye, Mail, TrendingUp } from "lucide-react";

interface HomePageContentProps {
  featuredArticles: ArticleSummary[];
  popularArticles: ArticleSummary[];
  latestArticles: ArticleSummary[];
  categories: Category[];
}

function SectionTitle({ label, color = "#006FE6", href }: { label: string; color?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="block w-[3px] h-5 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="font-black text-base uppercase tracking-wide">{label}</h2>
      </div>
      {href && (
        <Link href={href} className="text-xs font-semibold text-muted-foreground hover:text-[#006FE6] flex items-center gap-0.5 transition-colors">
          Tout voir <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function HeroCard({ article }: { article: ArticleSummary }) {
  const color = article.category?.color || "#006FE6";
  return (
    <Link href={`/article/${article.slug}`}>
      <article className="group relative rounded-xl overflow-hidden cursor-pointer h-80 lg:h-[440px] news-card shadow">
        <div className="absolute inset-0">
          {article.coverImage ? (
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full sparkle-gradient" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
          {article.category && (
            <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded mb-2 text-white uppercase tracking-wider" style={{ backgroundColor: color }}>
              {article.category.name}
            </span>
          )}
          <h1 className="text-white text-xl lg:text-3xl font-black leading-snug line-clamp-3 group-hover:text-[#65BDF2] transition-colors">{article.title}</h1>
          {article.excerpt && <p className="text-white/70 text-sm mt-2 line-clamp-2 hidden lg:block">{article.excerpt}</p>}
          <div className="flex items-center gap-4 mt-3 text-white/60 text-xs">
            {article.author?.name && <span className="text-white/80 font-semibold">par {article.author.name}</span>}
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {fdate(article.publishedAt)}
              </span>
            )}
            {article.readTime && <span>{article.readTime} min</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

function ListItem({ article }: { article: ArticleSummary }) {
  const color = article.category?.color || "#006FE6";
  return (
    <Link href={`/article/${article.slug}`}>
      <div className="group flex gap-3 py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 px-1 -mx-1 rounded-lg transition-colors">
        {article.coverImage && (
          <div className="shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-muted">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {article.category && <span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>{article.category.name}</span>}
          <h3 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-[#006FE6] transition-colors mt-0.5">{article.title}</h3>
          <span className="text-[10px] text-muted-foreground">{fdate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function CategorySection({ articles, accentColor }: { articles: ArticleSummary[]; accentColor: string }) {
  if (!articles.length) return null;
  const [main, ...rest] = articles;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Link href={`/article/${main.slug}`}>
          <article className="group relative rounded-xl overflow-hidden h-60 news-card cursor-pointer shadow">
            <div className="absolute inset-0">
              {main.coverImage ? (
                <img src={main.coverImage} alt={main.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full" style={{ background: accentColor + "40" }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {main.category && (
                <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded mb-2 text-white uppercase tracking-wider" style={{ backgroundColor: accentColor }}>
                  {main.category.name}
                </span>
              )}
              <h3 className="text-white font-black text-lg leading-snug line-clamp-2 group-hover:text-[#65BDF2] transition-colors">{main.title}</h3>
              <span className="text-white/60 text-[10px] mt-1 block">{fdate(main.publishedAt)}</span>
            </div>
          </article>
        </Link>
      </div>
      <div className="space-y-0 bg-card border border-border rounded-xl p-3">
        {rest.slice(0, 4).map((article) => (
          <ListItem key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

function MostRead({ articles }: { articles: ArticleSummary[] }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="bg-[#003B8F] text-white px-4 py-2.5 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        <span className="font-black text-sm uppercase tracking-wide">Les plus lus</span>
      </div>
      <div className="p-4 space-y-0">
        {articles.map((article, i) => (
          <Link key={article.id} href={`/article/${article.slug}`}>
            <div className="group flex gap-3 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 px-1 -mx-1 rounded-lg transition-colors">
              <span className="text-4xl font-black text-muted-foreground/15 w-10 shrink-0 leading-none">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold line-clamp-2 group-hover:text-[#006FE6] transition-colors leading-tight">{article.title}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                  <Eye className="h-2.5 w-2.5" />
                  {article.views?.toLocaleString("fr") || "0"} vues
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function HomePageContent({
  featuredArticles,
  popularArticles,
  latestArticles,
  categories,
}: HomePageContentProps) {
  const heroArticle = featuredArticles[0] ?? latestArticles[0];
  const heroSide = featuredArticles.slice(1, 5).length > 0
    ? featuredArticles.slice(1, 5)
    : latestArticles.slice(1, 5);
  const grid12 = latestArticles.slice(0, 12);
  const dynamicCategorySections = buildCategorySections(categories, latestArticles);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      <section>
        <SectionTitle label="A la une" href="/actualites" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">{heroArticle && <HeroCard article={heroArticle} />}</div>
          <div className="bg-card border border-border rounded-xl flex flex-col">
            <div className="px-4 pt-3 pb-2 border-b border-border">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Dernieres infos</span>
            </div>
            <div className="flex-1 px-3 py-1">
              {heroSide.map((article) => (
                <ListItem key={article.id} article={article} />
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <Link href="/actualites" className="text-xs font-bold text-[#006FE6] hover:underline flex items-center gap-1">
                Toutes les infos <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle label="Dernieres actualites" href="/actualites" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {grid12.map((article) => (
            <ArticleCard key={article.id} article={article} variant="default" />
          ))}
        </div>
        {latestArticles.length >= 12 && (
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="border-[#006FE6] text-[#006FE6] hover:bg-[#006FE6] hover:text-white">
              <Link href="/actualites">
                Voir toutes les actualites <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {popularArticles.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#FF0033]">&#128293;</span>
            <span className="font-black text-sm uppercase tracking-wider">Tendances</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularArticles.slice(0, 8).map((article) => (
              <Link key={article.id} href={`/article/${article.slug}`}>
                <article className="group relative rounded-xl overflow-hidden h-48 news-card cursor-pointer shadow hover:shadow-lg transition-shadow">
                  <div className="absolute inset-0">
                    {article.coverImage ? (
                      <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full sparkle-gradient" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {article.category && (
                      <span
                        className="inline-block text-[9px] font-black px-2 py-0.5 rounded mb-1 text-white uppercase tracking-wider"
                        style={{ backgroundColor: article.category.color || "#006FE6" }}
                      >
                        {article.category.name}
                      </span>
                    )}
                    <h3 className="text-white font-black text-sm leading-tight line-clamp-2 group-hover:text-[#65BDF2] transition-colors">{article.title}</h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {latestArticles.length > 0 && (
        <section>
          <SectionTitle label="Lectures recommandees" href="/actualites" />
          <ArticleCardsGrid
            articles={latestArticles.slice(0, 4).map((article) => ({
              title: article.title,
              excerpt: article.excerpt || "Decouvrez cet article interessant",
              category: article.category?.name || "Actualites",
              readTime: article.readTime || 5,
              image: article.coverImage ?? undefined,
              featured: article.featured || false,
              author: article.author?.name,
              date: article.publishedAt ? fdate(article.publishedAt) : undefined,
              views: article.views,
              likes: article.likes,
              href: `/article/${article.slug}`,
            }))}
          />
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {dynamicCategorySections.length > 0 ? (
            dynamicCategorySections.map((section) => (
              <div key={section.category.id || section.category.slug}>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-border">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: section.category.color || "#006FE6" }} />
                  <h2 className="font-black text-base uppercase tracking-wide">{section.category.name}</h2>
                  <Link href={`/categories/${section.category.slug}`} className="ml-auto text-xs font-semibold text-muted-foreground hover:text-[#006FE6] flex items-center gap-0.5">
                    Tout voir <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <CategorySection articles={section.articles} accentColor={section.category.color || "#006FE6"} />
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Aucune rubrique dynamique n'est disponible pour le moment.
            </div>
          )}
        </div>

        <div className="space-y-6">
          {popularArticles.length > 0 && <MostRead articles={popularArticles} />}

          <div className="rounded-xl overflow-hidden border border-[#006FE6]/30">
            <div className="sparkle-gradient p-4 text-white">
              <Mail className="h-6 w-6 mb-2" />
              <h3 className="font-black text-sm">Newsletter quotidienne</h3>
              <p className="text-white/75 text-xs mt-1 leading-relaxed">Les infos du jour dans votre boite mail. Gratuit.</p>
            </div>
            <div className="bg-card p-4">
              <NewsletterForm />
            </div>
          </div>

          <SponsorBanner placement="sidebar" />
        </div>
      </section>
    </main>
  );
}
