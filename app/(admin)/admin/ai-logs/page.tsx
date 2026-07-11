"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import { History, Search, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AILog {
  id: number;
  requestType: string;
  providerName: string | null;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  status: string;
  errorMessage: string | null;
  latencyMs: number;
  createdAt: string;
}

export default function AdminAILogs() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin-extended/ai-logs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      setLogs(res.data);
    } catch (err) {
      toast.error("Erreur lors de la récupération des logs d'IA");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.requestType.toLowerCase().includes(term) ||
      (log.providerName || "inconnu").toLowerCase().includes(term) ||
      log.modelUsed.toLowerCase().includes(term) ||
      (log.errorMessage || "").toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout title="Historique & Diagnostics IA (Logs)">
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-card-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border border-card-border px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-card border animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-card-border text-muted-foreground font-semibold">
                  <th className="p-4">Statut</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Fournisseur / Modèle</th>
                  <th className="p-4">Jetons (Tokens)</th>
                  <th className="p-4">Latence (ms)</th>
                  <th className="p-4">Date de requête</th>
                  <th className="p-4">Diagnostics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      {log.status === "success" ? (
                        <span className="flex items-center gap-1.5 text-[#10b981] font-semibold text-xs bg-[#10b981]/10 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Succès
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-destructive font-semibold text-xs bg-destructive/10 px-2.5 py-1 rounded-full w-fit">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Panne / Fallback
                        </span>
                      )}
                    </td>
                    <td className="p-4 capitalize font-semibold text-xs text-muted-foreground">
                      {log.requestType.replace("_", " ")}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{log.providerName || "Non résolu"}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{log.modelUsed}</div>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {log.status === "success" ? (
                        <span>
                          {log.promptTokens + log.completionTokens} <span className="text-[10px] text-muted-foreground">({log.promptTokens} p + {log.completionTokens} c)</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold">
                      {log.latencyMs} ms
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), "dd MMM yyyy HH:mm:ss", { locale: fr })}
                    </td>
                    <td className="p-4 text-xs max-w-xs truncate text-muted-foreground" title={log.errorMessage || ""}>
                      {log.errorMessage ? (
                        <span className="text-destructive font-mono">{log.errorMessage}</span>
                      ) : (
                        <span className="text-[#10b981]">OK</span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <History className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                      Aucun log trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
