"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  useAdminListArticles,
  useDeleteArticle,
  useListCategories,
  getAdminListArticlesQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus, Search, Edit, Trash2, Eye, Star, ChevronLeft, ChevronRight, Filter, Image as ImageIcon, MessageCircle
} from "lucide-react";

export default function AdminArticles() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useAdminListArticles({
    page,
    limit: 15,
    search: search || undefined,
    status: status === "all" ? undefined : status as any,
    categoryId: categoryId === "all" ? undefined : Number(categoryId),
  });
  const { data: categoriesData } = useListCategories();
  const deleteArticle = useDeleteArticle();

  const articles = (data as any)?.articles || (data as any)?.data || (Array.isArray(data) ? data : []);
  const total = (data as any)?.total || articles.length;
  const totalPages = Math.ceil(total / 15);
  const categories = (categoriesData as any)?.categories || (categoriesData as any)?.data || (Array.isArray(categoriesData) ? categoriesData : []);

  function handleDelete(id: number) {
    deleteArticle.mutate({ id }, {
      onSuccess: () => {
        toast.success("Article supprimé");
        queryClient.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
        setDeleteId(null);
      },
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  }

  return (
    <AdminLayout title="Articles">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher..." className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36"><Filter className="h-4 w-4 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button className="sparkle-gradient text-white border-0 ml-auto" onClick={() => router.push("/admin/articles/nouveau")}>
          <Plus className="h-4 w-4 mr-1.5" /> Nouvel article
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-16">Image</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Article</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Catégorie</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Auteur</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Vues</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Commentaires</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : articles.map((a: any) => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="h-10 w-12 rounded overflow-hidden bg-muted shrink-0 border border-border">
                          {a.coverImage ? (
                            <img src={a.coverImage} alt={a.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-4 w-4 opacity-50" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {a.featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-current shrink-0" />}
                          <span className="font-medium line-clamp-1 max-w-[200px]">{a.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {a.categories && a.categories.length > 0 ? (
                            <>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: a.categories[0].color || "#006FE6", backgroundColor: `${a.categories[0].color || "#006FE6"}18` }}>
                                {a.categories[0].name}
                              </span>
                              {a.categories.length > 1 && (
                                <span 
                                  title={a.categories.slice(1).map((c: any) => c.name).join(", ")}
                                  className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium cursor-help"
                                >
                                  +{a.categories.length - 1}
                                </span>
                              )}
                            </>
                          ) : a.category ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: a.category.color || "#006FE6", backgroundColor: `${a.category.color || "#006FE6"}18` }}>
                              {a.category.name}
                            </span>
                          ) : (
                            "—"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{a.author?.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={`text-xs ${a.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                          {a.status === "published" ? "Publié" : "Brouillon"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                        {a.publishedAt ? (
                          format(new Date(a.publishedAt), "d MMM yyyy", { locale: fr })
                        ) : a.createdAt ? (
                          <span title="Date de création">
                            {format(new Date(a.createdAt), "d MMM yyyy", { locale: fr })}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Eye className="h-3 w-3" />{(a.views || 0).toLocaleString("fr")}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        <button
                          onClick={() => router.push(`/admin/commentaires?articleId=${a.id}&articleTitle=${encodeURIComponent(a.title)}`)}
                          title={`Voir les commentaires de "${a.title}"`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[#006FE6]/10 hover:text-[#006FE6] text-muted-foreground group"
                        >
                          <MessageCircle className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                          <span>{(a.commentCount || 0).toLocaleString("fr")}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => router.push(`/admin/articles/${a.id}/modifier`)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-[#006FE6]">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{total} article{total > 1 ? "s" : ""} au total</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm px-3 py-1 bg-muted rounded-lg">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'article ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible. L'article sera définitivement supprimé.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-white hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
