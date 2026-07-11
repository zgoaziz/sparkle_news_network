import mongoose, { Schema, Model, Types } from "mongoose";
import { z } from "zod/v4";

export interface IArticle {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  categoryId?: Types.ObjectId;
  authorId: Types.ObjectId;
  status: "draft" | "published" | "archived";
  featured: boolean;
  tags: string[];
  views: number;
  likes: number;
  readTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    coverImage: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      required: true,
    },
    featured: { type: Boolean, default: false, required: true },
    tags: { type: [String], default: [], required: true },
    views: { type: Number, default: 0, required: true },
    likes: { type: Number, default: 0, required: true },
    readTime: { type: Number },
    seoTitle: { type: String },
    seoDescription: { type: String },
    publishedAt: { type: Date },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ categoryId: 1, status: 1, publishedAt: -1 });
articleSchema.index({ tags: 1, status: 1, publishedAt: -1 });
articleSchema.index({ slug: 1, status: 1 });

export const Article = mongoose.models["Article"]
  ? mongoose.model("Article")
  : mongoose.model<any>("Article", articleSchema);

export const insertArticleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  readTime: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  publishedAt: z.date().optional(),
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
