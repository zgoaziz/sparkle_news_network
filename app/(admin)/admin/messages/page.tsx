"use client";
import { useState } from "react";
import { useAdminListContactMessages } from "@/lib/api-client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function AdminMessages() {
  const [page, setPage] = useState(1);
  const [viewMsg, setViewMsg] = useState<any>(null);

  const { data, isLoading } = useAdminListContactMessages({ page });
  const messages = (data as any)?.messages || (data as any)?.data || (Array.isArray(data) ? data : []);
  const total = (data as any)?.total || messages.length;
  const totalPages = Math.ceil(total / 15);

  return (
    <AdminLayout title="Messages de contact">
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="divide-y divide-border">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12 w-full" /></div>)
            : messages.length === 0
              ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Aucun message de contact</p>
                </div>
              )
              : messages.map((m: any) => (
                  <button key={m._id} onClick={() => setViewMsg(m)} className={`w-full text-left p-4 hover:bg-muted/50 transition-colors border-b last:border-0 ${!m.read ? 'bg-[#006FE6]/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#006FE6]/10 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-[#006FE6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm">{m.name}</span>
                          <span className="text-xs text-muted-foreground">&lt;{m.email}&gt;</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {m.createdAt ? format(new Date(m.createdAt), "d MMM yyyy", { locale: fr }) : ""}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground/80">{m.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                      </div>
                    </div>
                  </button>
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

      <Dialog open={!!viewMsg} onOpenChange={() => setViewMsg(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewMsg?.subject}</DialogTitle>
          </DialogHeader>
          {viewMsg && (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <div><span className="text-muted-foreground">De :</span> <span className="font-medium">{viewMsg.name}</span></div>
                <div><span className="text-muted-foreground">Email :</span> <a href={`mailto:${viewMsg.email}`} className="font-medium text-[#006FE6] hover:underline">{viewMsg.email}</a></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {viewMsg.createdAt ? format(new Date(viewMsg.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr }) : ""}
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">{viewMsg.message}</div>
              <a href={`mailto:${viewMsg.email}?subject=Re: ${viewMsg.subject}`} target="_blank" rel="noopener noreferrer">
                <Button className="sparkle-gradient text-white border-0 w-full">Répondre par email</Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
