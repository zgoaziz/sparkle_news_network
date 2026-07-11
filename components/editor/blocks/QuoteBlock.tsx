"use client"
import React, { useEffect, useRef } from "react"
import { useEditorStore } from "../store"

export default function QuoteBlock({ block, onSlash }: any) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref.current && !block.data.content) {
      ref.current.innerHTML = "<blockquote>Votre citation ici...</blockquote>"
      updateBlock(block.id, { content: ref.current.innerHTML })
    }
  }, [block.data.content, block.id, updateBlock])

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

  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div
        contentEditable
        suppressContentEditableWarning
        ref={ref}
        onInput={onInput}
        onKeyDown={onKeyDown}
        className="min-h-8 rounded-2xl border-l-4 border-slate-300 bg-slate-100 px-4 py-3 text-slate-800"
        dangerouslySetInnerHTML={{ __html: block.data.content || "<blockquote>Votre citation ici...</blockquote>" }}
      />
    </div>
  )
}
