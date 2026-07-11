"use client";
import { useState } from "react";
import {
  useAdminListUsers,
  useAdminUpdateUser,
  useAdminDeleteUser,
  getAdminListUsersQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useAdminListUsers({ page, search: search || undefined });
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();

  console.log("Admin Users Data:", data);

  const users = (data as any)?.users || (data as any)?.data || (Array.isArray(data) ? data : []);
  const total = (data as any)?.total || users.length;
  const totalPages = Math.ceil(total / 15);

  function refresh() { queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() }); }

  function handleRoleChange(userId: number, role: string) {
    updateUser.mutate({ id: userId, data: { role: role as any } }, {
      onSuccess: () => { toast.success("Rôle mis à jour"); refresh(); },
      onError: () => toast.error("Erreur"),
    });
  }

  function handleStatusToggle(userId: number, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    updateUser.mutate({ id: userId, data: { status: newStatus as any } }, {
      onSuccess: () => { toast.success(newStatus === "active" ? "Compte activé" : "Compte désactivé"); refresh(); },
      onError: () => toast.error("Erreur"),
    });
  }

  function handleDelete(id: number) {
    deleteUser.mutate({ id }, {
      onSuccess: () => { toast.success("Utilisateur supprimé"); setDeleteId(null); refresh(); },
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  }

  return (
    <AdminLayout title="Utilisateurs">
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher..." className="pl-9" />
        </div>
        <span className="text-sm text-muted-foreground self-center">{total} utilisateur{total > 1 ? "s" : ""}</span>
      </div>

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Utilisateur</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Rôle</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Inscrit le</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>)}</tr>
                  ))
                : users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={u.avatar || undefined} />
                            <AvatarFallback className="bg-[#006FE6] text-white text-xs">{u.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)} disabled={u.email === "zgolliaziz206@gmail.com"}>
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Lecteur</SelectItem>
                            <SelectItem value="editor">Éditeur</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <button onClick={() => handleStatusToggle(u.id, u.status)}
                          disabled={u.email === "zgolliaziz206@gmail.com"}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${u.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                          {u.status === "active" ? "Actif" : "Désactivé"}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {u.createdAt ? format(new Date(u.createdAt), "d MMM yyyy", { locale: fr }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {u.email !== "zgolliaziz206@gmail.com" && (
                            <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
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
