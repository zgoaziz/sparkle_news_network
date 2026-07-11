"use client"
import React, { useRef, useState } from "react"
import { toast } from "sonner"
import { useEditorStore } from "../store"

export default function PdfBlock({ block }: any) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = async (file?: File) => {
    const f = file || inputRef.current?.files?.[0]
    if (!f) return
    if (f.type !== "application/pdf") {
      toast.error("Veuillez sélectionner un fichier PDF.")
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("Le PDF ne doit pas dépasser 20 Mo.")
      return
    }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sparkle_token")}`,
          },
          body: JSON.stringify({ data: base64, filename: f.name, mimeType: f.type }),
        })

        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          console.error("upload-image failed", res.status, payload)
          throw new Error(payload?.message || "Upload failed")
        }

        const json = await res.json()
        if (json?.url) {
          updateBlock(block.id, { src: json.url, filename: f.name })
          toast.success("PDF uploadé avec succès !")
        } else {
          throw new Error("Aucune URL de retour")
        }
      } catch (e) {
        console.error(e)
        toast.error("Erreur lors de l'upload du PDF. Vérifiez le fichier et réessayez.")
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(f)
  }

  const setTitle = (value: string) => updateBlock(block.id, { title: value })
  const setDescription = (value: string) => updateBlock(block.id, { description: value })

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-slate-50 p-4">
      <div>
        <h3 className="text-base font-semibold">PDF</h3>
        <p className="text-sm text-muted-foreground">Ajoutez un fichier PDF et une description.</p>
      </div>

      <div className="grid gap-3">
        <input
          type="text"
          value={block.data?.title || ""}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du document"
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <textarea
          rows={3}
          value={block.data?.description || ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description courte du PDF"
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {block.data?.src ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{block.data.filename || "Fichier PDF"}</p>
                <p className="text-xs text-muted-foreground">Téléchargé et prêt à être consulté.</p>
              </div>
              <a
                href={block.data.src}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
              >
                Ouvrir
              </a>
            </div>
            <p className="text-sm text-slate-600">Cliquez sur le bouton ci-dessous pour remplacer le PDF.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-100 p-6 text-center">
          <p className="mb-3 text-sm text-slate-600">Aucun PDF ajouté.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={() => handleFile()} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            {uploading ? "Upload..." : "Téléverser un PDF"}
          </button>
        </div>
      )}
    </div>
  )
}
