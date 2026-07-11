import mongoose, { Schema, Types } from "mongoose";
import { z } from "zod/v4";

export interface ISponsor {
  _id: Types.ObjectId;
  name: string;
  content: string;
  linkUrl?: string;
  imageUrl?: string;
  placement: "navbar" | "sidebar" | "both";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorSchema = new Schema<ISponsor>(
  {
    name: { type: String, required: true },
    content: { type: String, required: true },
    linkUrl: { type: String },
    imageUrl: { type: String },
    placement: {
      type: String,
      enum: ["navbar", "sidebar", "both"],
      default: "navbar",
      required: true,
    },
    isActive: { type: Boolean, default: true, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const Sponsor = mongoose.models["Sponsor"]
  ? mongoose.model("Sponsor")
  : mongoose.model<any>("Sponsor", sponsorSchema);

export const insertSponsorSchema = z.object({
  name: z.string(),
  content: z.string(),
  linkUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  placement: z.enum(["navbar", "sidebar", "both"]),
  isActive: z.boolean().optional(),
});

export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
