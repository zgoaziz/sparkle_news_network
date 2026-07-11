"use client"
import React, { useEffect, useRef } from "react"
import { useEditorStore } from "../store"

export default function ListBlock({ block, onSlash }: any) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref.current && !block.data.content) {
      ref.current.innerHTML = "<ul><li>Nouvel élément de liste...</li></ul>"
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
    <div className="prose prose-slate max-w-none">
      <div
        contentEditable
        suppressContentEditableWarning
        ref={ref}
        onInput={onInput}
        onKeyDown={onKeyDown}
        className="min-h-8 rounded-2xl px-1 py-2 focus:outline-none"
        dangerouslySetInnerHTML={{ __html: block.data.content || "<ul><li>Nouvel élément de liste...</li></ul>" }}
      />
    </div>
  )
}
