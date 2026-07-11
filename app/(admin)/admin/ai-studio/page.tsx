"use client";
import { useState, useRef, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import {
  Sparkles, Upload, Image as ImageIcon, FileText, Code, Play,
  RefreshCw, Copy, Download, Hash, X, ChevronRight, Layers,
  Check, AlertTriangle, Variable, Save, Lock, Share2
} from "lucide-react";
import { loadTemplates } from "../ai-templates/page";
import { useRouter, usePathname } from "next/navigation";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface PostTemplate {
  id: string;
  name: string;
  imagePreview: string; // base64 — l'IA lit cette image directement
  createdAt: string;
}

interface GenerationResult {
  success: boolean;
  headline?: string;
  article?: string;
  caption?: string;
  description?: string;
  hashtags?: string[];
  imagePrompt?: string;
  template?: string;
  imageUrl?: string;
  imageError?: string;
  error?: string;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const TABS = [
  { id: "studio", label: "Studio de Publication", icon: Sparkles },
  { id: "writer", label: "Rédacteur IA", icon: FileText },
  { id: "prompt", label: "Prompt Studio", icon: Code },
] as const;
type TabId = typeof TABS[number]["id"];

// ══════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════
export default function AdminPostStudio() {
  const [activeTab, setActiveTab] = useState<TabId>("studio");

  return (
    <AdminLayout title="Studio de Publication">
      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-1 bg-muted/60 border border-card-border p-1 rounded-2xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === id
                ? "bg-[#006FE6] text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "studio" && <StudioTab />}
      {activeTab === "writer" && <WriterTab />}
      {activeTab === "prompt" && <PromptTab />}
    </AdminLayout>
  );
}

// ══════════════════════════════════════════════
// Tab 1 — Studio de Publication
// ══════════════════════════════════════════════
function StudioTab() {
  const router = useRouter();
  const _ = usePathname();
  const [templates] = useState<PostTemplate[]>(loadTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null);
  const [textInput, setTextInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFileDrop = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis"); return; }
    const b64 = await fileToBase64(file);
    setUploadedImage(b64);
    setUploadedImageName(file.name);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileDrop(file);
  }, [handleFileDrop]);

  const handleGenerate = async () => {
    if (!textInput.trim()) { toast.error("Saisissez un texte ou sujet"); return; }
    setGenerating(true);
    setResult(null);

    try {
      console.log('[Studio] Starting generation with:', { 
        textLength: textInput.length, 
        template: selectedTemplate?.name, 
        hasImage: !!uploadedImage 
      });

      const response = await axios.post("/api/admin-extended/studio/generate",
        {
          newsText: textInput,
          template: selectedTemplate?.name || null,
          templateImage: selectedTemplate?.imagePreview || null,
          uploadedImage: uploadedImage || null,
          language: "fr"
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } }
      );

      console.log('[Studio] API response:', response.data);

      if (response.data.success) {
        setResult(response.data);
        toast.success("Post généré avec succès !");
      } else {
        setResult({ 
          success: false, 
          error: response.data.error || "Erreur de génération" 
        });
        toast.error("Erreur de génération");
      }
    } catch (err: any) {
      console.error('[Studio] Generation error:', err);
      const errorMsg = err.response?.data?.error || err.message || "Erreur réseau";
      setResult({ 
        success: false, 
        error: errorMsg 
      });
      toast.error("Erreur de génération");
    } finally {
      setGenerating(false);
    }
  };

  const copyText = () => {
    const content = [
      result?.headline,
      result?.description,
      result?.caption,
      result?.hashtags?.join(" ")
    ].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* ── Left panel: inputs ── */}
      <div className="xl:col-span-2 space-y-5">

        {/* Template selector */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-primary" />
            Template de post
          </h3>

          {templates.length === 0 ? (
            <div className="text-center py-5 text-muted-foreground text-xs space-y-2 border border-dashed border-card-border rounded-xl p-5">
              <Layers className="h-6 w-6 mx-auto opacity-30" />
              <p>Aucun template — allez dans <strong className="text-foreground">Templates</strong> pour en créer</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* No template option */}
              <button
                onClick={() => setSelectedTemplate(null)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm ${
                  !selectedTemplate
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-card-border hover:border-primary/40 text-muted-foreground"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 opacity-40" />
                </div>
                <div>
                  <div className="font-semibold">Sans template</div>
                  <div className="text-xs opacity-60">Style libre défini par l'IA</div>
                </div>
                {!selectedTemplate && <Check className="h-4 w-4 ml-auto" />}
              </button>

              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm ${
                    selectedTemplate?.id === tpl.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-card-border hover:border-primary/40"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                    <img src={tpl.imagePreview} alt={tpl.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{tpl.name}</div>
                    <div className="text-xs opacity-60 truncate">Template personnalisé</div>
                  </div>
                  {selectedTemplate?.id === tpl.id && <Check className="h-4 w-4 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text input */}
        <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Contenu du post
          </h3>
          <textarea
            rows={4}
            placeholder="Décrivez le sujet, l'actualité ou le message de votre post…"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            className="w-full bg-muted border border-card-border rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none resize-none transition-all"
          />
        </div>

        {/* Image upload */}
        <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Image de référence <span className="text-muted-foreground font-normal">(optionnel)</span>
          </h3>

          {uploadedImage ? (
            <div className="relative rounded-xl overflow-hidden border border-card-border">
              <img src={uploadedImage} alt="Upload" className="w-full max-h-40 object-cover" />
              <button
                onClick={() => { setUploadedImage(null); setUploadedImageName(""); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="px-3 py-1.5 bg-muted/80 text-xs text-muted-foreground truncate">{uploadedImageName}</div>
            </div>
          ) : (
            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-card-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-7 w-7 opacity-40" />
              <span className="text-xs text-center">Glissez une image ici ou <span className="text-primary font-semibold">cliquez</span></span>
              <span className="text-[10px] opacity-50">JPG, PNG, WEBP</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async e => { if (e.target.files?.[0]) await handleFileDrop(e.target.files[0]); }}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {generating ? (
            <><RefreshCw className="h-4 w-4 animate-spin" />Génération en cours…</>
          ) : (
            <><Sparkles className="h-4 w-4" />Générer le post complet</>
          )}
        </button>
      </div>

      {/* ── Right panel: output ── */}
      <div className="xl:col-span-3 space-y-5">

        {/* Empty state */}
        {!generating && !result && (
          <div className="bg-card border border-card-border rounded-2xl min-h-[500px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#006FE6]/20 to-[#7C3AED]/20 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary/40" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">Votre post apparaîtra ici</p>
              <p className="text-sm text-muted-foreground max-w-xs">Saisissez un texte, sélectionnez un template et cliquez sur Générer</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
              <div className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Image</div>
              <ChevronRight className="h-3 w-3" />
              <div className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Description</div>
              <ChevronRight className="h-3 w-3" />
              <div className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> Hashtags</div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {generating && (
          <div className="bg-card border border-card-border rounded-2xl min-h-[500px] flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="h-8 w-8 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold">Deux agents IA travaillent en parallèle…</p>
              <p className="text-sm text-muted-foreground">Image + Description & Hashtags</p>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Agent Image
              </div>
              <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
                Agent Texte
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !generating && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Résultat du post</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (result?.description) {
                      window.location.href = `/admin/publishing?post_content=${encodeURIComponent(result.description)}`;
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Programmer
                </button>
                <button
                  onClick={copyText}
                  className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                >
                  {copiedText ? <><Check className="h-3.5 w-3.5 text-green-500" />Copié !</> : <><Copy className="h-3.5 w-3.5" />Copier tout</>}
                </button>
              </div>
            </div>

            {/* Image output */}
            <div className="bg-card border border-card-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
                <ImageIcon className="h-4 w-4 text-blue-400" />
                Image générée
                {result.imageUrl && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                    ✓ Succès
                  </span>
                )}
                {result.imageError && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                    ✗ Échec
                  </span>
                )}
              </div>
              {result.imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden bg-muted border border-card-border">
                  <img src={result.imageUrl} alt="Post généré" className="w-full max-h-64 object-contain rounded-xl" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={() => window.open(result.imageUrl, "_blank")}
                      className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />Télécharger
                    </button>
                  </div>
                </div>
              ) : result.imageError ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-xs">{result.imageError}</p>
                </div>
              ) : (
                <div className="bg-muted/50 border border-card-border rounded-xl p-4 text-center text-muted-foreground text-xs">
                  En attente de génération...
                </div>
              )}
            </div>

            {/* Headline output */}
            {result.headline && (
              <div className="bg-card border border-card-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-purple-400" />
                  Titre (Headline)
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-lg font-bold text-primary">
                  {result.headline}
                </div>
              </div>
            )}

            {/* Article output */}
            {result.article && (
              <div className="bg-card border border-card-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-purple-400" />
                  Article complet
                </div>
                <div className="bg-muted/50 border border-card-border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground max-h-48 overflow-y-auto">
                  {result.article}
                </div>
              </div>
            )}

            {/* Text + hashtags output */}
            <div className="bg-card border border-card-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-purple-400" />
                Description du post
              </div>

              {result.description ? (
                <>
                  <div className="bg-muted/50 border border-card-border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground max-h-48 overflow-y-auto">
                    {result.description}
                  </div>

                  {result.caption && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-900">
                      <div className="text-xs font-semibold mb-1">Caption:</div>
                      {result.caption}
                    </div>
                  )}

                  {result.hashtags && result.hashtags.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" />
                        Hashtags
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.hashtags.map((tag, i) => (
                          <span key={i} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-xs">{result.error || "Aucune description générée"}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Tab 2 — Rédacteur IA
// ══════════════════════════════════════════════
function WriterTab() {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState("500");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) { toast.error("Veuillez saisir un sujet"); return; }
    setGenerating(true);
    setResult(null);
    const prompt = `Génère un article structuré en français.\nSujet: ${topic}\nLongueur: ${length} mots.\nMots clés SEO: ${keywords}`;
    try {
      const res = await axios.post("/api/admin-extended/ai-router/simulate",
        { prompt, requestType: "content_generation" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } }
      );
      setResult(res.data);
      toast.success("Article rédigé !");
    } catch (err: any) {
      const d = err.response?.data;
      setResult({ success: false, error: d?.message || d?.error || "Erreur réseau" });
      toast.error("Échec de la rédaction");
    } finally { setGenerating(false); }
  };

  const copy = () => {
    if (result?.text) { navigator.clipboard.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-card border border-card-border rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Paramètres</h3>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Sujet de l'article</label>
            <textarea required rows={3} value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="Décrivez l'actualité ou le sujet à rédiger…"
              className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Longueur</label>
            <select value={length} onChange={e => setLength(e.target.value)} className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm">
              <option value="200">Court (~200 mots)</option>
              <option value="500">Moyen (~500 mots)</option>
              <option value="1000">Long (~1000 mots)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Mots-clés SEO</label>
            <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="innovation, climat, startup"
              className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <button type="submit" disabled={generating}
            className="w-full py-2.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {generating ? <><RefreshCw className="h-4 w-4 animate-spin" />Rédaction…</> : <><FileText className="h-4 w-4" />Rédiger</>}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-5 min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h3 className="font-bold text-sm">Brouillon rédigé</h3>
          {result?.success && (
            <button onClick={copy} className="flex items-center gap-1 bg-muted hover:bg-muted/80 text-xs px-3 py-1.5 rounded-xl font-bold">
              {copied ? <><Check className="h-3.5 w-3.5 text-green-500" />Copié</> : <><Copy className="h-3.5 w-3.5" />Copier</>}
            </button>
          )}
        </div>

        {generating && <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006FE6]" /><span className="text-sm">Rédaction en cours…</span></div>}
        {!generating && !result && <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground"><FileText className="h-10 w-10 opacity-20" /><p className="text-sm">Aucun article rédigé</p></div>}
        {result && !generating && (
          <div className="flex-1 space-y-3">
            {result.success
              ? <div className="bg-muted/40 border border-card-border p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line overflow-y-auto max-h-96">{result.text}</div>
              : <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex gap-3 text-destructive"><AlertTriangle className="h-5 w-5 shrink-0" /><p className="text-xs">{result.error}</p></div>
            }
            {result.success && (
              <div className="text-xs text-muted-foreground border-t pt-3 flex items-center justify-between">
                <span>Via : <strong className="text-foreground">{result.providerUsed} ({result.modelUsed})</strong></span>
                <span className="flex items-center gap-1 text-green-400 font-semibold"><Check className="h-3.5 w-3.5" />Prêt</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Tab 3 — Prompt Studio
// ══════════════════════════════════════════════
function PromptTab() {
  const [systemPrompt, setSystemPrompt] = useState(
    "Tu es un journaliste sénior de Sparkle News. Rédige un article captivant, neutre et professionnel."
  );
  const [userTemplate, setUserTemplate] = useState(
    "Rédige un article sur : {{sujet}}.\nLongueur : {{longueur}} mots.\nMots clés : {{mots_cles}}."
  );
  const [variables, setVariables] = useState([
    { key: "sujet", value: "L'essor de la fusion nucléaire en Europe" },
    { key: "longueur", value: "500" },
    { key: "mots_cles", value: "énergie propre, startup, innovation" },
  ]);
  const [compiled, setCompiled] = useState("");
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<any>(null);

  const compile = () => {
    let r = userTemplate;
    variables.forEach(v => { r = r.replaceAll(`{{${v.key}}}`, v.value); });
    setCompiled(r);
    return r;
  };

  const execute = async () => {
    const p = compile();
    setExecuting(true); setExecResult(null);
    try {
      const res = await axios.post("/api/admin-extended/ai-router/simulate",
        { prompt: `System: ${systemPrompt}\nUser: ${p}`, requestType: "content_generation" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` } }
      );
      setExecResult(res.data);
      toast.success("Exécution terminée !");
    } catch (err: any) {
      const d = err.response?.data;
      setExecResult({ success: false, error: d?.message || d?.error || "Erreur réseau" });
      toast.error("Échec d'exécution");
    } finally { setExecuting(false); }
  };

  const changeVar = (i: number, field: "key" | "value", val: string) => {
    const u = [...variables]; u[i][field] = val; setVariables(u);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-5">
        <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2"><Code className="h-4 w-4 text-primary" />Prompt Système</h3>
            <button onClick={() => toast.success("Sauvegardé")} className="flex items-center gap-1.5 bg-[#006FE6] text-white text-xs px-3 py-1.5 rounded-xl font-semibold"><Save className="h-3.5 w-3.5" />Sauvegarder</button>
          </div>
          <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={3}
            className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm font-mono text-muted-foreground focus:text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2"><Variable className="h-4 w-4 text-primary" />Modèle utilisateur</h3>
          <textarea value={userTemplate} onChange={e => setUserTemplate(e.target.value)} rows={4}
            placeholder="Rédige un article sur {{sujet}}…"
            className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm font-mono text-muted-foreground focus:text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="border-t border-card-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Variables de test</span>
              <button onClick={() => setVariables([...variables, { key: "var", value: "" }])} className="text-xs text-primary font-bold hover:underline">+ Ajouter</button>
            </div>
            {variables.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={v.key} onChange={e => changeVar(i, "key", e.target.value)}
                  className="w-1/3 bg-muted border border-card-border rounded-xl px-3 py-1.5 text-xs font-mono" />
                <input type="text" value={v.value} onChange={e => changeVar(i, "value", e.target.value)}
                  className="flex-1 bg-muted border border-card-border rounded-xl px-3 py-1.5 text-xs" />
                <button onClick={() => setVariables(variables.filter((_, j) => j !== i))} className="text-destructive text-lg leading-none px-2">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Playground</h3>
            <div className="flex gap-2">
              <button onClick={compile} className="bg-muted hover:bg-muted/80 text-xs px-3.5 py-2 rounded-xl font-bold">Compiler</button>
              <button onClick={execute} disabled={executing}
                className="flex items-center gap-1.5 bg-[#10b981] hover:bg-[#0e9f6e] text-white text-xs px-4 py-2 rounded-xl font-bold disabled:opacity-50"
              >
                {executing ? "…" : <><Play className="h-3.5 w-3.5 fill-current" />Exécuter</>}
              </button>
            </div>
          </div>

          <div className="bg-muted border border-card-border rounded-xl p-3 text-xs font-mono min-h-16 overflow-y-auto">
            <div className="text-white/30 uppercase tracking-widest text-[9px] font-bold mb-1">Prompt compilé</div>
            <p className="text-muted-foreground">{compiled || "Cliquez sur Compiler…"}</p>
          </div>

          <div className="bg-[#0f172a] text-slate-100 rounded-xl p-4 font-mono text-xs min-h-52 flex flex-col">
            <span className="text-slate-500 block mb-3 border-b border-slate-800 pb-2 uppercase tracking-wider text-[10px]">Console de sortie</span>
            {executing && <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /><span>Résolution…</span></div>}
            {!executing && !execResult && <p className="text-slate-500 italic">Aucune sortie. Cliquez sur "Exécuter".</p>}
            {execResult && !executing && (
              <div className="space-y-3">
                {execResult.success ? (
                  <>
                    <div className="text-[#10b981] font-bold">✔ Génération réussie</div>
                    <div className="text-slate-400 text-[11px] bg-slate-900 border border-slate-800 p-2 rounded-lg">
                      <div>Fournisseur : <span className="text-slate-100">{execResult.providerUsed}</span></div>
                      <div>Modèle : <span className="text-slate-100 font-mono">{execResult.modelUsed}</span></div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 max-h-48 overflow-y-auto font-sans text-slate-300 leading-relaxed">{execResult.text}</div>
                  </>
                ) : (
                  <div className="text-destructive font-bold bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    ✘ Échec<div className="text-[11px] font-mono text-slate-400 mt-1">{execResult.error}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
