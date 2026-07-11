"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAdminListCategories } from "@/lib/api-client"
import { useEditorStore } from "./store"

export default function SettingsPanel() {
  const categoryId = useEditorStore((s) => s.categoryId)
  const status = useEditorStore((s) => s.status)
  const setCategoryId = useEditorStore((s) => s.setCategoryId)
  const setStatus = useEditorStore((s) => s.setStatus)

  const { data: categoriesData } = useAdminListCategories()
  const categories = (categoriesData as any)?.categories || (Array.isArray(categoriesData) ? categoriesData : [])

  return (
    <div className="rounded-4xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Propriétés</h3>
        <p className="mt-2 text-sm text-slate-600">Gérez le statut et la catégorie de l’article.</p>
      </div>

      <div className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Statut</h4>
              <p className="text-xs text-muted-foreground">Brouillon ou publié</p>
            </div>
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Catégorie</h4>
              <p className="text-xs text-muted-foreground">Assignez une catégorie visible.</p>
            </div>
          </div>
          <Select value={categoryId || "none"} onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune</SelectItem>
              {categories.map((c: any) => {
                const catId = String(c._id || c.id || "")
                return catId ? <SelectItem key={catId} value={catId}>{c.name}</SelectItem> : null
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
