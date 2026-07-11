"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useGetCategoryBySlug } from "@/lib/api-client";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleCardSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug ?? "");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetCategoryBySlug(slug, { page }, {
    query: { enabled: !!slug, queryKey: ["/api/categories", slug, page] as any },
  });

  const category = (data as any)?.category;
  const articles = (data as any)?.articles || (data as any)?.data || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 9));
  const hasCategory = Boolean(category?.name || category?.slug);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="rounded-2xl overflow-hidden mb-8 relative h-40"
        style={{ background: `linear-gradient(135deg, ${category?.color || "#006FE6"}, #003B8F)` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-6">
          <Link href="/categories" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-2 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Catégories
          </Link>
          <h1 className="text-3xl font-black text-white">{category?.name || "Catégorie indisponible"}</h1>
          {category?.description ? (
            <p className="text-white/70 text-sm mt-1">{category.description}</p>
          ) : (
            <p className="text-white/70 text-sm mt-1">Cette catégorie n’est pas disponible dans la base actuelle.</p>
          )}
          {total > 0 ? <p className="text-white/60 text-xs mt-1">{total} article{total > 1 ? "s" : ""}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <ArticleCardSkeleton count={9} />
        ) : !hasCategory ? (
          <div className="col-span-3 py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">Cette catégorie n’existe pas ou n’est pas encore disponible.</p>
            <Link href="/categories" className="text-[#006FE6] font-semibold mt-3 inline-flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Voir toutes les catégories
            </Link>
          </div>
        ) : articles.length === 0 ? (
          <div className="col-span-3 py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">Aucun article dans cette catégorie</p>
          </div>
        ) : (
          articles.map((article: any) => (
            <ArticleCard key={article.id} article={article} variant="default" />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const p = i + 1;
            return (
              <Button key={p} variant={page === p ? "default" : "outline"} size="sm"
                className={page === p ? "sparkle-gradient text-white border-0" : ""}
                onClick={() => setPage(p)}>
                {p}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
