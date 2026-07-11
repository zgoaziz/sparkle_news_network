"use client"
import React, { useRef, useEffect } from "react"
import { useEditorStore } from "../store"

export default function TextBlock({ block, preview, heading, onSlash }: any) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref.current && !block.data.content) {
      ref.current.innerHTML = heading ? "<h2>Titre</h2>" : "<p>Écrivez votre texte...</p>"
      updateBlock(block.id, { content: ref.current.innerHTML })
    }
  }, [block.data.content, block.id, heading, updateBlock])

  const onInput = () => {
    if (!ref.current) return
    updateBlock(block.id, { content: ref.current.innerHTML })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "/") {
      event.preventDefault()
      onSlash?.()
    }
  }

  if (preview) return <div dangerouslySetInnerHTML={{ __html: block.data.content || "" }} />

  if (heading) return (
    <div
      contentEditable
      suppressContentEditableWarning
      ref={ref}
      onInput={onInput}
      onKeyDown={onKeyDown}
      className="text-3xl font-semibold leading-tight text-slate-950 outline-none"
      dangerouslySetInnerHTML={{ __html: block.data.content || "<h2>Titre</h2>" }}
    />
  )

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      ref={ref}
      onInput={onInput}
      onKeyDown={onKeyDown}
      className="prose prose-slate max-w-none text-slate-900 outline-none"
      dangerouslySetInnerHTML={{ __html: block.data.content || "<p>Texte...</p>" }}
    />
  )
}
