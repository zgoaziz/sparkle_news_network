"use client";
import { useListCategories } from "@/lib/api-client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { data, isLoading } = useListCategories();
  const categories = (data as any)?.categories || (data as any)?.data || (Array.isArray(data) ? data : []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-[#003B8F] dark:text-white">Catégories</h1>
        <p className="text-muted-foreground">Explorez l'actualité par thème</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))
          : categories.map((cat: any) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}>
                <div className="group relative rounded-2xl overflow-hidden h-44 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${cat.color || "#006FE6"}cc, ${cat.color || "#003B8F"}ee)` }} />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30" />
                  <div className="relative h-full flex flex-col justify-between p-6">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <span className="text-white font-black text-lg">{cat.name.slice(0, 1)}</span>
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-xl mb-1">{cat.name}</h2>
                      {cat.description && (
                        <p className="text-white/70 text-sm line-clamp-2">{cat.description}</p>
                      )}
                      <div className="flex items-center gap-1 mt-3 text-white/80 text-xs font-medium group-hover:text-white transition-colors">
                        Explorer <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </main>
  );
}
