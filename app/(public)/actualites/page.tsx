"use client";
import { useState } from "react";
import { useListArticles, useListCategories } from "@/lib/api-client";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleCardSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";

const PAGE_SIZE = 9;

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sort, setSort] = useState<"latest" | "popular" | "views">("latest");

  const { data: articlesData, isLoading } = useListArticles({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    sort,
  });
  const { data: categoriesData } = useListCategories();

  const articles = (articlesData as any)?.articles || (articlesData as any)?.data || (Array.isArray(articlesData) ? articlesData : []);
  const total = (articlesData as any)?.total || articles.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const categories = (categoriesData as any)?.categories || (categoriesData as any)?.data || (Array.isArray(categoriesData) ? categoriesData : []);

  const selectedCategory = categories.find((c: any) => String(c.id) === categoryId);

  function resetFilters() {
    setSearch("");
    setCategoryId("");
    setSort("latest");
    setPage(1);
  }

  const hasFilters = search || categoryId || sort !== "latest";

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-[#003B8F] dark:text-white">Actualités</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `${total} article${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}` : "Toutes nos actualités"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher..." className="pl-9" />
        </div>

        <Select value={categoryId || "all"} onValueChange={(v) => { setCategoryId(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => { setSort(v as "latest" | "popular" | "views"); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Plus récents</SelectItem>
            <SelectItem value="popular">Plus populaires</SelectItem>
            <SelectItem value="views">Plus vus</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4 mr-1" /> Effacer
          </Button>
        )}
      </div>

      {(selectedCategory || search) && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedCategory.name}
              <button onClick={() => { setCategoryId(""); setPage(1); }}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              "{search}"
              <button onClick={() => { setSearch(""); setPage(1); }}><X className="h-3 w-3" /></button>
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <ArticleCardSkeleton count={9} />
        ) : articles.length === 0 ? (
          <div className="col-span-3 py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Aucun article trouvé</p>
            <p className="text-sm">Essayez de modifier vos filtres</p>
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
          {totalPages > 7 && <span className="text-muted-foreground text-sm">... {totalPages}</span>}
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
