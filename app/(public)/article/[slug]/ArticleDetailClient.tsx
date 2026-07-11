"use client";
import { useParams, useRouter } from "next/navigation";
import { useGetArticleBySlug, useGetSimilarArticles, useAddFavorite, useRemoveFavorite, useGetMyFavorites, getGetMyFavoritesQueryKey } from "@/lib/api-client";
import { ArticleCard } from "@/components/ArticleCard";
import { CommentSection } from "@/components/CommentSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Eye, Heart, Tag, ChevronLeft, Share2, Bookmark } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import type { ArticleDetail } from "@/lib/api-client";

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ArticleSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 bg-muted rounded w-40 mb-6" />
      <div className="aspect-video rounded-2xl bg-muted mb-8" />
      <div className="h-8 bg-muted rounded w-3/4 mb-4" />
      <div className="h-4 bg-muted rounded w-1/2 mb-8" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded mb-3" />
      ))}
    </main>
  );
}

// ── Not Found ─────────────────────────────────────────────────────────────────
function ArticleNotFound() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-black mb-4">Article introuvable</h1>
      <p className="text-muted-foreground mb-8">
        Cet article n&apos;existe pas ou a été supprimé.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#006FE6] hover:underline font-medium"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ArticleDetailClient() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useGetArticleBySlug(slug, {
    query: { enabled: !!slug, queryKey: [`/api/articles/${slug}`] as any },
  });

  const { data: similarData } = useGetSimilarArticles(slug, {
    query: { enabled: !!slug, queryKey: [`/api/articles/${slug}/similar`] as any },
  });

  const { data: favoritesData } = useGetMyFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const favorites = (favoritesData as any)?.articles || (favoritesData as any)?.data || (Array.isArray(favoritesData) ? favoritesData : []);
  
  if (isLoading) return <ArticleSkeleton />;
  if (isError || !data) return <ArticleNotFound />;

  const article = data as ArticleDetail;
  const isFavorite = article ? favorites.some((f: any) => f.id === article.id || f._id === article.id) : false;

  const toggleFavorite = () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour sauvegarder cet article.");
      router.push("/connexion");
      return;
    }
    if (isFavorite) {
      removeFavorite.mutate({ articleId: (article as any).id || (article as any)._id }, {
        onSuccess: () => {
          toast.success("Article retiré des favoris");
          queryClient.invalidateQueries({ queryKey: getGetMyFavoritesQueryKey() });
        }
      });
    } else {
      addFavorite.mutate({ articleId: (article as any).id || (article as any)._id }, {
        onSuccess: () => {
          toast.success("Article sauvegardé !");
          queryClient.invalidateQueries({ queryKey: getGetMyFavoritesQueryKey() });
        }
      });
    }
  };

  const similarArticles = (similarData as any) || [];
  const categoryColor = article.category?.color || "#006FE6";
  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "d MMMM yyyy", { locale: fr })
    : "";

  // Render content: if stored as JSON (from editor), convert blocks to simple HTML.
  const contentHtml = (() => {
    const raw = article.content || "";
    if (typeof raw !== "string") return String(raw);
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.blocks)) {
        return parsed.blocks
          .map((b: any) => {
            switch (b.type) {
              case "image":
                return `<img src="${b.url || ""}" alt="${(b.caption || "").replace(/\"/g, "&quot;")}" class="w-full rounded-xl object-cover" />`;
              case "heading":
                return `<h2 class="text-2xl font-bold">${b.content || ""}</h2>`;
              case "quote":
                return `<blockquote class="border-l-4 pl-4 italic text-muted-foreground">${b.content || ""}</blockquote>`;
              case "code":
                return `<pre class="rounded bg-muted p-3 overflow-auto"><code>${b.content || ""}</code></pre>`;
              case "list":
                return `<ul>${(b.items || []).map((it: string) => `<li>${it}</li>`).join("")}</ul>`;
              case "table":
                return `<table class="min-w-full">${(b.rows || []).map((r: any[]) => `<tr>${r.map((c: string) => `<td class="p-2">${c||""}</td>`).join("")}</tr>`).join("")}</table>`;
              case "gallery":
                return `<div class="grid grid-cols-3 gap-2">${(b.items || []).map((it: string) => `<img src="${it}" class="rounded" />`).join("")}</div>`;
              case "columns":
                return `<div class="grid md:grid-cols-2 gap-4"><div>${b.columns?.[0]||""}</div><div>${b.columns?.[1]||""}</div></div>`;
              default:
                return `<p>${b.content || ""}</p>`;
            }
          })
          .join("");
      }
    } catch (e) {
      // not JSON — fall back to raw content (assumed HTML)
    }
    return raw;
  })();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          Accueil
        </Link>
        <span>/</span>
        {article.category && (
          <>
            <Link
              href={`/categories/${article.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {article.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium line-clamp-1">{article.title}</span>
      </nav>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-muted">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Category Badge */}
      {article.category && (
        <Link href={`/categories/${article.category.slug}`}>
          <Badge
            className="mb-4 text-sm px-3 py-1 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              color: categoryColor,
              backgroundColor: `${categoryColor}18`,
              border: `1px solid ${categoryColor}40`,
            }}
          >
            {article.category.name}
          </Badge>
        </Link>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4">{article.title}</h1>

      {/* Excerpt */}
      {article.excerpt && (
        <p
          className="text-muted-foreground text-lg leading-relaxed mb-6 border-l-4 pl-4"
          style={{ borderColor: categoryColor }}
        >
          {article.excerpt}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={article.author?.avatar || undefined} />
            <AvatarFallback className="text-[11px] bg-[#006FE6] text-white">
              {article.author?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{article.author?.name}</span>
        </div>
        {publishedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {publishedDate}
          </span>
        )}
        {article.readTime && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.readTime} min de lecture
          </span>
        )}
        {article.views > 0 && (
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {article.views.toLocaleString("fr")} vues
          </span>
        )}
        {article.likes > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {article.likes}
          </span>
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Lien copié dans le presse-papier !");
          }}>
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
          <Button 
            variant={isFavorite ? "default" : "outline"} 
            size="sm" 
            onClick={toggleFavorite}
            className={isFavorite ? "sparkle-gradient text-white border-0" : ""}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${isFavorite ? "fill-white" : ""}`} />
            {isFavorite ? "Sauvegardé" : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <article
        className="prose prose-lg dark:prose-invert max-w-none mb-10
          prose-headings:font-bold prose-headings:tracking-tight
          prose-a:text-[#006FE6] prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-md
          prose-blockquote:border-l-[#006FE6] prose-blockquote:text-muted-foreground
          prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-border mb-10">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Similar Articles */}
      {similarArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Articles similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similarArticles.slice(0, 3).map((a: any) => (
              <ArticleCard key={a.id} article={a} variant="default" />
            ))}
          </div>
        </section>
      )}

      {/* Comments Section */}
      <CommentSection articleId={(article as any).id || (article as any)._id} />
    </main>
  );
}
