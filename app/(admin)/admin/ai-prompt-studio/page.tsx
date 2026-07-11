"use client";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Play, Save, Code, Variable, Sparkles } from "lucide-react";
import axios from "axios";

export default function AdminPromptStudio() {
  const [systemPrompt, setSystemPrompt] = useState(
    "Tu es un journaliste sénior de Sparkle News. Rédige un article captivant, neutre et professionnel. Utilise un ton dynamique et structure le texte avec des titres clairs."
  );
  const [userPromptTemplate, setUserPromptTemplate] = useState(
    "Rédige un article d'actualité sur le sujet : {{sujet}}.\nCatégorie cible : {{categorie}}.\nLongueur souhaitée : {{longueur}} mots.\nInsère les mots clés suivants : {{mots_cles}}."
  );
  const [variables, setVariables] = useState([
    { key: "sujet", value: "L'essor de la fusion nucléaire commerciale en Europe" },
    { key: "categorie", value: "Technologie" },
    { key: "longueur", value: "500" },
    { key: "mots_cles", value: "énergie propre, réacteur ITER, transition écologique, startup" },
  ]);

  const [compiledPrompt, setCompiledPrompt] = useState("");
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const handleCompile = () => {
    let result = userPromptTemplate;
    variables.forEach((v) => {
      result = result.replaceAll(`{{${v.key}}}`, v.value);
    });
    setCompiledPrompt(result);
    return result;
  };

  const handleVariableChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...variables];
    updated[index][field] = val;
    setVariables(updated);
  };

  const handleAddVariable = () => {
    setVariables([...variables, { key: "nouvelle_variable", value: "" }]);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    toast.success("Modèle de prompt enregistré avec succès");
  };

  const handleExecute = async () => {
    const promptToRun = handleCompile();
    setExecuting(true);
    setExecutionResult(null);
    try {
      const fullPrompt = `System: ${systemPrompt}\nUser: ${promptToRun}`;
      const res = await axios.post("/api/admin-extended/ai-router/simulate", 
        { prompt: fullPrompt, requestType: "content_generation" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } }
      );
      setExecutionResult(res.data);
      toast.success("Exécution terminée avec succès !");
    } catch (err: any) {
      const errData = err.response?.data;
      setExecutionResult({
        success: false,
        error: errData?.message || errData?.error || "Une erreur réseau est survenue"
      });
      toast.error("Échec de l'exécution de l'IA");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <AdminLayout title="Prompt Studio & Playground">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Prompt configuration */}
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Code className="h-4.5 w-4.5 text-primary" />
                Prompt Système de base
              </h3>
              <button 
                onClick={handleSave}
                className="flex items-center gap-1.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Sauvegarder
              </button>
            </div>
            
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-24 bg-muted border border-card-border rounded-xl px-3 py-2 text-sm font-mono text-muted-foreground focus:text-foreground transition-all focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="bg-card border rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2 mb-2">
              <Variable className="h-4.5 w-4.5 text-primary" />
              Modèle de prompt utilisateur
            </h3>

            <textarea
              value={userPromptTemplate}
              onChange={(e) => setUserPromptTemplate(e.target.value)}
              className="w-full h-32 bg-muted border border-card-border rounded-xl px-3 py-2 text-sm font-mono text-muted-foreground focus:text-foreground transition-all focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Rédige un article sur {{sujet}}..."
            />

            <div className="border-t border-card-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Variables de test</span>
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  + Ajouter
                </button>
              </div>

              {variables.map((v, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={v.key}
                    onChange={(e) => handleVariableChange(index, "key", e.target.value)}
                    className="w-1/3 bg-muted border border-card-border rounded-xl px-3 py-1.5 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={v.value}
                    onChange={(e) => handleVariableChange(index, "value", e.target.value)}
                    className="w-2/3 bg-muted border border-card-border rounded-xl px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariable(index)}
                    className="text-destructive hover:text-destructive/80 text-xs px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output & Test console */}
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                Playground & Exécution
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCompile}
                  className="bg-muted hover:bg-muted/80 text-foreground text-xs px-3.5 py-2 rounded-xl font-bold transition-all"
                >
                  Compiler
                </button>
                <button
                  disabled={executing}
                  onClick={handleExecute}
                  className="flex items-center gap-1.5 bg-[#10b981] hover:bg-[#0e9f6e] text-white text-xs px-4 py-2 rounded-xl font-bold disabled:opacity-50 transition-all"
                >
                  {executing ? "Génération..." : "Lancer le test"}
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Compiled Prompt view */}
            <div className="bg-muted border border-card-border rounded-xl p-4 text-xs font-mono h-24 overflow-y-auto space-y-1">
              <div className="text-white/40 uppercase tracking-widest text-[9px] font-bold">Prompt Utilisateur Compilé</div>
              <p className="text-muted-foreground">{compiledPrompt || "Cliquez sur compiler ou exécuter pour voir le prompt final."}</p>
            </div>

            {/* Execution response console */}
            <div className="bg-[#0f172a] text-slate-100 rounded-xl p-5 font-mono text-xs min-h-60 flex flex-col justify-between">
              <div>
                <span className="text-slate-500 block mb-3 border-b border-slate-800 pb-2 uppercase tracking-wider text-[10px]">Console de sortie</span>
                
                {executing && (
                  <div className="flex flex-col gap-2 py-4 items-center justify-center text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    <span>L'orchestrateur de routage intelligent résout la requête...</span>
                  </div>
                )}

                {!executing && !executionResult && (
                  <p className="text-slate-500 italic">Aucune sortie d'IA générée pour le moment. Cliquez sur "Lancer le test".</p>
                )}

                {executionResult && (
                  <div className="space-y-4">
                    {executionResult.success ? (
                      <>
                        <div className="space-y-2">
                          <div className="text-[#10b981] font-bold">✔ Génération réussie !</div>
                          <div className="text-slate-400 text-[11px] bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-1">
                            <div>Fournisseur utilisé : <span className="text-slate-100">{executionResult.providerUsed}</span></div>
                            <div>Modèle résolu : <span className="text-slate-100 font-mono">{executionResult.modelUsed}</span></div>
                          </div>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 max-h-48 overflow-y-auto font-sans text-slate-300 leading-relaxed">
                          {executionResult.text}
                        </div>
                      </>
                    ) : (
                      <div className="text-destructive font-bold bg-destructive/10 p-3 rounded-lg border border-destructive/20 space-y-1">
                        <div>✘ Échec de la génération</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-1">{executionResult.error}</div>
                      </div>
                    )}

                    {executionResult.attempts && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Historique du routage (Fallback) :</div>
                        <div className="space-y-1 text-[11px]">
                          {executionResult.attempts.map((att: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                              <span>[{i + 1}] {att.providerName} ({att.model})</span>
                              <span className={att.status === "success" ? "text-[#10b981]" : "text-destructive"}>
                                {att.status === "success" ? `Success (${att.latencyMs}ms)` : `Fail (${att.latencyMs}ms)`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
