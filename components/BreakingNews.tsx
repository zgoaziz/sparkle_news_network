"use client";
import Link from "next/link";
import { useListArticles } from "@/lib/api-client";

export function BreakingNews() {
  const { data } = useListArticles({ limit: 10, sort: "latest" });
  const articles = (data as any)?.articles || (data as any)?.data || (Array.isArray(data) ? data : []);

  if (!articles.length) return null;

  const items = [...articles, ...articles];

  return (
    <div className="bg-white dark:bg-[#071A33] border-b border-border/60 flex items-stretch overflow-hidden h-9">
      {/* Label */}
      <div className="flex items-center gap-1.5 bg-[#FF0033] text-white px-3 shrink-0 z-10">
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">En direct</span>
      </div>

      {/* Ticker */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div className="animate-ticker flex items-center gap-10">
          {items.map((article: any, i: number) => (
            <Link
              key={i}
              href={`/article/${article.slug}`}
              prefetch={false}
              className="text-xs font-semibold text-foreground/80 hover:text-[#006FE6] transition-colors shrink-0 flex items-center gap-2"
            >
              <span className="text-[#FF0033] font-black">&#9654;</span>
              {article.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
