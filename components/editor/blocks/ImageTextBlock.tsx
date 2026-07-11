"use client"
import React from "react"
import { useEditorStore } from "../store"

export default function ImageTextBlock({ block }: any) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const layout = block.data?.layout || 'left'

  const setLayout = (l: string) => updateBlock(block.id, { layout: l })

  return (
    <div className="flex gap-4 items-start">
      {(layout === 'left' || layout === 'top') && (
        <div className={`flex-shrink-0 ${layout==='top'?'w-full':''}`}>
          {block.data?.src ? <img src={block.data.src} className="w-48 rounded" /> : <div className="w-48 h-32 bg-muted rounded" />}
        </div>
      )}
      <div className="flex-1">
        <div dangerouslySetInnerHTML={{ __html: block.data?.text || '<p>Texte...</p>' }} />
      </div>
      {(layout === 'right' || layout === 'bottom') && (
        <div className={`flex-shrink-0 ${layout==='bottom'?'w-full':''}`}>
          {block.data?.src ? <img src={block.data.src} className="w-48 rounded" /> : <div className="w-48 h-32 bg-muted rounded" />}
        </div>
      )}
      <div className="mt-2">
        <label className="text-xs">Disposition</label>
        <select value={layout} onChange={(e) => setLayout(e.target.value)} className="block w-full mt-1 p-1 border rounded">
          <option value="left">Image à gauche</option>
          <option value="right">Image à droite</option>
          <option value="top">Image en haut</option>
          <option value="bottom">Image en bas</option>
        </select>
      </div>
    </div>
  )
}
