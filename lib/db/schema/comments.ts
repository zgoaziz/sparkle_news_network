import mongoose, { Schema, Model, Types } from "mongoose";
import { z } from "zod/v4";

export interface IComment {
  _id: Types.ObjectId;
  content: string;
  status: "pending" | "approved" | "rejected";
  articleId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const Comment = mongoose.models["Comment"]
  ? mongoose.model("Comment")
  : mongoose.model<any>("Comment", commentSchema);

export const insertCommentSchema = z.object({
  content: z.string(),
  articleId: z.string(),
  userId: z.string(),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
