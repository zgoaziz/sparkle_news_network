"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateArticle,
  useAdminListCategories,
  getAdminListArticlesQueryKey,
  getAdminGetArticleQueryKey,
  useAdminGetArticle,
  useUpdateArticle,
  type CategoryAdmin,
  type CreateArticleBody,
  type UpdateArticleBody,
} from "@/lib/api-client";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Columns3,
  CopyPlus,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  Minus,
  Plus,
  Quote,
  Sparkles,
  Star,
  Table2,
  Type,
  Video,
  GalleryHorizontal,
  Upload,
  Trash2,
} from "lucide-react";

type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "image"
  | "video"
  | "quote"
  | "code"
  | "list"
  | "table"
  | "divider"
  | "gallery"
  | "columns";

type ColumnBlockData = {
  type?: string;
  content?: string;
  url?: string;
  caption?: string;
};

type BlockData = {
  content?: string;
  url?: string;
  caption?: string;
  rows?: string[][];
  items?: string[];
  left?: string | ColumnBlockData;
  right?: string | ColumnBlockData;
  [key: string]: unknown;
};

type Block = {
  id: string;
  type: BlockType;
  data: BlockData;
};

type SlashOption = {
  value: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const STORAGE_KEY = "sparkle-news:block-editor:draft";

const SLASH_OPTIONS: SlashOption[] = [
  { value: "paragraph", label: "Paragraph", description: "Text block", icon: <Type className="h-4 w-4" /> },
  { value: "heading1", label: "Heading 1", description: "Large title", icon: <Heading1 className="h-4 w-4" /> },
  { value: "heading2", label: "Heading 2", description: "Section title", icon: <Heading2 className="h-4 w-4" /> },
  { value: "heading3", label: "Heading 3", description: "Subsection title", icon: <Heading3 className="h-4 w-4" /> },
  { value: "image", label: "Image", description: "Upload an image", icon: <ImageIcon className="h-4 w-4" /> },
  { value: "video", label: "Video", description: "Embed a video", icon: <Video className="h-4 w-4" /> },
  { value: "gallery", label: "Gallery", description: "Create a gallery", icon: <GalleryHorizontal className="h-4 w-4" /> },
  { value: "table", label: "Table", description: "Insert a table", icon: <Table2 className="h-4 w-4" /> },
  { value: "quote", label: "Quote", description: "Highlight a quote", icon: <Quote className="h-4 w-4" /> },
  { value: "code", label: "Code", description: "Code snippet", icon: <Code2 className="h-4 w-4" /> },
  { value: "columns", label: "Columns", description: "Split content", icon: <Columns3 className="h-4 w-4" /> },
  { value: "divider", label: "Divider", description: "Visual separator", icon: <Minus className="h-4 w-4" /> },
  { value: "list", label: "List", description: "Bullet list", icon: <List className="h-4 w-4" /> },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type CategoryOption = CategoryAdmin & { _id?: string; id?: number | string };

type ArticlePayload = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  categoryId: number | null;
  status: "draft" | "published";
  featured: boolean;
  tags: string[];
  readTime: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

function createBlock(type: BlockType, data: BlockData = {}): Block {
  return {
    id: nanoid(),
    type,
    data: { ...getDefaultData(type), ...data },
  };
}

function getStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

function getRows(value: unknown): string[][] {
  return Array.isArray(value) && value.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === "string"))
    ? (value as string[][])
    : [["", ""]];
}

function getDefaultData(type: BlockType) {
  switch (type) {
    case "heading1":
    case "heading2":
    case "heading3":
      return { content: "" };
    case "image":
      return { url: "", caption: "" };
    case "video":
      return { url: "", caption: "" };
    case "quote":
      return { content: "" };
    case "code":
      return { content: "" };
    case "list":
      return { content: "" };
    case "table":
      return { rows: [["", ""], ["", ""]] };
    case "gallery":
      return { items: [] };
    case "columns":
        return { left: { type: "paragraph", content: "" }, right: { type: "paragraph", content: "" } };
    case "divider":
      return {};
    default:
      return { content: "" };
  }
}

function buildArticlePayload(title: string, blocks: Block[], status: "draft" | "published", featured = false): ArticlePayload {
  const normalizedTitle = title.trim() || "Untitled";
  const apiBlocks = blocks.map((block) => {
    switch (block.type) {
      case "heading1":
      case "heading2":
      case "heading3":
        return { type: "heading", level: Number(block.type.replace("heading", "")), content: getStringValue(block.data.content) };
      case "image":
        return { type: "image", url: getStringValue(block.data.url), caption: getStringValue(block.data.caption) };
      case "video":
        return { type: "video", url: getStringValue(block.data.url), caption: getStringValue(block.data.caption) };
      case "quote":
        return { type: "quote", content: getStringValue(block.data.content) };
      case "code":
        return { type: "code", content: getStringValue(block.data.content) };
      case "list":
        return { type: "list", items: getStringValue(block.data.content).split("\n").filter(Boolean) };
      case "table":
        return { type: "table", rows: getRows(block.data.rows) };
      case "divider":
        return { type: "divider" };
      case "gallery":
        return { type: "gallery", items: getStringArray(block.data.items) };
      case "columns": {
        const renderColumn = (col: BlockData | string | null | undefined) => {
          if (!col) return "";
          if (typeof col === "string") return col;
          const column = col as Record<string, unknown>;
          if (column.type === "image") {
            const url = typeof column.url === "string" ? column.url : "";
            const caption = typeof column.caption === "string" ? column.caption : "";
            return `<img src="${url}" alt="${caption.replace(/\"/g, "&quot;")}" />`;
          }
          const content = typeof column.content === "string" ? column.content : "";
          return `<p>${content.replace(/</g, "&lt;")}</p>`;
        };
        return { type: "columns", columns: [renderColumn(block.data.left), renderColumn(block.data.right)] };
      }
      default:
        return { type: "paragraph", content: getStringValue(block.data.content) };
    }
  });

  const coverImage = blocks.find((block) => block.type === "image" && getStringValue((block.data as BlockData).url))?.data.url || null;

  return {
    title: normalizedTitle,
    slug: slugify(normalizedTitle),
    excerpt: blocks.find((block) => getStringValue(block.data.content).trim())?.data.content?.toString().trim().slice(0, 160) || "",
    content: JSON.stringify({ title: normalizedTitle, blocks: apiBlocks }),
    coverImage,
    categoryId: null,
    status,
    featured,
    tags: [],
    readTime: 5,
  };
}

export default function Editor({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const articleIdNumber = articleId ? Number(articleId) : 0;
  const { data: existingArticle, isLoading: articleLoading } = useAdminGetArticle(articleIdNumber, {
    query: {
      enabled: !!articleId && Number.isFinite(articleIdNumber) && articleIdNumber > 0,
      queryKey: getAdminGetArticleQueryKey(articleIdNumber),
    },
  });

  const [title, setTitle] = useState("Untitled");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [slashMenuForId, setSlashMenuForId] = useState<string | null>(null);
  const [slashQuery, setSlashQuery] = useState("");
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const { data: categoriesData } = useAdminListCategories();
  const categories: CategoryOption[] = Array.isArray(categoriesData)
    ? categoriesData
    : ((categoriesData as { categories?: CategoryOption[] } | undefined)?.categories ?? []);
  const textareasRef = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    window.setTimeout(() => {
      try {
        const parsed = JSON.parse(saved) as {
          title?: string | { title?: string };
          blocks?: Block[];
          categoryIds?: string[];
          featured?: boolean;
        };
        let loadedTitle = parsed?.title;

        if (typeof loadedTitle === "object" && loadedTitle !== null && loadedTitle.title) {
          loadedTitle = loadedTitle.title;
        }

        if (loadedTitle && typeof loadedTitle === "string") {
          setTitle(loadedTitle);
        }
        if (Array.isArray(parsed.blocks)) {
          setBlocks(parsed.blocks);
        }
        if (Array.isArray(parsed.categoryIds)) {
          setCategoryIds(parsed.categoryIds);
        }
        if (typeof parsed.featured === "boolean") {
          setFeatured(parsed.featured);
        }
      } catch {
        // ignore invalid draft
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, blocks, categoryIds, featured }));
      } catch {
        // ignore save failures
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [title, blocks, categoryIds, featured]);

  // Load existing article if articleId is provided
  useEffect(() => {
    if (!existingArticle || articleLoading) return;

    window.setTimeout(() => {
      const article = existingArticle as {
        title?: string;
        content?: string | { blocks?: Array<{ type?: string; [key: string]: unknown }> };
        categoryId?: string;
        featured?: boolean;
      };
      setTitle(article.title || "Untitled");

      let parsedContent: { blocks?: Array<{ type?: string; [key: string]: unknown }> } = {};
      if (article.content) {
        if (typeof article.content === "string") {
          try {
            parsedContent = JSON.parse(article.content) as { blocks?: Array<{ type?: string; [key: string]: unknown }> };
          } catch {
            parsedContent = {
              blocks: [
                {
                  type: "paragraph",
                  text: article.content,
                },
              ],
            };
          }
        } else {
          parsedContent = article.content as { blocks?: Array<{ type?: string; [key: string]: unknown }> };
        }
      }

      if (parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
        const editorBlocks = parsedContent.blocks.map((block) => ({
          id: nanoid(),
          type: (block.type as BlockType) || "paragraph",
          data: block as BlockData,
        }));
        setBlocks(editorBlocks);
      }

      if (article.categoryId) {
        setCategoryIds([String(article.categoryId)]);
      }

      if (typeof article.featured === "boolean") {
        setFeatured(article.featured);
      }
    }, 0);
  }, [existingArticle, articleLoading]);

  const filteredSlashOptions = useMemo(() => {
    const query = slashQuery.trim().toLowerCase();
    if (!query) return SLASH_OPTIONS;
    return SLASH_OPTIONS.filter((option) => `${option.label} ${option.description}`.toLowerCase().includes(query));
  }, [slashQuery]);

  const insertBlock = (blockId: string | null, type: BlockType, data?: BlockData) => {
    const nextBlock = createBlock(type, data);
    setBlocks((current) => {
      if (!blockId) return [...current, nextBlock];
      const index = current.findIndex((block) => block.id === blockId);
      if (index === -1) return [...current, nextBlock];
      const next = [...current];
      next.splice(index + 1, 0, nextBlock);
      return next;
    });
    setActiveBlockId(nextBlock.id);
    setSlashMenuForId(null);
    setSlashQuery("");
  };

  const replaceBlock = (blockId: string, type: BlockType, data?: BlockData) => {
    setBlocks((current) => current.map((block) => (block.id === blockId ? createBlock(type, data) : block)));
    setActiveBlockId(blockId);
    setSlashMenuForId(null);
    setSlashQuery("");
  };

  const updateBlock = (blockId: string, patch: BlockData) => {
    setBlocks((current) => current.map((block) => (block.id === blockId ? { ...block, data: { ...block.data, ...patch } } : block)));
  };

  const removeBlock = (blockId: string) => {
    setBlocks((current) => current.filter((block) => block.id !== blockId));
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const moveBlock = (fromId: string, toId: string) => {
    setBlocks((current) => {
      const fromIndex = current.findIndex((block) => block.id === fromId);
      const toIndex = current.findIndex((block) => block.id === toId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const openSlashMenu = (blockId: string) => {
    setActiveBlockId(blockId);
    setSlashMenuForId(blockId);
    setSlashQuery("");
  };

  const handleBlockKeyDown = (event: React.KeyboardEvent, blockId: string) => {
    if (event.key === "/" || event.key === "Slash") {
      event.preventDefault();
      openSlashMenu(blockId);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      const block = blocks.find((item) => item.id === blockId);
      if (block?.type === "paragraph" && !(block.data.content || "").trim()) {
        event.preventDefault();
        insertBlock(blockId, "paragraph");
      }
    }
  };

  const handleBlockInput = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, blockId: string) => {
    const target = event.currentTarget;
    const nextValue = target.value;
    const lastChar = nextValue.slice(-1);

    if (lastChar === "/" && nextValue.length > 0) {
      const sanitizedValue = nextValue.slice(0, -1);
      updateBlock(blockId, { content: sanitizedValue });
      openSlashMenu(blockId);
      requestAnimationFrame(() => {
        target.setSelectionRange(sanitizedValue.length, sanitizedValue.length);
      });
      return;
    }

    updateBlock(blockId, { content: nextValue });
  };

  const handleUpload = async (blockId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image should stay under 10 MB");
      return;
    }

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("sparkle_token") || ""}`,
        },
        body: JSON.stringify({ data: base64, filename: file.name, mimeType: file.type }),
      });

      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      updateBlock(blockId, { url, caption: file.name });
      toast.success("Image uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Could not upload image");
    }
  };

  const handleUploadColumn = async (blockId: string, side: "left" | "right", file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image should stay under 10 MB");
      return;
    }

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("sparkle_token") || ""}`,
        },
        body: JSON.stringify({ data: base64, filename: file.name, mimeType: file.type }),
      });

      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      // set column to image
      updateBlock(blockId, { [side]: { type: "image", url, caption: file.name } });
      toast.success("Image uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Could not upload image");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setCategoryIds((current) =>
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId],
    );
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const payload = buildArticlePayload(title, blocks, "published", featured);
      payload.categoryId = categoryIds[0] ? Number(categoryIds[0]) : null;
      
      if (articleIdNumber) {
        const updateData: UpdateArticleBody = {
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt || null,
          content: payload.content,
          coverImage: payload.coverImage,
          categoryId: payload.categoryId != null ? Number(payload.categoryId) : null,
          status: payload.status,
          featured: payload.featured,
          tags: payload.tags,
          seoTitle: payload.seoTitle ?? null,
          seoDescription: payload.seoDescription ?? null,
        };
        await updateArticle.mutateAsync({ id: articleIdNumber, data: updateData });
      } else {
        const createData: CreateArticleBody = {
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt || null,
          content: payload.content,
          coverImage: payload.coverImage,
          categoryId: payload.categoryId != null ? Number(payload.categoryId) : null,
          status: payload.status,
          featured: payload.featured,
          tags: payload.tags,
          seoTitle: payload.seoTitle ?? null,
          seoDescription: payload.seoDescription ?? null,
        };
        await createArticle.mutateAsync({ data: createData });
      }
      
      window.localStorage.removeItem(STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
      toast.success(articleId ? "Article updated" : "Article published");
      router.push("/admin/articles");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(message || (articleId ? "Could not update article" : "Could not publish article"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const payload = buildArticlePayload(title, blocks, "draft", featured);
      payload.categoryId = categoryIds[0] ? Number(categoryIds[0]) : null;
      
      if (articleIdNumber) {
        const updateData: UpdateArticleBody = {
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt || null,
          content: payload.content,
          coverImage: payload.coverImage,
          categoryId: payload.categoryId != null ? Number(payload.categoryId) : null,
          status: payload.status,
          featured: payload.featured,
          tags: payload.tags,
          seoTitle: payload.seoTitle ?? null,
          seoDescription: payload.seoDescription ?? null,
        };
        await updateArticle.mutateAsync({ id: articleIdNumber, data: updateData });
      } else {
        const createData: CreateArticleBody = {
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt || null,
          content: payload.content,
          coverImage: payload.coverImage,
          categoryId: payload.categoryId != null ? Number(payload.categoryId) : null,
          status: payload.status,
          featured: payload.featured,
          tags: payload.tags,
          seoTitle: payload.seoTitle ?? null,
          seoDescription: payload.seoDescription ?? null,
        };
        await createArticle.mutateAsync({ data: createData });
      }
      
      window.localStorage.removeItem(STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
      toast.success("Draft saved");
      router.push("/admin/articles");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(message || "Could not save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const startWithParagraph = () => {
    const next = createBlock("paragraph", { content: "" });
    setBlocks([next]);
    setActiveBlockId(next.id);
    setTimeout(() => textareasRef.current[next.id]?.focus(), 0);
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case "heading1":
      case "heading2":
      case "heading3": {
        const level = block.type === "heading1" ? 1 : block.type === "heading2" ? 2 : 3;
        const headingClass = level === 1 ? "text-3xl font-semibold" : level === 2 ? "text-2xl font-semibold" : "text-xl font-semibold";
        return (
          <div className="w-full">
            <input
              ref={(node) => {
                inputsRef.current[block.id] = node;
              }}
              value={block.data.content || ""}
              onChange={(event) => updateBlock(block.id, { content: event.target.value })}
              onFocus={() => setActiveBlockId(block.id)}
              onKeyDown={(event) => handleBlockKeyDown(event, block.id)}
              onInput={(event) => handleBlockInput(event, block.id)}
              placeholder={`Heading ${level}`}
              className={`w-full border-none bg-transparent px-0 py-2 outline-none placeholder:text-slate-400 ${headingClass}`}
            />
          </div>
        );
      }
      case "image":
        return (
          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {block.data.url ? (
              <div className="space-y-3">
                <img src={block.data.url} alt={block.data.caption || "Uploaded asset"} className="max-h-[360px] w-full rounded-xl object-cover" />
                <input
                  value={block.data.caption || ""}
                  onChange={(event) => updateBlock(block.id, { caption: event.target.value })}
                  placeholder="Caption"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-700">
                <Upload className="mb-2 h-5 w-5" />
                <span>Upload an image</span>
                <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && handleUpload(block.id, event.target.files[0])} />
              </label>
            )}
          </div>
        );
      case "video":
        return (
          <div className="w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              value={block.data.url || ""}
              onChange={(event) => updateBlock(block.id, { url: event.target.value })}
              onFocus={() => setActiveBlockId(block.id)}
              onKeyDown={(event) => handleBlockKeyDown(event, block.id)}
              onInput={(event) => handleBlockInput(event, block.id)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
            {block.data.url ? <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">Embed preview will appear here.</div> : null}
          </div>
        );
      case "quote":
        return (
          <textarea
            value={block.data.content || ""}
            onChange={(event) => updateBlock(block.id, { content: event.target.value })}
            onFocus={() => setActiveBlockId(block.id)}
            onKeyDown={(event) => handleBlockKeyDown(event, block.id)}
            onInput={(event) => handleBlockInput(event, block.id)}
            placeholder="Quote"
            className="min-h-[90px] w-full resize-none border-none bg-transparent px-0 py-2 text-lg italic text-slate-700 outline-none placeholder:text-slate-400"
          />
        );
      case "code":
        return (
          <textarea
            value={block.data.content || ""}
            onChange={(event) => updateBlock(block.id, { content: event.target.value })}
            onFocus={() => setActiveBlockId(block.id)}
            onKeyDown={(event) => handleBlockKeyDown(event, block.id)}
            onInput={(event) => handleBlockInput(event, block.id)}
            placeholder="Write code"
            className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
        );
      case "list":
        return (
          <textarea
            value={block.data.content || ""}
            onChange={(event) => updateBlock(block.id, { content: event.target.value })}
            onFocus={() => setActiveBlockId(block.id)}
            onKeyDown={(event) => handleBlockKeyDown(event, block.id)}
            onInput={(event) => handleBlockInput(event, block.id)}
            placeholder="- Item one\n- Item two"
            className="min-h-[90px] w-full resize-none border-none bg-transparent px-0 py-2 text-base text-slate-700 outline-none placeholder:text-slate-400"
          />
        );
      case "table":
        return (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <tbody className="divide-y divide-slate-200 bg-white">
                {(block.data.rows || [["", ""], ["", ""]]).map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className="divide-x divide-slate-200">
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={`${rowIndex}-${cellIndex}`} className="p-2">
                        <input
                          value={cell}
                          onChange={(event) => {
                            const nextRows = [...(block.data.rows || [["", ""], ["", ""]])];
                            nextRows[rowIndex][cellIndex] = event.target.value;
                            updateBlock(block.id, { rows: nextRows });
                          }}
                          placeholder="Cell"
                          className="w-full bg-transparent text-sm outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "divider":
        return <div className="my-5 h-px w-full bg-slate-200" />;
      case "gallery":
        return (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap gap-3">
              {(block.data.items || []).map((item: string, index: number) => (
                <img key={`${item}-${index}`} src={item} alt="Gallery item" className="h-24 w-24 rounded-xl object-cover" />
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <Upload className="h-4 w-4" />
              Add images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (event) => {
                  const files = Array.from(event.target.files || []);
                  const urls: string[] = [];
                  for (const file of files) {
                    const reader = new FileReader();
                    const base64 = await new Promise<string>((resolve, reject) => {
                      reader.onload = () => resolve(reader.result as string);
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                    const response = await fetch("/api/admin/upload-image", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${window.localStorage.getItem("sparkle_token") || ""}`,
                      },
                      body: JSON.stringify({ data: base64, filename: file.name, mimeType: file.type }),
                    });
                    if (response.ok) {
                      const { url } = await response.json();
                      urls.push(url);
                    }
                  }
                  updateBlock(block.id, { items: [...(block.data.items || []), ...urls] });
                }}
              />
            </label>
          </div>
        );
      case "columns": {
        const rawLeft = block.data.left;
        const rawRight = block.data.right;
        const left: ColumnBlockData = typeof rawLeft === "string" ? { type: "paragraph", content: rawLeft } : (rawLeft as ColumnBlockData | undefined) ?? { type: "paragraph", content: "" };
        const right: ColumnBlockData = typeof rawRight === "string" ? { type: "paragraph", content: rawRight } : (rawRight as ColumnBlockData | undefined) ?? { type: "paragraph", content: "" };
        return (
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateBlock(block.id, { left: { type: "paragraph", content: left.content || "" } })}
                  className={`rounded px-2 py-1 text-sm ${left.type === "paragraph" ? "bg-white border" : "bg-slate-50"}`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(block.id, { left: { type: "image", url: "", caption: "" } })}
                  className={`rounded px-2 py-1 text-sm ${left.type === "image" ? "bg-white border" : "bg-slate-50"}`}
                >
                  Image
                </button>
              </div>
              {left.type === "image" ? (
                <div className="space-y-2">
                  {left.url ? (
                    <div className="space-y-2">
                      <img src={left.url} alt={left.caption || ""} className="max-h-[240px] w-full rounded-xl object-cover" />
                      <input value={left.caption || ""} onChange={(e) => updateBlock(block.id, { left: { ...left, caption: e.target.value } })} placeholder="Caption" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                      <div className="flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                          <Upload className="h-4 w-4" />
                          Replace image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadColumn(block.id, "left", e.target.files[0])} />
                        </label>
                        <button type="button" className="text-sm text-red-500" onClick={() => updateBlock(block.id, { left: { type: "paragraph", content: "" } })}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-700">
                      <Upload className="mb-2 h-5 w-5" />
                      <span>Upload an image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && handleUploadColumn(block.id, "left", event.target.files[0])} />
                    </label>
                  )}
                </div>
              ) : (
                <textarea
                  value={left.content || ""}
                  onChange={(event) => updateBlock(block.id, { left: { ...left, content: event.target.value } })}
                  onFocus={() => setActiveBlockId(block.id)}
                  placeholder="Left column"
                  className="min-h-[90px] resize-none border-none bg-transparent p-0 text-sm outline-none"
                />
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateBlock(block.id, { right: { type: "paragraph", content: right.content || "" } })}
                  className={`rounded px-2 py-1 text-sm ${right.type === "paragraph" ? "bg-white border" : "bg-slate-50"}`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(block.id, { right: { type: "image", url: "", caption: "" } })}
                  className={`rounded px-2 py-1 text-sm ${right.type === "image" ? "bg-white border" : "bg-slate-50"}`}
                >
                  Image
                </button>
              </div>
              {right.type === "image" ? (
                <div className="space-y-2">
                  {right.url ? (
                    <div className="space-y-2">
                      <img src={right.url} alt={right.caption || ""} className="max-h-[240px] w-full rounded-xl object-cover" />
                      <input value={right.caption || ""} onChange={(e) => updateBlock(block.id, { right: { ...right, caption: e.target.value } })} placeholder="Caption" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                      <div className="flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                          <Upload className="h-4 w-4" />
                          Replace image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadColumn(block.id, "right", e.target.files[0])} />
                        </label>
                        <button type="button" className="text-sm text-red-500" onClick={() => updateBlock(block.id, { right: { type: "paragraph", content: "" } })}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-700">
                      <Upload className="mb-2 h-5 w-5" />
                      <span>Upload an image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && handleUploadColumn(block.id, "right", event.target.files[0])} />
                    </label>
                  )}
                </div>
              ) : (
                <textarea
                  value={right.content || ""}
                  onChange={(event) => updateBlock(block.id, { right: { ...right, content: event.target.value } })}
                  onFocus={() => setActiveBlockId(block.id)}
                  onKeyDown={(event) => handleBlockKeyDown(event, block.id)}
                  onInput={(event) => handleBlockInput(event, block.id)}
                  placeholder="Right column"
                  className="min-h-[90px] resize-none border-none bg-transparent p-0 text-sm outline-none"
                />
              )}
            </div>
          </div>
        );
      }
      default:
        return (
          <textarea
            ref={(node) => {
              textareasRef.current[block.id] = node;
            }}
            value={block.data.content || ""}
            onChange={(event) => updateBlock(block.id, { content: event.target.value })}
            onFocus={() => setActiveBlockId(block.id)}
            onKeyDown={(event) => handleBlockKeyDown(event, block.id)}
            onInput={(event) => handleBlockInput(event, block.id)}
            placeholder="Start writing..."
            className="min-h-[70px] w-full resize-none border-none bg-transparent px-0 py-2 text-base text-slate-700 outline-none placeholder:text-slate-400"
          />
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[radial-gradient(circle_at_top,rgba(0,111,230,0.06),transparent_45%)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:grid-cols-[minmax(0,1.4fr)_minmax(0,auto)] sm:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
              <Sparkles className="h-4 w-4" />
              Block editor
            </div>
            <div className="text-xl font-semibold text-slate-900">{title || "Untitled"}</div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold">Catégorie :</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((c: CategoryOption) => {
                  const catId = String(c._id || c.id || "");
                  if (!catId) return null;
                  const selected = categoryIds.includes(catId);
                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => toggleCategory(catId)}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setFeatured(!featured)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                featured
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-orange-100 hover:border-yellow-300 shadow-sm"
                  : "bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Star className={`h-4 w-4 ${featured ? "fill-yellow-500 text-yellow-500" : "text-slate-400"}`} />
              <span>{featured ? "Article à la une" : "À la une"}</span>
              {featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
            </button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSavingDraft}>
              {isSavingDraft ? "Saving..." : "Save draft"}
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        <div className="rounded-4xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-8">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled"
            className="w-full border-none bg-transparent text-4xl font-semibold tracking-tight text-slate-900 outline-none placeholder:text-slate-400"
          />

          <div className="mt-7 space-y-3">
            {blocks.length === 0 ? (
              <button
                type="button"
                onClick={startWithParagraph}
                className="flex min-h-[220px] w-full items-start rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-6 text-left text-lg text-slate-500 transition hover:border-slate-400 hover:bg-slate-100"
              >
                Start writing...
              </button>
            ) : (
              blocks.map((block) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => setDraggedBlockId(block.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedBlockId && draggedBlockId !== block.id) {
                      moveBlock(draggedBlockId, block.id);
                    }
                    setDraggedBlockId(null);
                  }}
                  className={`group relative rounded-3xl border px-3 py-3 transition ${
                    activeBlockId === block.id ? "border-slate-300 bg-white shadow-sm" : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="absolute -left-9 top-3 opacity-0 transition group-hover:opacity-100">
                    <button type="button" className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      {renderBlock(block)}
                    </div>
                    <div className="flex flex-col gap-2 pt-1 opacity-0 transition group-hover:opacity-100">
                      <button type="button" onClick={() => openSlashMenu(block.id)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm sm:hidden">
                        <Plus className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => insertBlock(block.id, "paragraph")} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">
                        <CopyPlus className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => removeBlock(block.id)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {slashMenuForId === block.id ? (
                    <div className="mt-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-xl">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Plus className="h-4 w-4" />
                        Add a block
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {filteredSlashOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              if (block.type === "paragraph" && option.value === "paragraph") {
                                replaceBlock(block.id, "paragraph", { content: block.data.content || "" });
                              } else {
                                insertBlock(block.id, option.value);
                              }
                            }}
                            className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-slate-300 hover:bg-white"
                          >
                            <div className="mt-0.5 text-slate-600">{option.icon}</div>
                            <div>
                              <div className="text-sm font-medium text-slate-800">{option.label}</div>
                              <div className="text-xs text-slate-500">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <button
              type="button"
              onClick={() => insertBlock(blocks[blocks.length - 1]?.id || null, "paragraph")}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              + Add block
            </button>
            <span>Type / to open the command menu.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
