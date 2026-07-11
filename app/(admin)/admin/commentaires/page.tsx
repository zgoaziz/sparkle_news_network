"use client";
import { useState } from "react";
import {
  useAdminListComments,
  useUpdateCommentStatus,
  useAdminDeleteComment,
  getAdminListCommentsQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Check, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminComments() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useAdminListComments({
    page,
    status: status === "all" ? undefined : status as any,
  });
  const updateStatus = useUpdateCommentStatus();
  const deleteComment = useAdminDeleteComment();

  const comments = (data as any)?.comments || (data as any)?.data || (Array.isArray(data) ? data : []);
  const total = (data as any)?.total || comments.length;
  const totalPages = Math.ceil(total / 15);

  function refresh() { queryClient.invalidateQueries({ queryKey: getAdminListCommentsQueryKey() }); }

  function handleStatusChange(id: number, newStatus: string) {
    updateStatus.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => { toast.success("Statut mis à jour"); refresh(); },
      onError: () => toast.error("Erreur"),
    });
  }

  function handleDelete(id: number) {
    deleteComment.mutate({ id }, {
      onSuccess: () => { toast.success("Commentaire supprimé"); setDeleteId(null); refresh(); },
      onError: () => toast.error("Erreur"),
    });
  }

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approuvé</Badge>;
    if (s === "pending") return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">En attente</Badge>;
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejeté</Badge>;
  };

  return (
    <AdminLayout title="Commentaires">
      <div className="flex gap-3 mb-6">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">{total} commentaire{total > 1 ? "s" : ""}</span>
      </div>

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="divide-y divide-border">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-16 w-full" /></div>)
            : comments.length === 0
              ? <div className="py-16 text-center text-muted-foreground">Aucun commentaire</div>
              : comments.map((c: any) => (
                  <div key={c.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={c.author?.avatar} />
                        <AvatarFallback className="bg-[#006FE6] text-white text-xs">{c.author?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">{c.author?.name}</span>
                          {statusBadge(c.status)}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {c.createdAt ? format(new Date(c.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr }) : ""}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Article : <span className="font-medium text-foreground">{c.articleTitle || `#${c.articleId}`}</span>
                        </p>
                        <p className="text-sm">{c.content}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {c.status !== "approved" && (
                          <button onClick={() => handleStatusChange(c.id, "approved")} title="Approuver" className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-colors">
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {c.status !== "rejected" && (
                          <button onClick={() => handleStatusChange(c.id, "rejected")} title="Rejeter" className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
            <AlertDialogTitle>Supprimer ce commentaire ?</AlertDialogTitle>
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
