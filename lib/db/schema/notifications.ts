import mongoose, { Schema, Types } from "mongoose";

export interface INotification {
  _id: Types.ObjectId;
  title: string;
  message: string;
  type: "user_signup" | "article_view" | "system";
  read: boolean;
  link?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["user_signup", "article_view", "system"],
      required: true,
    },
    read: { type: Boolean, default: false, required: true },
    link: { type: String },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const Notification = mongoose.models["Notification"]
  ? mongoose.model("Notification")
  : mongoose.model<any>("Notification", notificationSchema);
