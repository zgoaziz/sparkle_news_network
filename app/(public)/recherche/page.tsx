"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useListArticles, useListCategories } from "@/lib/api-client";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleCardSkeleton } from "@/components/Skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQ = (searchParams?.get("q") as string) || "";

  const [search, setSearch] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [categoryId, setCategoryId] = useState("");

  const { data: articlesData, isLoading } = useListArticles({
    search: search || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    limit: 12,
  }, { query: { enabled: !!search, queryKey: ["/api/articles", "search", search, categoryId] as any } });
  const { data: categoriesData } = useListCategories();

  const articles = (articlesData as any)?.articles || (articlesData as any)?.data || (Array.isArray(articlesData) ? articlesData : []);
  const categories = (categoriesData as any)?.categories || (categoriesData as any)?.data || (Array.isArray(categoriesData) ? categoriesData : []);

  useEffect(() => {
    const q = (searchParams?.get("q") as string) || "";
    setSearch(q);
    setInputValue(q);
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(inputValue.trim());
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-[#003B8F] dark:text-white">Recherche</h1>
        {search && (
          <p className="text-muted-foreground">
            {isLoading ? "Recherche en cours..." : `${articles.length} résultat${articles.length > 1 ? "s" : ""} pour "${search}"`}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Rechercher un article, un sujet..."
            className="pl-9 h-11"
            autoFocus
          />
          {inputValue && (
            <button type="button" onClick={() => { setInputValue(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-44 h-11">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" onClick={handleSearch} className="sparkle-gradient text-white border-0 h-11 px-6">
          Rechercher
        </Button>
      </div>

      {!search ? (
        <div className="py-20 text-center text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Entrez un terme de recherche</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCardSkeleton count={6} />
        </div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">Aucun résultat</p>
          <p className="text-sm">Essayez d'autres mots-clés</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <ArticleCard key={article.id} article={article} variant="default" />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="max-w-7xl mx-auto px-4 py-10 text-center text-muted-foreground">
        <Search className="h-12 w-12 mx-auto mb-4 animate-pulse opacity-20" />
        <p className="text-lg font-medium">Chargement...</p>
      </main>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
