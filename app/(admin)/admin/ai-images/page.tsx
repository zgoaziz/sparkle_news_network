"use client";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import { Image, Sparkles, Download, RefreshCw, AlertCircle } from "lucide-react";

export default function AdminImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [aspect, setAspect] = useState("16_9");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      toast.error("Veuillez entrer une description d'image");
      return;
    }

    setGenerating(true);
    setResult(null);
    try {
      const fullPrompt = `Générer image pour : ${prompt}. Style: ${style}, Aspect: ${aspect}`;
      const res = await axios.post("/api/admin-extended/ai-router/simulate", 
        { prompt: fullPrompt, requestType: "image_generation" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } }
      );
      setResult(res.data);
      toast.success("Image générée avec succès !");
    } catch (err: any) {
      toast.error("Impossible de générer l'image");
      const errData = err.response?.data;
      setResult({
        success: false,
        error: errData?.message || errData?.error || "Une erreur est survenue lors de l'appel au service de rendu d'images."
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AdminLayout title="Générateur d'Illustrations IA">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls form */}
        <div className="lg:col-span-1 bg-card border rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2 mb-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            Paramètres du Rendu
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Description de l'image (Prompt)</label>
              <textarea
                required
                rows={4}
                placeholder="Un coucher de soleil futuriste sur des gratte-ciels en verre, style cyberpunk, néons brillants..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Style artistique</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="photorealistic">Photoréaliste (Ultra detail)</option>
                <option value="digital_art">Art Numérique / 3D Render</option>
                <option value="watercolor">Aquarelle</option>
                <option value="anime">Anime / Manga</option>
                <option value="vector">Illustration Vectorielle</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Format de l'image</label>
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value)}
                className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="16_9">Cinématique 16:9 (Horizontal)</option>
                <option value="1_1">Carré 1:1 (Réseaux Sociaux)</option>
                <option value="9_16">Portrait 9:16 (Stories)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Génération de l'image...
                </>
              ) : (
                <>
                  <Image className="h-4.5 w-4.5" />
                  Générer l'illustration
                </>
              )}
            </button>
          </form>
        </div>

        {/* Display rendering result */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl p-5 min-h-[420px] flex flex-col justify-between">
            <div className="flex-1 flex flex-col">
              <h3 className="font-bold text-base mb-4 border-b pb-3">Aperçu du Rendu</h3>

              {generating && (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006FE6]" />
                  <span>Le routeur IA sélectionne un fournisseur d'image...</span>
                </div>
              )}

              {!generating && !result && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground text-sm space-y-2">
                  <Image className="h-12 w-12 text-muted-foreground/30" />
                  <p>Saisissez les consignes et lancez le rendu.</p>
                </div>
              )}

              {result && (
                <div className="flex-1 flex flex-col justify-between">
                  {result.success ? (
                    <div className="space-y-4 flex-1 flex flex-col items-center justify-center">
                      <div className="relative group overflow-hidden rounded-xl border border-card-border bg-muted">
                        {/* We use a beautiful stable placeholder since the endpoint is mocked */}
                        <img 
                          src={result.text} 
                          alt="Génération IA" 
                          className="max-h-72 w-auto object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-102"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <button
                            onClick={() => window.open(result.text, "_blank")}
                            className="bg-white text-black p-2.5 rounded-full hover:scale-110 transition-transform"
                            title="Ouvrir dans un nouvel onglet"
                          >
                            <Download className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground text-center">
                        Image générée en haute résolution. Cliquez sur l'image pour la télécharger.
                      </div>
                    </div>
                  ) : (
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex gap-3 text-destructive">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <div className="text-xs space-y-1">
                        <div className="font-bold">Échec du rendu d'image</div>
                        <p>{result.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Fallback steps */}
                  {result.attempts && (
                    <div className="border-t pt-4 mt-4 space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Cycle de Fallback Image :</span>
                      <div className="flex flex-wrap gap-2">
                        {result.attempts.map((att: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs bg-muted/40">
                            <span className="font-semibold">{att.providerName}</span>
                            <span className={`h-2 w-2 rounded-full ${att.status === "success" ? "bg-[#10b981]" : "bg-destructive"}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {result?.success && (
              <div className="text-xs text-muted-foreground border-t pt-3 mt-4">
                Moteur résolu : <strong className="text-foreground">{result.providerUsed} ({result.modelUsed})</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
