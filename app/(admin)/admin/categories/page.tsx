"use client";
import { useState } from "react";
import {
  useAdminListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getAdminListCategoriesQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const COLOR_PRESETS = ["#006FE6", "#003B8F", "#65BDF2", "#0B1F3A", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function CatForm({ initial, onSubmit, isPending }: {
  initial?: any;
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    color: initial?.color || "#006FE6",
  });

  function slugify(text: string) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: initial ? f.slug : slugify(name) }));
  }

  return (
    <form id="cat-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nom *</Label>
        <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Nom de la catégorie" required />
      </div>
      <div className="space-y-1.5">
        <Label>Slug *</Label>
        <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="nom-categorie" required />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description courte" className="h-20 resize-none" />
      </div>
      <div className="space-y-2">
        <Label>Couleur</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_PRESETS.map((c) => (
            <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
              className="w-7 h-7 rounded-lg transition-all"
              style={{ backgroundColor: c, outline: form.color === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }}
            />
          ))}
          <Input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-12 h-8 p-1 rounded-lg cursor-pointer" />
        </div>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminListCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = (data as any)?.categories || (data as any)?.data || (Array.isArray(data) ? data : []);

  const [showCreate, setShowCreate] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
  }

  function handleCreate(formData: any) {
    createCategory.mutate({ data: formData }, {
      onSuccess: () => { toast.success("Catégorie créée !"); setShowCreate(false); refresh(); },
      onError: (err: any) => toast.error(err?.response?.data?.message || "Erreur"),
    });
  }

  function getCategoryId(category: any) {
    return category?.id || category?._id || category?.slug;
  }

  function handleUpdate(formData: any) {
    const categoryId = getCategoryId(editCat);
    updateCategory.mutate({ id: Number(categoryId) || categoryId, data: formData }, {
      onSuccess: () => { toast.success("Catégorie mise à jour !"); setEditCat(null); refresh(); },
      onError: (err: any) => toast.error(err?.response?.data?.message || "Erreur"),
    });
  }

  function handleDelete(id: string) {
    deleteCategory.mutate({ id: Number(id) || id as any }, {
      onSuccess: () => { toast.success("Catégorie supprimée"); setDeleteCatId(null); refresh(); },
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  }

  return (
    <AdminLayout title="Catégories">
      <div className="flex justify-end mb-6">
        <Button className="sparkle-gradient text-white border-0" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Nouvelle catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          : categories.map((cat: any, index: number) => (
              <div key={cat.id ?? cat.slug ?? `category-${index}`} className="bg-card border border-card-border rounded-2xl p-4 relative group hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: cat.color || "#006FE6" }}>
                    {cat.name?.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.slug}</p>
                  </div>
                </div>
                {cat.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{cat.description}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setEditCat(cat)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#006FE6] transition-colors px-2 py-1 rounded-lg hover:bg-muted">
                    <Edit className="h-3.5 w-3.5" /> Modifier
                  </button>
                  <button onClick={() => setDeleteCatId(getCategoryId(cat))} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle></DialogHeader>
          <CatForm onSubmit={handleCreate} isPending={createCategory.isPending} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button type="submit" form="cat-form" className="sparkle-gradient text-white border-0" disabled={createCategory.isPending}>
              {createCategory.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editCat} onOpenChange={() => setEditCat(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier la catégorie</DialogTitle></DialogHeader>
          {editCat && <CatForm initial={editCat} onSubmit={handleUpdate} isPending={updateCategory.isPending} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCat(null)}>Annuler</Button>
            <Button type="submit" form="cat-form" className="sparkle-gradient text-white border-0" disabled={updateCategory.isPending}>
              {updateCategory.isPending ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteCatId !== null} onOpenChange={() => setDeleteCatId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteCatId && handleDelete(deleteCatId)} className="bg-destructive text-white hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
