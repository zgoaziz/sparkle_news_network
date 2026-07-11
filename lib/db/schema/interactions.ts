import mongoose, { Schema, Model, Types } from "mongoose";

export interface IFavorite {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

favoriteSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const Favorite = mongoose.models["Favorite"]
  ? mongoose.model("Favorite")
  : mongoose.model<any>("Favorite", favoriteSchema);

export interface ILike {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

likeSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const Like = mongoose.models["Like"]
  ? mongoose.model("Like")
  : mongoose.model<any>("Like", likeSchema);

export interface IReadingHistory {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  readAt: Date;
}

const readingHistorySchema = new Schema<IReadingHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    readAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

readingHistorySchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const ReadingHistory = mongoose.models["ReadingHistory"]
  ? mongoose.model("ReadingHistory")
  : mongoose.model<any>("ReadingHistory", readingHistorySchema);
