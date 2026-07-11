import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type Block = {
  id: string
  type: string
  data: any
}

type EditorState = {
  blocks: Block[]
  selectedId?: string | null
  title: string
  categoryId: string
  status: "draft" | "published"
  addBlock: (type: string, data?: any) => void
  insertBlockAt: (type: string, index: number, data?: any) => void
  updateBlock: (id: string, patch: any) => void
  moveBlock: (from: number, to: number) => void
  removeBlock: (id: string) => void
  setSelected: (id?: string | null) => void
  setBlocks: (b: Block[]) => void
  setTitle: (title: string) => void
  setCategoryId: (categoryId: string) => void
  setStatus: (status: "draft" | "published") => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  blocks: [],
  selectedId: null,
  title: "Titre de l'article",
  categoryId: "",
  status: "draft",
  addBlock: (type, data = {}) => {
    const defaults: Record<string, any> = {
      paragraph: { content: "<p>Texte...</p>" },
      heading: { content: "<h2>Titre</h2>" },
      image: {},
      imageText: { layout: "left", text: "<p>Texte...</p>" },
      gallery: { items: [] },
      video: { src: "", title: "Vidéo embarquée" },
      pdf: { title: "Document PDF", description: "Résumé du PDF.", src: "", filename: "" },
    }
    const block: Block = { id: nanoid(), type, data: { ...defaults[type], ...data } }
    set((s) => ({ blocks: [...s.blocks, block], selectedId: block.id }))
  },
  insertBlockAt: (type, index, data = {}) => {
    const defaults: Record<string, any> = {
      paragraph: { content: "<p>Texte...</p>" },
      heading: { content: "<h2>Titre</h2>" },
      image: {},
      imageText: { layout: "left", text: "<p>Texte...</p>" },
      gallery: { items: [] },
      video: { src: "", title: "Vidéo embarquée" },
      pdf: { title: "Document PDF", description: "Résumé du PDF.", src: "", filename: "" },
    }
    const block: Block = { id: nanoid(), type, data: { ...defaults[type], ...data } }
    set((s) => {
      const next = [...s.blocks]
      next.splice(index, 0, block)
      return { blocks: next, selectedId: block.id }
    })
  },
  updateBlock: (id, patch) => set((s) => ({ blocks: s.blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...patch } } : b) })),
  moveBlock: (from, to) => set((s) => {
    const next = [...s.blocks]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return { blocks: next }
  }),
  removeBlock: (id) => set((s) => ({ blocks: s.blocks.filter(b => b.id !== id), selectedId: s.selectedId === id ? null : s.selectedId })),
  setSelected: (id) => set(() => ({ selectedId: id })),
  setBlocks: (b) => set(() => ({ blocks: b })),
  setTitle: (title) => set(() => ({ title })),
  setCategoryId: (categoryId) => set(() => ({ categoryId })),
  setStatus: (status) => set(() => ({ status })),
}))
