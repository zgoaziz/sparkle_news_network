"use client";
import { useState, useRef, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import {
  Plus, Trash2, Upload, X, Layers, Check, Lock,
  ImageIcon, Sparkles
} from "lucide-react";

// ──────────────────────────────────────────────
// Types & Storage
// ──────────────────────────────────────────────
export interface PostTemplate {
  id: string;
  name: string;
  imagePreview: string; // base64 — l'IA lit cette image directement
  createdAt: string;
}

const STORAGE_KEY = "sparkle_post_templates";

export function loadTemplates(): PostTemplate[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
export function saveTemplates(tpls: PostTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tpls));
}
function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function newId() { return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

// ══════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════
export default function AdminTemplates() {
  const [templates, setTemplates] = useState<PostTemplate[]>(loadTemplates);
  const [showModal, setShowModal] = useState(false);

  // Form state (minimal)
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const persist = (updated: PostTemplate[]) => {
    setTemplates(updated);
    saveTemplates(updated);
  };

  const openAdd = () => {
    setName("");
    setImagePreview(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setImagePreview(null);
  };

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image trop lourde (max 10 Mo)"); return; }
    const b64 = await fileToBase64(file);
    setImagePreview(b64);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Nom du template requis"); return; }
    if (!imagePreview) { toast.error("Veuillez uploader une image de template"); return; }

    setSaving(true);
    await new Promise(r => setTimeout(r, 350));

    const newTpl: PostTemplate = {
      id: newId(),
      name: name.trim(),
      imagePreview,
      createdAt: new Date().toISOString(),
    };
    persist([...templates, newTpl]);
    toast.success(`Template "${name}" ajouté avec succès !`);
    setSaving(false);
    closeModal();
  };

  const handleDelete = (id: string, tplName: string) => {
    if (!confirm(`Supprimer le template "${tplName}" ?`)) return;
    persist(templates.filter(t => t.id !== id));
    toast.success("Template supprimé");
  };

  return (
    <AdminLayout title="Gestion des Templates">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <p className="text-sm text-muted-foreground">
            Ajoutez vos templates de post. L'agent IA analyse directement l'image et reproduit fidèlement le style — sans modification.
          </p>
          {/* Read-only notice */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-xl font-semibold">
            <Lock className="h-3.5 w-3.5" />
            L'IA lit et applique le template tel quel — aucune altération
          </div>
        </div>
        <button
          onClick={openAdd}
          className="shrink-0 flex items-center gap-2 bg-[#006FE6] hover:bg-[#0052A3] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter un template
        </button>
      </div>

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="bg-card border-2 border-dashed border-card-border rounded-2xl p-16 flex flex-col items-center gap-5 text-muted-foreground">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
            <Layers className="h-10 w-10 text-primary/40" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-bold text-foreground text-base">Aucun template pour l'instant</p>
            <p className="text-sm">Uploadez votre première image de template</p>
            <p className="text-xs text-muted-foreground/60">L'agent IA reproduira exactement ce style lors de la génération</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#006FE6] hover:bg-[#0052A3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter mon premier template
          </button>
        </div>
      )}

      {/* Templates grid */}
      {templates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {templates.map(tpl => (
            <div
              key={tpl.id}
              className="bg-card border border-card-border rounded-2xl overflow-hidden group hover:border-primary/40 hover:shadow-lg transition-all duration-200"
            >
              {/* Image preview */}
              <div className="relative h-52 bg-muted overflow-hidden">
                <img
                  src={tpl.imagePreview}
                  alt={tpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Lock badge — always visible */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full">
                  <Lock className="h-2.5 w-2.5" />
                  Fidèle à l'original
                </div>

                {/* Delete button on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                  <button
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Info footer */}
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{tpl.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(tpl.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full">
                  <Sparkles className="h-2.5 w-2.5" />
                  Prêt
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal — Nom + Image uniquement ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-card-border w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-primary" />
                Nouveau template
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* Name */}
              <div>
                <label className="text-xs font-semibold block mb-1.5">
                  Nom du template <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  autoFocus
                  type="text"
                  placeholder="Ex: Post LinkedIn Pro, Story Instagram Dark…"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="text-xs font-semibold block mb-1.5">
                  Image du template <span className="text-destructive">*</span>
                </label>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-card-border">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full max-h-52 object-contain bg-muted/50"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {/* Lock indicator on preview */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      <Lock className="h-3 w-3" />
                      L'IA utilisera cette image exactement
                    </div>
                  </div>
                ) : (
                  <div
                    ref={dropRef}
                    onDrop={onDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-card-border hover:border-primary/60 rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-semibold">Glissez l'image ici</p>
                      <p className="text-xs">ou <span className="text-primary font-semibold">cliquez pour choisir</span></p>
                    </div>
                    <p className="text-[11px] text-muted-foreground/50">JPG, PNG, WEBP — max 10 Mo</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async e => { if (e.target.files?.[0]) await handleImageUpload(e.target.files[0]); }}
                />
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
                <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  L'agent IA <strong>analyse et reproduit fidèlement</strong> cette image comme template — couleurs, mise en page, typographie — sans la modifier.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim() || !imagePreview}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-[#006FE6] text-white hover:bg-[#0052A3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? (
                    <><div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Enregistrement…</>
                  ) : (
                    <><Check className="h-3.5 w-3.5" />Créer le template</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
