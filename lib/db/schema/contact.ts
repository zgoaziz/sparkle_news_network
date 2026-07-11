import mongoose, { Schema, Model, Types } from "mongoose";
import { z } from "zod/v4";

export interface IContactMessage {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const ContactMessage = mongoose.models["ContactMessage"]
  ? mongoose.model("ContactMessage")
  : mongoose.model<any>("ContactMessage", contactMessageSchema);

export const insertContactMessageSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export interface INewsletterSubscriber {
  _id: Types.ObjectId;
  email: string;
  subscribedAt: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const NewsletterSubscriber = mongoose.models["NewsletterSubscriber"]
  ? mongoose.model("NewsletterSubscriber")
  : mongoose.model<any>("NewsletterSubscriber", newsletterSubscriberSchema);
