"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import {
  useCreateArticle,
  useAdminGetArticle,
  useUpdateArticle,
  useAdminListCategories,
  getAdminListCategoriesQueryKey,
  getAdminListArticlesQueryKey,
  getAdminGetArticleQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ChevronLeft, Save, Upload, X, ImageIcon, Loader2 } from "lucide-react";

function slugify(text: string) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-");
}

const TEMPLATES = [
  { value: "top-image", label: "Hero — Image pleine largeur + texte dessous" },
  { value: "left-image", label: "Split — Image gauche, texte droite" },
  { value: "right-image", label: "Split — Texte gauche, image droite" },
  { value: "magazine", label: "Magazine — Image centrée, grands titres" },
];

function TemplateOption({ value, label, selected, onSelect }: { value: string; label: string; selected: boolean; onSelect: () => void }) {
  const previewMap: Record<string, any> = {
    "top-image": (
      <div className="flex flex-col gap-1">
        <div className="h-16 rounded bg-muted-foreground/20 w-full" />
        <div className="h-3 rounded bg-muted-foreground/10 w-3/4" />
        <div className="h-3 rounded bg-muted-foreground/10 w-full" />
      </div>
    ),
    "left-image": (
      <div className="flex gap-2">
        <div className="h-12 rounded bg-muted-foreground/20 w-2/5" />
        <div className="flex flex-col gap-1 flex-1">
          <div className="h-3 rounded bg-muted-foreground/10 w-full" />
          <div className="h-3 rounded bg-muted-foreground/10 w-3/4" />
        </div>
      </div>
    ),
    "right-image": (
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <div className="h-3 rounded bg-muted-foreground/10 w-full" />
          <div className="h-3 rounded bg-muted-foreground/10 w-3/4" />
        </div>
        <div className="h-12 rounded bg-muted-foreground/20 w-2/5" />
      </div>
    ),
    "magazine": (
      <div className="flex flex-col items-center gap-1">
        <div className="h-3 rounded bg-muted-foreground/20 w-3/4" />
        <div className="h-6 rounded bg-muted-foreground/10 w-1/2" />
        <div className="h-3 rounded bg-muted-foreground/10 w-full" />
      </div>
    ),
  };

  return (
    <button type="button" onClick={onSelect} className={`rounded-lg border-2 p-3 text-left transition-all ${selected ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
      <div>{previewMap[value]}</div>
      <p className="mt-2 text-xs text-muted-foreground leading-snug">{label}</p>
    </button>
  );
}

export default function ArticleForm() {
  const params = useParams();
  const paramsEdit = params;
  const isEdit = !!paramsEdit;
  const articleId = paramsEdit?.id ? paramsEdit.id : undefined;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: existingData, isLoading: loadingExisting } = useAdminGetArticle(articleId as any, {
    query: {
      enabled: isEdit && !!articleId,
      queryKey: getAdminGetArticleQueryKey(articleId as any || ""),
    },
  });
  const { data: categoriesData } = useAdminListCategories();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  // Support both admin format ({categories: [...]}) and array format
  const rawCategories: any[] = (categoriesData as any)?.categories || (Array.isArray(categoriesData) ? categoriesData : []);
  const existing = (existingData as any)?.article || existingData;

  // Merge the article's embedded category immediately so the Select works
  // before the full categories list finishes loading
  const categories = (() => {
    const list = [...rawCategories];
    if (existing?.category) {
      const embCatId = String(existing.category._id || existing.category.id || "");
      const alreadyIn = list.some((c) => String(c._id || c.id || "") === embCatId);
      if (!alreadyIn && embCatId) {
        list.unshift({ _id: embCatId, id: embCatId, name: existing.category.name });
      }
    }
    return list;
  })();

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", coverImage: "",
    categoryId: "", status: "draft" as "draft" | "published",
    featured: false, tags: "", readTime: "5",
  });
  // New: support multiple images and template choice
  const [images, setImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  const [template, setTemplate] = useState<string>("top-image");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (existing) {
      // Normalize status: archived -> draft for UI (select only supports draft/published)
      const normalizedStatus = existing.status === "published" ? "published" : "draft";
      setForm({
        title: existing.title || "",
        slug: existing.slug || "",
        excerpt: existing.excerpt || "",
        content: existing.content || "",
        coverImage: existing.coverImage || "",
        categoryId: existing.categoryId ? String(existing.categoryId) : "",
        status: normalizedStatus,
        featured: existing.featured || false,
        tags: Array.isArray(existing.tags) ? existing.tags.join(", ") : "",
        readTime: String(existing.readTime || 5),
      });

      // initialize images/template if present on existing article
      if (existing.images && Array.isArray(existing.images)) {
        setImages(existing.images || []);
        const idx = existing.images.findIndex((u: string) => u === (existing.coverImage || ""));
        setPrimaryImageIndex(idx >= 0 ? idx : 0);
      }
      if (existing.template) setTemplate(existing.template);
    }
  }, [existing]);

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title, slug: isEdit ? f.slug : slugify(title) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: any = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      coverImage: form.coverImage || null,
      categoryId: form.categoryId ? (form.categoryId as any) : null,
      status: form.status,
      featured: form.featured,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      readTime: Number(form.readTime) || 5,
    };

    // include images and template (frontend-only fields if backend ignores them)
    body.images = images;
    body.template = template;
    if (images.length > 0) {
      const primary = images[primaryImageIndex] || images[0];
      body.coverImage = primary;
    }

    if (isEdit && articleId) {
      updateArticle.mutate({ id: articleId as any, data: body }, {
        onSuccess: () => {
          toast.success("Article mis à jour !");
          queryClient.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
          router.push("/admin/articles");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Erreur lors de la mise à jour"),
      });
    } else {
      createArticle.mutate({ data: body }, {
        onSuccess: () => {
          toast.success("Article créé !");
          queryClient.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
          router.push("/admin/articles");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Erreur lors de la création"),
      });
    }
  }

  const isPending = createArticle.isPending || updateArticle.isPending;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` },
        body: JSON.stringify({ data: base64, filename: file.name, mimeType: file.type }),
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      // add to images array and set primary if none
      setImages((s) => {
        const next = [...s, url];
        // if no coverImage set, mark this as primary
        if (!form.coverImage) {
          setPrimaryImageIndex(next.length - 1);
          setForm((f) => ({ ...f, coverImage: url }));
        }
        return next;
      });
      toast.success("Image uploadée avec succès !");
      return url;
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'upload de l'image");
      return null;
    } finally {
      setUploading(false);
    }
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }

  // Drop handler for textarea: insert uploaded image into content
  async function handleContentDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const url = await handleImageUpload(file);
    if (!url) return;
    const textarea = contentRef.current;
    if (!textarea) {
      setForm((f) => ({ ...f, content: f.content + `<p><img src=\"${url}\" alt=\"\" /></p>` }));
      return;
    }
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    const insertion = `<p><img src="${url}" alt="" /></p>`;
    const nextContent = before + insertion + after;
    setForm((f) => ({ ...f, content: nextContent }));
    // place cursor after inserted content
    requestAnimationFrame(() => {
      if (contentRef.current) {
        const pos = start + insertion.length;
        contentRef.current.selectionStart = pos;
        contentRef.current.selectionEnd = pos;
        contentRef.current.focus();
      }
    });
  }

  if (isEdit && loadingExisting) {
    return (
      <AdminLayout title={isEdit ? "Modifier l'article" : "Nouvel article"}>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Modifier l'article" : "Nouvel article"}>
      <div className="mb-6">
        <Link href="/admin/articles" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Articles
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Titre *</Label>
              <Input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Titre de l'article" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug URL *</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="titre-de-larticle" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Résumé</Label>
              <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder="Résumé court de l'article" className="h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Contenu (HTML) *</Label>
              <Textarea
                id="content"
                ref={contentRef as any}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                onDrop={handleContentDrop}
                onDragOver={(e) => e.preventDefault()}
                placeholder="<p>Contenu de l'article en HTML...</p>"
                required
                className="h-64 resize-y font-mono text-sm"
              />
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
            <Label>Image de couverture</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); e.target.value = ""; }}
            />
            {/* Gallery: show thumbnails for images array */}
            {images.length > 0 ? (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {images.map((img, idx) => (
                    <div
                      key={img}
                      draggable
                      onDragStart={(ev) => { setDragIndex(idx); ev.dataTransfer.effectAllowed = 'move'; }}
                      onDragOver={(ev) => ev.preventDefault()}
                      onDrop={(ev) => {
                        ev.preventDefault();
                        const from = dragIndex;
                        const to = idx;
                        if (from === null || from === undefined) return;
                        if (from === to) return;
                        setImages((s) => {
                          const next = [...s];
                          const [moved] = next.splice(from, 1);
                          next.splice(to, 0, moved);
                          return next;
                        });
                        // update primary index if needed
                        setPrimaryImageIndex((p) => {
                          if (from === p) return to;
                          if (from < p && to >= p) return p - 1;
                          if (from > p && to <= p) return p + 1;
                          return p;
                        });
                        setDragIndex(null);
                      }}
                      className="relative group rounded-lg overflow-hidden border border-border"
                    >
                      <img src={img} alt={`img-${idx}`} className="w-full h-24 object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button type="button" onClick={() => {
                          // remove image
                          setImages((s) => s.filter((_, i) => i !== idx));
                          // adjust primary index
                          setPrimaryImageIndex((p) => (idx === p ? 0 : p > idx ? p - 1 : p));
                          if (idx === primaryImageIndex) {
                            const next = images.filter((_, i) => i !== idx)[0];
                            setForm((f) => ({ ...f, coverImage: next || "" }));
                          }
                        }} className="bg-white/90 p-1 rounded shadow text-sm"> <X className="h-3 w-3" /></button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <button type="button" onClick={() => {
                          setPrimaryImageIndex(idx);
                          setForm((f) => ({ ...f, coverImage: img }));
                        }} className={`px-2 py-1 text-xs font-medium rounded ${primaryImageIndex === idx ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-800'}`}>
                          {primaryImageIndex === idx ? 'Image principale' : 'Définir principale'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/90 text-gray-800 px-3 py-2 rounded-lg border hover:bg-white"> <Upload className="h-4 w-4 mr-2 inline" /> Ajouter</button>
                  <button type="button" onClick={() => { setImages([]); setForm((f) => ({ ...f, coverImage: "" })); setPrimaryImageIndex(0); }} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-100 hover:bg-red-50">Supprimer tout</button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploading ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/10" : "border-border hover:border-blue-400 hover:bg-muted/50"}`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <p className="text-sm text-muted-foreground">Upload en cours...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cliquez ou glissez une image ici</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Max 10 Mo</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Publication</h3>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select key={form.status} value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as "draft" | "published" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select key={form.categoryId || "none"} value={form.categoryId || "none"} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {categories.map((c: any) => {
                    const catId = String(c._id || c.id || "");
                    return catId ? <SelectItem key={catId} value={catId}>{c.name}</SelectItem> : null;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="readTime">Temps de lecture (min)</Label>
              <Input id="readTime" type="number" min="1" max="60" value={form.readTime} onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Template d'affichage</Label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <TemplateOption
                    key={t.value}
                    value={t.value}
                    label={t.label}
                    selected={template === t.value}
                    onSelect={() => setTemplate(t.value)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Article à la une</Label>
              <Switch id="featured" checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input id="tags" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="IA, technologie, innovation" />
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="sparkle-gradient text-white border-0 w-full" disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'article"}
            </Button>
            <Link href="/admin/articles">
              <Button type="button" variant="outline" className="w-full">Annuler</Button>
            </Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
