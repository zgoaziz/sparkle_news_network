import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  image?: string;
  featured?: boolean;
  author?: string;
  date?: string;
  views?: number;
  likes?: number;
  href?: string;
  onClick?: () => void;
  onSeeMore?: () => void;
}

export function ArticleCard({
  title,
  excerpt,
  category,
  readTime,
  image,
  featured = false,
  author,
  date,
  views,
  likes,
  href,
  onClick,
  onSeeMore,
}: ArticleCardProps) {
  const card = (
    <article
      onClick={href ? undefined : onClick}
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl cursor-pointer bg-transparent border-b border-slate-200/50"
    >
      <div className="flex flex-col gap-4 py-6">
        {/* Image Container */}
        {image && (
          <div className="relative overflow-hidden rounded-xl h-64 bg-slate-100">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {featured && (
              <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                <span>★ À la une</span>
              </div>
            )}
          </div>
        )}

        {/* Content Container */}
        <div className="space-y-3">
          {/* Category Badge */}
          <div className="inline-block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 group-hover:text-slate-700 transition">
              {category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 group-hover:text-slate-700 line-clamp-2 transition">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-600 line-clamp-3 group-hover:text-slate-700 transition">
            {excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2">
            {author && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-300" />
                <span>{author}</span>
              </div>
            )}
            {date && <span>•</span>}
            {date && <span>{date}</span>}
            {readTime && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{readTime} min</span>
                </div>
              </>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
            <div className="flex items-center gap-4">
              {views !== undefined && (
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span>👁</span>
                  <span>{views.toLocaleString()} views</span>
                </div>
              )}
              {likes !== undefined && (
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span>❤</span>
                  <span>{likes.toLocaleString()}</span>
                </div>
              )}
            </div>
            {href ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition px-3 py-1.5 group-hover:bg-slate-100 rounded-lg">
                Voir plus
                <span className="text-lg">→</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSeeMore?.();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition px-3 py-1.5 hover:bg-slate-100 rounded-lg"
              >
                See more
                <span className="text-lg">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block" prefetch={false}>
        {card}
      </Link>
    );
  }

  return card;
}

export function ArticleCardsGrid({
  articles,
}: {
  articles: ArticleCardProps[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {articles.map((article, index) => (
        <ArticleCard key={index} {...article} />
      ))}
    </div>
  );
}
