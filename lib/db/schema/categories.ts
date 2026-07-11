import mongoose, { Schema, Model } from "mongoose";
import { z } from "zod/v4";

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    color: { type: String },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const Category = mongoose.models["Category"]
  ? mongoose.model("Category")
  : mongoose.model<any>("Category", categorySchema);

export const insertCategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
