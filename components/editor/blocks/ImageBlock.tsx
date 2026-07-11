"use client"
import React, { useRef, useState } from "react"
import { toast } from "sonner"
import { useEditorStore } from "../store"

export default function ImageBlock({ block }: any) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = async (file?: File) => {
    const f = file || inputRef.current?.files?.[0]
    if (!f) return
    if (!f.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image.")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo.")
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
          updateBlock(block.id, { src: json.url })
          toast.success("Image uploadée avec succès !")
        } else {
          throw new Error("Aucune URL de retour")
        }
      } catch (e) {
        console.error(e)
        toast.error("Erreur lors de l'upload de l'image. Vérifiez le fichier et réessayez.")
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(f)
  }

  return (
    <div>
      {block.data?.src ? (
        <img src={block.data.src} alt={block.data.alt || ""} className="max-w-full rounded-3xl shadow-sm" />
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="mb-3 text-sm text-slate-600">Aucune image ajoutée</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={() => handleFile()} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            {uploading ? "Upload..." : "Téléverser une image"}
          </button>
        </div>
      )}
    </div>
  )
}
