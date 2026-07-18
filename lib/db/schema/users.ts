import mongoose, { Schema, Model } from "mongoose";
import { z } from "zod/v4";

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "editor" | "user";
  status: "active" | "disabled";
  emailVerified: boolean;
  confirmationToken?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  avatar?: string;
  googleId?: string;
  preferredCategories?: string[];
  resetToken?: string;
  resetTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["admin", "editor", "user"],
      default: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      required: true,
    },
    emailVerified: { type: Boolean, default: false, required: true },
    confirmationToken: { type: String },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    avatar: { type: String },
    googleId: { type: String },
    preferredCategories: { type: [String], default: [] },
    resetToken: { type: String },
    resetTokenExpiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const User = mongoose.models["User"]
  ? mongoose.model("User")
  : mongoose.model<any>("User", userSchema);

export const insertUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["admin", "editor", "user"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  emailVerified: z.boolean().optional(),
  confirmationToken: z.string().optional(),
  otpCode: z.string().optional(),
  otpExpiresAt: z.date().optional(),
  avatar: z.string().optional(),
  preferredCategories: z.array(z.string()).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
