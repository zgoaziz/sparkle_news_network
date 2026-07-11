"use client";
import { useAdminListNewsletterSubscribers } from "@/lib/api-client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNewsletter() {
  const { data, isLoading } = useAdminListNewsletterSubscribers();
  const subscribers = (data as any)?.subscribers || (data as any)?.data || (Array.isArray(data) ? data : []);

  function handleExport() {
    const csv = ["Email,Date d'inscription", ...subscribers.map((s: any) => `${s.email},${s.subscribedAt || s.createdAt || ""}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout title="Newsletter">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sparkle-gradient rounded-xl flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{subscribers.length} abonné{subscribers.length > 1 ? "s" : ""}</h2>
            <p className="text-sm text-muted-foreground">Gérez vos abonnés à la newsletter</p>
          </div>
        </div>
        {subscribers.length > 0 && (
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Exporter CSV
          </Button>
        )}
      </div>

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date d'inscription</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  ))
                : subscribers.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        Aucun abonné pour le moment
                      </td>
                    </tr>
                  )
                  : subscribers.map((s: any, i: number) => (
                      <tr key={s.id || s.email} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{s.email}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {(s.subscribedAt || s.createdAt) ? format(new Date(s.subscribedAt || s.createdAt), "d MMMM yyyy", { locale: fr }) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${s.status === "unsubscribed" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {s.status === "unsubscribed" ? "Désabonné" : "Actif"}
                          </span>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
