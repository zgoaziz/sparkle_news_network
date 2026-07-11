"use client"
import React from "react"
import TextBlock from "./blocks/TextBlock"
import ImageBlock from "./blocks/ImageBlock"
import ImageTextBlock from "./blocks/ImageTextBlock"
import GalleryBlock from "./blocks/GalleryBlock"
import VideoBlock from "./blocks/VideoBlock"
import PdfBlock from "./blocks/PdfBlock"
import ListBlock from "./blocks/ListBlock"
import QuoteBlock from "./blocks/QuoteBlock"

export default function BlockRenderer({ block, index, preview, onSlash }: any) {
  switch (block.type) {
    case "text":
    case "paragraph":
      return <TextBlock block={block} preview={preview} onSlash={onSlash} />
    case "heading":
      return <TextBlock block={block} preview={preview} heading onSlash={onSlash} />
    case "image":
      return <ImageBlock block={block} />
    case "imageText":
      return <ImageTextBlock block={block} />
    case "gallery":
      return <GalleryBlock block={block} />
    case "video":
      return <VideoBlock block={block} />
    case "pdf":
      return <PdfBlock block={block} />
    case "list":
      return <ListBlock block={block} onSlash={onSlash} />
    case "quote":
      return <QuoteBlock block={block} onSlash={onSlash} />
    default:
      return <div className="rounded-3xl border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">Bloc inconnu: {block.type}</div>
  }
}
