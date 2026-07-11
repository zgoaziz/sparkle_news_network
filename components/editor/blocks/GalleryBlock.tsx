"use client"
import React from "react"
import { useEditorStore } from "../store"

export default function GalleryBlock({ block }: any) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const items = Array.isArray(block.data?.items) ? block.data.items : []

  const addImage = () => {
    updateBlock(block.id, { items: [...items, { src: "", alt: "Nouvelle image" }] })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Gallery</h3>
            <p className="text-sm text-muted-foreground">Ajoutez des vignettes et organisez votre grille.</p>
          </div>
          <button
            type="button"
            onClick={addImage}
            className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            + Ajouter une image
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-8 text-center text-sm text-slate-500">
          Aucune image pour le moment. Cliquez sur Ajouter une image.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="rounded-3xl border border-border bg-white p-3 text-sm text-slate-800">
              <div className="h-24 w-full rounded-lg bg-slate-100" />
              <div className="mt-3 font-medium">Image #{index + 1}</div>
              <div className="text-xs text-muted-foreground">{item.alt || "Aucun texte"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
