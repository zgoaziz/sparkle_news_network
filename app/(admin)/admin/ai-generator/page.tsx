"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import { FileText, Cpu, Check, AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminContentGenerator() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [length, setLength] = useState("500");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCategoriesList(res.data);
      if (res.data.length > 0) setCategory(res.data[0].id.toString());
    } catch (err) {
      console.error("Impossible de récupérer les catégories");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast.error("Veuillez saisir un sujet");
      return;
    }

    setGenerating(true);
    setGeneratedResult(null);

    const fullPrompt = `Générer un article structuré.\nSujet: ${topic}\nCatégorie ID: ${category}\nLongueur: ${length} mots.\nMots clés: ${keywords}`;

    try {
      const res = await axios.post("/api/admin-extended/ai-router/simulate", 
        { prompt: fullPrompt, requestType: "content_generation" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } }
      );
      setGeneratedResult(res.data);
      toast.success("Rédaction complétée avec succès !");
    } catch (err: any) {
      toast.error("Échec de la rédaction automatique");
      const errData = err.response?.data;
      setGeneratedResult({
        success: false,
        error: errData?.message || errData?.error || "Une erreur réseau est survenue lors de l'accès au Smart Router."
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToDraft = () => {
    if (!generatedResult?.text) return;
    navigator.clipboard.writeText(generatedResult.text);
    toast.success("Contenu copié dans le presse-papier !");
  };

  return (
    <AdminLayout title="Rédacteur Automatique par IA (Co-pilot)">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator settings panel */}
        <div className="lg:col-span-1 bg-card border rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2 mb-2">
            <Cpu className="h-4.5 w-4.5 text-primary" />
            Paramètres de rédaction
          </h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Sujet de l'article</label>
              <textarea
                required
                rows={3}
                placeholder="Rédigez un court descriptif ou titre de l'actualité à rédiger..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Catégorie cible</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {categoriesList.length === 0 && <option value="">Général</option>}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Longueur (mots)</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="200">Court (~200)</option>
                  <option value="500">Moyen (~500)</option>
                  <option value="1000">Long (~1000)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Mots-clés SEO (séparés par des virgules)</label>
              <input
                type="text"
                placeholder="ex: innovation, climat, startup"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <FileText className="h-4.5 w-4.5" />
                  Rédiger le brouillon
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated content preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl p-5 min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h3 className="font-bold text-base">Brouillon rédigé par l'IA</h3>
                {generatedResult?.success && (
                  <button
                    onClick={handleCopyToDraft}
                    className="flex items-center gap-1 bg-muted hover:bg-muted/80 text-foreground text-xs px-3 py-1.5 rounded-xl font-bold transition-all"
                  >
                    Copier le texte
                  </button>
                )}
              </div>

              {generating && (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006FE6]" />
                  <span>Traitement de la requête par le routeur de secours...</span>
                </div>
              )}

              {!generating && !generatedResult && (
                <div className="text-center py-20 text-muted-foreground text-sm space-y-2">
                  <Cpu className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <p>Aucun article rédigé. Remplissez le formulaire de gauche.</p>
                </div>
              )}

              {generatedResult && (
                <div className="space-y-4">
                  {generatedResult.success ? (
                    <div className="bg-muted/30 border border-card-border p-4 rounded-xl text-sm leading-relaxed space-y-4 whitespace-pre-line text-foreground max-h-96 overflow-y-auto">
                      {generatedResult.text}
                    </div>
                  ) : (
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex gap-3 text-destructive">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <div className="text-xs space-y-1">
                        <div className="font-bold">Erreur de traitement LLM</div>
                        <p>{generatedResult.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Routing pipeline log */}
                  {generatedResult.attempts && (
                    <div className="border-t pt-4 space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Pipeline de secours activé :</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {generatedResult.attempts.map((att: any, i: number) => (
                          <div key={i} className="flex items-center justify-between border rounded-xl px-3 py-2 text-xs bg-muted/40">
                            <span className="font-semibold text-muted-foreground">[{i + 1}] {att.providerName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.status === "success" ? "bg-[#10b981]/15 text-[#10b981]" : "bg-destructive/15 text-destructive"
                            }`}>
                              {att.status === "success" ? `${att.latencyMs}ms` : "FAIL"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {generatedResult?.success && (
              <div className="text-xs text-muted-foreground border-t pt-3 mt-4 flex items-center justify-between">
                <span>Résolution complète via : <strong className="text-foreground">{generatedResult.providerUsed} ({generatedResult.modelUsed})</strong></span>
                <span className="flex items-center gap-1 text-[#10b981] font-semibold">
                  <Check className="h-3.5 w-3.5" />
                  Prêt à être publié
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
