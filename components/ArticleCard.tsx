"use client";
import Link from "next/link";
import { Clock, MessageCircle, Bookmark, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  category?: { id: number; name: string; slug: string; color?: string | null } | null;
  author?: { id: number; name: string; avatar?: string | null } | null;
  publishedAt?: string | null;
  readTime?: number | null;
  views?: number | null;
  likes?: number | null;
  featured?: boolean | null;
  isLive?: boolean | null;
  commentCount?: number | null;
}

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "horizontal" | "compact" | "featured";
  className?: string;
}

function timeAgo(date: string | undefined | null) {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function ArticleCard({ article, variant = "default", className = "" }: ArticleCardProps) {
  const categoryColor = article.category?.color || "#006FE6";
  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "d MMM yyyy", { locale: fr })
    : "";

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`}>
        <article className={`group flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer ${className}`}>
          {article.coverImage && (
            <div className="relative shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-muted">
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {article.category && (
              <Badge variant="secondary" className="text-[10px] mb-1 px-1.5 py-0.5" style={{ color: categoryColor, backgroundColor: `${categoryColor}18` }}>
                {article.category.name}
              </Badge>
            )}
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-[#006FE6] transition-colors">{article.title}</h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              {publishedDate && <span>{publishedDate}</span>}
              {article.readTime && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{article.readTime} min</span>}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.slug}`}>
        <article className={`group flex items-start gap-3 py-3 border-b border-border last:border-0 cursor-pointer ${className}`}>
          <div className="w-1 h-12 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: categoryColor }} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-[#006FE6] transition-colors">{article.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {publishedDate && <span>{publishedDate}</span>}
              {article.views && <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{article.views.toLocaleString("fr")}</span>}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`}>
        <article className={`group relative rounded-2xl overflow-hidden cursor-pointer h-96 ${className}`}>
          <div className="absolute inset-0">
            {article.coverImage ? (
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full sparkle-gradient" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {article.category && (
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 text-white" style={{ backgroundColor: categoryColor }}>
                {article.category.name}
              </span>
            )}
            <h2 className="text-xl font-bold text-white leading-tight line-clamp-3 group-hover:text-[#65BDF2] transition-colors">{article.title}</h2>
            {article.excerpt && <p className="text-white/70 text-sm mt-2 line-clamp-2">{article.excerpt}</p>}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-white/30">
                  <AvatarImage src={article.author?.avatar || undefined} />
                  <AvatarFallback className="text-[10px] bg-[#006FE6] text-white">{article.author?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-white/80 text-xs font-medium">{article.author?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-xs">
                {article.readTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} min</span>}
                {article.views && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(article.views/1000).toFixed(1)}k</span>}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default card - Premium News Website Style
  return (
    <Link href={`/article/${article.slug}`}>
      <article className={`group flex flex-col bg-white rounded-[20px] overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${className}`}
        style={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* Image Container */}
        <div className="relative w-full overflow-hidden bg-gray-200" style={{ paddingBottom: "55%" }}>
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full sparkle-gradient" />
          )}
          
          {/* LIVE Badge */}
          {article.isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wide">Live</span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-5 sm:p-6">
          {/* Category */}
          {article.category && (
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              {article.category.name}
            </div>
          )}

          {/* Title */}
          <h2 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug line-clamp-3 mb-4 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h2>

          {/* Metadata */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={article.author?.avatar || undefined} />
              <AvatarFallback className="text-xs bg-blue-600 text-white font-bold">
                {article.author?.name?.slice(0, 2).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-700 truncate">{article.author?.name || "Auteur"}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">{timeAgo(article.publishedAt)}</span>
            </div>
          </div>

          {/* Footer - Comments and Bookmark */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{article.commentCount || 0}</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
