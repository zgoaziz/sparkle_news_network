"use client";
import { useState } from "react";
import {
  useAdminGetSponsors,
  useAdminCreateSponsor,
  useAdminUpdateSponsor,
  useAdminDeleteSponsor,
  useAdminToggleSponsor,
  getAdminSponsorsQueryKey,
  type Sponsor,
  type SponsorPlacement,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, Megaphone, Monitor, LayoutGrid, Globe, ToggleLeft, ToggleRight, ExternalLink, Image as ImageIcon, Loader2, X
} from "lucide-react";

// ── Placement config ──────────────────────────────────────────────────────────
const PLACEMENTS: { value: SponsorPlacement; label: string; icon: any; color: string; desc: string }[] = [
  { value: "navbar", label: "Barre de navigation", icon: Monitor, color: "#006FE6", desc: "Scrolling dans la barre du haut" },
  { value: "sidebar", label: "Sidebar / Accueil", icon: LayoutGrid, color: "#10b981", desc: "Bloc sur la page d'accueil" },
  { value: "both", label: "Partout", icon: Globe, color: "#8b5cf6", desc: "Navbar + Sidebar simultanément" },
];

function placementConfig(p: SponsorPlacement) {
  return PLACEMENTS.find((x) => x.value === p) || PLACEMENTS[0];
}

// ── Form Component ────────────────────────────────────────────────────────────
function SponsorForm({ initial, onSubmit, isPending }: {
  initial?: Partial<Sponsor>;
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    content: initial?.content || "",
    linkUrl: initial?.linkUrl || "",
    imageUrl: initial?.imageUrl || "",
    placement: (initial?.placement as SponsorPlacement) || "navbar",
    isActive: initial?.isActive !== false,
  });
  const [uploading, setUploading] = useState(false);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` 
          },
          body: JSON.stringify({ 
            data: reader.result, 
            filename: file.name, 
            mimeType: file.type 
          }),
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        set("imageUrl", url);
        toast.success("Image ajoutée !");
      } catch {
        toast.error("Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <form
      id="sponsor-form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-5"
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="sponsor-name">Nom du sponsor *</Label>
        <Input
          id="sponsor-name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ex: Acme Corp, BNP Paribas…"
          required
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label htmlFor="sponsor-content">Message / Contenu *</Label>
        <Textarea
          id="sponsor-content"
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="Texte affiché au visiteur. Pour la navbar, gardez-le court (< 80 caractères)."
          className="h-24 resize-none"
          required
        />
        <p className="text-xs text-muted-foreground">
          Pour la navbar, ce texte apparaît dans le fil défilant. Pour le sidebar, il est affiché dans un bloc.
        </p>
      </div>

      {/* Link URL */}
      <div className="space-y-1.5">
        <Label htmlFor="sponsor-link">Lien (optionnel)</Label>
        <Input
          id="sponsor-link"
          value={form.linkUrl}
          onChange={(e) => set("linkUrl", e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-1.5">
        <Label>Image (pour Sidebar & Accueil)</Label>
        {form.imageUrl ? (
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border">
            <img src={form.imageUrl} alt="Sponsor" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => set("imageUrl", "")}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-xl cursor-pointer transition-colors border border-border border-dashed">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {uploading ? "Upload..." : "Ajouter une image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        )}
      </div>

      {/* Placement */}
      <div className="space-y-2">
        <Label>Emplacement d'affichage *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLACEMENTS.map(({ value, label, icon: Icon, color, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("placement", value)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                form.placement === value
                  ? "border-current shadow-sm"
                  : "border-border hover:border-muted-foreground/40"
              }`}
              style={form.placement === value ? { borderColor: color, backgroundColor: `${color}10` } : {}}
            >
              <Icon
                className="h-5 w-5 mb-2"
                style={{ color: form.placement === value ? color : undefined }}
              />
              <div className="font-semibold text-sm">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              {form.placement === value && (
                <div
                  className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40">
        <button
          type="button"
          onClick={() => set("isActive", !form.isActive)}
          className={`transition-colors ${form.isActive ? "text-emerald-600" : "text-muted-foreground"}`}
        >
          {form.isActive ? (
            <ToggleRight className="h-7 w-7" />
          ) : (
            <ToggleLeft className="h-7 w-7" />
          )}
        </button>
        <div>
          <div className="text-sm font-semibold">{form.isActive ? "Sponsor actif" : "Sponsor inactif"}</div>
          <div className="text-xs text-muted-foreground">
            {form.isActive ? "Visible sur le site" : "Masqué du site"}
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Sponsor Card ──────────────────────────────────────────────────────────────
function SponsorCard({
  sponsor,
  onEdit,
  onDelete,
  onToggle,
}: {
  sponsor: Sponsor;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const placement = placementConfig(sponsor.placement);
  const PlacementIcon = placement.icon;

  return (
    <div
      className={`bg-card border rounded-2xl p-5 transition-all group hover:shadow-md ${
        sponsor.isActive ? "border-card-border" : "border-dashed border-muted opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {sponsor.imageUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border">
            <img src={sponsor.imageUrl} alt={sponsor.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${placement.color}20` }}
          >
            <Megaphone className="h-5 w-5" style={{ color: placement.color }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate">{sponsor.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge
              className="text-[10px] px-2 py-0"
              style={{
                color: placement.color,
                backgroundColor: `${placement.color}15`,
                border: `1px solid ${placement.color}30`,
              }}
            >
              <PlacementIcon className="h-3 w-3 mr-1" />
              {placement.label}
            </Badge>
            <Badge
              className={`text-[10px] px-2 py-0 ${
                sponsor.isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-muted text-muted-foreground border-border"
              }`}
              variant="outline"
            >
              {sponsor.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
        {sponsor.content}
      </p>

      {/* Link */}
      {sponsor.linkUrl && (
        <a
          href={sponsor.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#006FE6] hover:underline mb-3 truncate"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          {sponsor.linkUrl}
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-border">
        <button
          onClick={onToggle}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
            sponsor.isActive
              ? "text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {sponsor.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
          {sponsor.isActive ? "Désactiver" : "Activer"}
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#006FE6] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium"
        >
          <Edit className="h-3.5 w-3.5" /> Modifier
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium ml-auto"
        >
          <Trash2 className="h-3.5 w-3.5" /> Supprimer
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSponsors() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminGetSponsors();
  const createSponsor = useAdminCreateSponsor();
  const updateSponsor = useAdminUpdateSponsor();
  const deleteSponsor = useAdminDeleteSponsor();
  const toggleSponsor = useAdminToggleSponsor();

  const sponsors: Sponsor[] = Array.isArray(data) ? data : [];

  const [showCreate, setShowCreate] = useState(false);
  const [editSponsor, setEditSponsor] = useState<Sponsor | null>(null);
  const [deleteSponsorId, setDeleteSponsorId] = useState<string | null>(null);
  const [filterPlacement, setFilterPlacement] = useState<SponsorPlacement | "all">("all");

  function refresh() {
    queryClient.invalidateQueries({ queryKey: getAdminSponsorsQueryKey() });
  }

  function handleCreate(formData: any) {
    const payload = { ...formData, linkUrl: formData.linkUrl || undefined };
    createSponsor.mutate(payload, {
      onSuccess: () => { toast.success("Sponsor créé !"); setShowCreate(false); refresh(); },
      onError: (err: any) => toast.error(err?.message || "Erreur lors de la création"),
    });
  }

  function handleUpdate(formData: any) {
    if (!editSponsor) return;
    const payload = { ...formData, linkUrl: formData.linkUrl || undefined };
    updateSponsor.mutate({ id: editSponsor.id, data: payload }, {
      onSuccess: () => { toast.success("Sponsor mis à jour !"); setEditSponsor(null); refresh(); },
      onError: (err: any) => toast.error(err?.message || "Erreur lors de la mise à jour"),
    });
  }

  function handleDelete(id: string) {
    deleteSponsor.mutate(id, {
      onSuccess: () => { toast.success("Sponsor supprimé"); setDeleteSponsorId(null); refresh(); },
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  }

  function handleToggle(id: string) {
    toggleSponsor.mutate(id, {
      onSuccess: (res) => {
        toast.success(res.isActive ? "Sponsor activé" : "Sponsor désactivé");
        refresh();
      },
      onError: () => toast.error("Erreur"),
    });
  }

  const filteredSponsors = filterPlacement === "all"
    ? sponsors
    : sponsors.filter((s) => s.placement === filterPlacement || s.placement === "both");

  const activeCount = sponsors.filter((s) => s.isActive).length;
  const navbarCount = sponsors.filter((s) => s.placement === "navbar" || s.placement === "both").length;
  const sidebarCount = sponsors.filter((s) => s.placement === "sidebar" || s.placement === "both").length;

  return (
    <AdminLayout title="Sponsors">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: sponsors.length, color: "#006FE6" },
          { label: "Actifs", value: activeCount, color: "#10b981" },
          { label: "Navbar", value: navbarCount, color: "#006FE6" },
          { label: "Sidebar", value: sidebarCount, color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-card-border rounded-2xl p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
            <div className="text-2xl font-black" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {[{ value: "all", label: "Tous" }, ...PLACEMENTS.map(p => ({ value: p.value, label: p.label }))].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterPlacement(value as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterPlacement === value
                  ? "bg-white dark:bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Button
          className="sparkle-gradient text-white border-0 shadow-md"
          onClick={() => setShowCreate(true)}
          id="btn-create-sponsor"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Nouveau sponsor
        </Button>
      </div>

      {/* Sponsors grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-semibold mb-1">Aucun sponsor</p>
          <p className="text-sm">
            {filterPlacement === "all"
              ? "Créez votre premier sponsor avec le bouton ci-dessus."
              : "Aucun sponsor pour cet emplacement."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onEdit={() => setEditSponsor(sponsor)}
              onDelete={() => setDeleteSponsorId(sponsor.id)}
              onToggle={() => handleToggle(sponsor.id)}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[#006FE6]" />
              Nouveau sponsor
            </DialogTitle>
          </DialogHeader>
          <SponsorForm onSubmit={handleCreate} isPending={createSponsor.isPending} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button
              type="submit"
              form="sponsor-form"
              className="sparkle-gradient text-white border-0"
              disabled={createSponsor.isPending}
            >
              {createSponsor.isPending ? "Création…" : "Créer le sponsor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editSponsor} onOpenChange={() => setEditSponsor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#006FE6]" />
              Modifier le sponsor
            </DialogTitle>
          </DialogHeader>
          {editSponsor && (
            <SponsorForm
              initial={editSponsor}
              onSubmit={handleUpdate}
              isPending={updateSponsor.isPending}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSponsor(null)}>Annuler</Button>
            <Button
              type="submit"
              form="sponsor-form"
              className="sparkle-gradient text-white border-0"
              disabled={updateSponsor.isPending}
            >
              {updateSponsor.isPending ? "Mise à jour…" : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteSponsorId !== null} onOpenChange={() => setDeleteSponsorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce sponsor ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le sponsor sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSponsorId && handleDelete(deleteSponsorId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
