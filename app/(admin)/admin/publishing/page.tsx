"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import { 
  Share2, Calendar, Clock, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Facebook, Linkedin, Instagram 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SocialAccount {
  id: number;
  platform: string;
  accountName: string;
  isActive: boolean;
}

interface QueuedPost {
  id: number;
  postContent: string;
  scheduledFor: string;
  status: string;
  errorLog: string | null;
  postedAt: string | null;
  accountName: string | null;
  platform: string | null;
}

export default function AdminPublishing() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [queue, setQueue] = useState<QueuedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [socialAccountId, setSocialAccountId] = useState("");
  const [postContent, setPostContent] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");

  useEffect(() => {
    fetchData();
    // Parse URL for pending post instead of localStorage
    const params = new URLSearchParams(window.location.search);
    const pending = params.get("post_content");
    if (pending) {
      setPostContent(pending);
      setShowAddModal(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    const oauthError = params.get("error");
    if (oauthError) {
      if (oauthError === "missing_keys") {
        toast.error("Clés API manquantes. Configurez META_CLIENT_ID et LINKEDIN_CLIENT_ID dans .env");
      } else if (oauthError === "no_pages") {
        toast.error("Aucune page Facebook trouvée pour ce compte.");
      } else {
        toast.error("Erreur lors de l'authentification.");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, qRes] = await Promise.all([
        axios.get("/api/admin-extended/social-accounts", { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } }),
        axios.get("/api/admin-extended/social-queue", { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } })
      ]);
      setAccounts(accRes.data);
      setQueue(qRes.data);
      setSocialAccountId("all");
    } catch (err) {
      toast.error("Erreur lors de la récupération des données de diffusion");
    } finally {
      setLoading(false);
    }
  };

  const handleQueuePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialAccountId || !postContent || !scheduledFor) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (socialAccountId === "all" && accounts.filter(a => a.isActive).length === 0) {
      toast.error("Aucun compte social connecté. Connectez LinkedIn ou Meta d'abord.");
      return;
    }

    try {
      await axios.post("/api/admin-extended/social-queue", {
        socialAccountId,
        postContent,
        scheduledFor
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } });
      toast.success("Publication programmée avec succès");
      setShowAddModal(false);
      setPostContent("");
      setScheduledFor("");
      fetchData();
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Erreur inconnue";
      toast.error(message === "No active accounts found"
        ? "Aucun compte social connecté. Connectez LinkedIn ou Meta d'abord."
        : `Erreur de programmation : ${message}`);
    }
  };

  const handleCancelPost = async (id: number) => {
    if (!confirm("Voulez-vous annuler ce post programmé ?")) return;
    try {
      await axios.delete(`/api/admin-extended/social-queue/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success("Publication annulée");
      fetchData();
    } catch (err) {
      toast.error("Erreur d'annulation");
    }
  };

  const handleRetryPost = async (id: number) => {
    try {
      await axios.post(`/api/admin-extended/social-queue/retry/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success("Publication relancée avec succès");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la relance");
    }
  };

  const handleDisconnect = async (id: number) => {
    if (!confirm("Voulez-vous vraiment déconnecter ce compte ?")) return;
    try {
      await axios.delete(`/api/admin-extended/social-accounts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success("Compte déconnecté");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook": return <Facebook className="h-5 w-5 text-[#1877F2]" />;
      case "linkedin": return <Linkedin className="h-5 w-5 text-[#0A66C2]" />;
      case "instagram": return <Instagram className="h-5 w-5 text-[#E1306C]" />;
      default: return <Share2 className="h-5 w-5" />;
    }
  };

  return (
    <AdminLayout title="Social Auto Posting & Multi-channel">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Linked Accounts Column */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-card border rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Share2 className="h-4.5 w-4.5 text-primary" />
              Comptes connectés
            </h3>
            
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between border rounded-xl p-3 bg-muted/20">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(acc.platform)}
                      <div>
                        <div className="font-semibold text-sm">{acc.accountName}</div>
                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">{acc.platform}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${acc.isActive ? "bg-[#10b981]" : "bg-gray-300"}`} title={acc.isActive ? "Connecté" : "Déconnecté"} />
                      <button 
                        onClick={() => handleDisconnect(acc.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Déconnecter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={() => window.location.href = "/api/admin-extended/auth/linkedin?token=" + localStorage.getItem("sparkle_token")}
                    className="w-full py-2 bg-[#0A66C2] hover:bg-[#084b90] text-white border-transparent rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Linkedin className="h-4 w-4" /> Connecter LinkedIn
                  </button>
                  <button 
                    onClick={() => window.location.href = "/api/admin-extended/auth/meta?token=" + localStorage.getItem("sparkle_token")}
                    className="w-full py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white border-transparent rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Instagram className="h-4 w-4" /> Connecter Meta (FB/IG)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Post queue column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                File d'attente des publications
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={fetchData}
                  className="p-2 bg-muted border rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Planifier un post
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map((q) => (
                  <div key={q.id} className="border rounded-2xl p-4 bg-muted/20 space-y-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3">
                        <div className="mt-1">{q.platform && getPlatformIcon(q.platform)}</div>
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-muted-foreground">Vers : {q.accountName}</span>
                          <p className="text-sm font-medium text-foreground leading-relaxed">{q.postContent}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {q.status === "completed" && (
                          <span className="flex items-center gap-1 bg-[#10b981]/15 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Publié
                          </span>
                        )}
                        {q.status === "processing" && (
                          <span className="flex items-center gap-1 bg-[#3b82f6]/15 text-[#3b82f6] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            En cours
                          </span>
                        )}
                        {q.status === "pending" && (
                          <span className="flex items-center gap-1 bg-[#f59e0b]/15 text-[#f59e0b] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" />
                            En attente
                          </span>
                        )}
                        {q.status === "failed" && (
                          <div className="flex flex-col items-end gap-1">
                            <span className="flex items-center gap-1 bg-destructive/15 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full cursor-help" title={typeof q.errorLog === 'object' ? JSON.stringify(q.errorLog) : q.errorLog || 'Erreur inconnue'}>
                              <AlertCircle className="h-3 w-3" />
                              Échec
                            </span>
                            <button 
                              onClick={() => handleRetryPost(q.id)}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <RefreshCw className="h-2.5 w-2.5" /> Réessayer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-card-border/60 pt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        Prévu le : {format(new Date(q.scheduledFor), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>

                      {q.status === "pending" && (
                        <button
                          onClick={() => handleCancelPost(q.id)}
                          className="flex items-center gap-1 text-destructive hover:bg-destructive/10 hover:underline px-2.5 py-1 rounded-lg transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {queue.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm space-y-1">
                    <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                    <p>Aucune publication programmée.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Scheduled Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-card-border max-w-md w-full rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">Programmer une nouvelle publication</h3>
            <form onSubmit={handleQueuePost} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Compte de publication</label>
                <select
                  value={socialAccountId}
                  onChange={(e) => setSocialAccountId(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="all">Tous les comptes connectés</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.platform.toUpperCase()} — {a.accountName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Texte du post (supporte hashtags, URLs)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Rédigez l'annonce promotionnelle pour vos réseaux sociaux..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Date et heure de publication</label>
                <input
                  required
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#006FE6] text-white hover:bg-[#0052A3]"
                >
                  Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
