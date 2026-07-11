"use client"
import React from "react"
import { useEditorStore } from "../store"

export default function VideoBlock({ block }: any) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  const setUrl = (value: string) => {
    updateBlock(block.id, { src: value })
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-slate-50 p-4">
      <div>
        <h3 className="text-base font-semibold">Video</h3>
        <p className="text-sm text-muted-foreground">Entrez un lien YouTube ou Vimeo pour ajouter une vidéo.</p>
      </div>
      <input
        type="text"
        value={block.data?.src || ""}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
      {block.data?.src ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-black">
          <div className="aspect-video bg-slate-900 text-white grid place-items-center text-sm">Aperçu vidéo</div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-500">
          Aucun lien vidéo défini.
        </div>
      )}
    </div>
  )
}
