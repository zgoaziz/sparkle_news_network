"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { FileText, Heading1, Image as ImageIcon, LayoutGrid, Video, List, Quote } from "lucide-react"
import { useEditorStore } from "./store"

const BLOCKS = [
  { id: "paragraph", label: "Texte", icon: FileText },
  { id: "heading", label: "Titre", icon: Heading1 },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "list", label: "Liste", icon: List },
  { id: "quote", label: "Citation", icon: Quote },
  { id: "pdf", label: "PDF", icon: FileText },
]

export default function BlockSidebar() {
  const addBlock = useEditorStore((s) => s.addBlock)

  return (
    <div className="flex h-full w-full flex-col items-center gap-3 rounded-4xl bg-white/95 p-3 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">+</div>
      <div className="flex flex-col gap-2">
        {BLOCKS.map((block) => {
          const Icon = block.icon
          return (
            <Button
              key={block.id}
              variant="ghost"
              className="h-11 w-11 rounded-full p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              title={block.label}
              onClick={() => addBlock(block.id, {})}
            >
              <Icon className="h-5 w-5" />
            </Button>
          )
        })}
      </div>
      <div className="mt-auto rounded-3xl bg-slate-100 px-3 py-2 text-center text-[11px] uppercase tracking-[0.24em] text-slate-500">
        Ajouter
      </div>
    </div>
  )
}
