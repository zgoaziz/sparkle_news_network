"use client"
import React, { useMemo, useState } from "react"
import { Plus, Trash2, Search } from "lucide-react"
import { useEditorStore } from "./store"
import BlockRenderer from "./BlockRenderer"

const SLASH_OPTIONS = [
  { id: "paragraph", label: "Texte" },
  { id: "heading", label: "Titre" },
  { id: "image", label: "Image" },
  { id: "list", label: "Liste" },
  { id: "quote", label: "Citation" },
  { id: "pdf", label: "PDF" },
]

export default function Canvas({ preview }: { preview?: boolean }) {
  const blocks = useEditorStore((s) => s.blocks)
  const selectedId = useEditorStore((s) => s.selectedId)
  const setSelected = useEditorStore((s) => s.setSelected)
  const insertBlockAt = useEditorStore((s) => s.insertBlockAt)
  const removeBlock = useEditorStore((s) => s.removeBlock)
  const [slashBlockId, setSlashBlockId] = useState<string | null>(null)
  const [slashSearch, setSlashSearch] = useState("")

  const filteredSlashOptions = useMemo(
    () => SLASH_OPTIONS.filter((option) => option.label.toLowerCase().includes(slashSearch.toLowerCase())),
    [slashSearch],
  )

  const onSlash = (blockId: string) => {
    setSlashBlockId(blockId)
    setSlashSearch("")
  }

  const closeSlash = () => setSlashBlockId(null)

  const addBlockAfter = (blockId: string, type: string, idx: number) => {
    insertBlockAt(type, idx + 1)
    setSlashBlockId(null)
  }

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <div className="min-h-[40vh] rounded-4xl bg-white/90 p-12 text-center text-base text-slate-500 shadow-sm ring-1 ring-slate-200/70">
          Commencez par ajouter un bloc avec le menu de gauche.
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((b, idx) => {
            const isSelected = selectedId === b.id
            const showSlash = slashBlockId === b.id
            return (
              <div
                key={b.id}
                onClick={() => setSelected(b.id)}
                className={`group relative rounded-3xl bg-white px-6 py-5 shadow-sm transition duration-150 ${isSelected ? "ring-2 ring-primary/40" : "hover:ring-1 hover:ring-slate-200"}`}
              >
                <div className="pointer-events-none absolute inset-x-6 top-3 flex items-center justify-between opacity-0 transition duration-150 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      insertBlockAt("paragraph", idx + 1)
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    title="Ajouter un bloc après"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      removeBlock(b.id)
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    title="Supprimer le bloc"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-12 text-slate-900">
                  <BlockRenderer block={b} index={idx} preview={preview} onSlash={() => onSlash(b.id)} />
                </div>

                {showSlash ? (
                  <div className="absolute left-1/2 top-full z-10 mt-4 w-full max-w-sm -translate-x-1/2 rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-200">
                    <div className="mb-3 flex items-center gap-2 text-slate-700">
                      <Search className="h-4 w-4" />
                      <span className="text-sm font-medium">/ Commande</span>
                    </div>
                    <input
                      value={slashSearch}
                      onChange={(event) => setSlashSearch(event.target.value)}
                      placeholder="Rechercher un bloc..."
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="mt-3 grid gap-2">
                      {filteredSlashOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => addBlockAfter(b.id, option.id, idx)}
                          className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-100"
                        >
                          {option.label}
                        </button>
                      ))}
                      <button type="button" onClick={closeSlash} className="mt-2 rounded-2xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-100">
                        Fermer
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
