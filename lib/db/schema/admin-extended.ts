import mongoose, { Schema, Model, Types } from "mongoose";
import { z } from "zod/v4";

// 1. AI Providers config
export interface IAIProvider {
  _id: Types.ObjectId;
  name: string;
  providerType: string;
  apiKeyEncrypted: string;
  baseUrl?: string;
  defaultModel: string;
  priority: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const aiProviderSchema = new Schema<IAIProvider>(
  {
    name: { type: String, required: true },
    providerType: { type: String, required: true },
    apiKeyEncrypted: { type: String, required: true },
    baseUrl: { type: String },
    defaultModel: { type: String, required: true },
    priority: { type: Number, default: 1, required: true },
    isEnabled: { type: Boolean, default: true, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const AIProvider = mongoose.models["AIProvider"]
  ? mongoose.model("AIProvider")
  : mongoose.model<any>("AIProvider", aiProviderSchema);

// 2. AI Execution and fallback logs
export interface IAIRoutingLog {
  _id: Types.ObjectId;
  requestType: string;
  providerId?: Types.ObjectId;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  status: string;
  errorMessage?: string;
  latencyMs: number;
  createdAt: Date;
}

const aiRoutingLogSchema = new Schema<IAIRoutingLog>(
  {
    requestType: { type: String, required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "AIProvider" },
    modelUsed: { type: String, required: true },
    promptTokens: { type: Number, default: 0, required: true },
    completionTokens: { type: Number, default: 0, required: true },
    status: { type: String, required: true },
    errorMessage: { type: String },
    latencyMs: { type: Number, default: 0, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const AIRoutingLog = mongoose.models["AIRoutingLog"]
  ? mongoose.model("AIRoutingLog")
  : mongoose.model<any>("AIRoutingLog", aiRoutingLogSchema);

// 3. Social Media Accounts (Meta, LinkedIn, etc.)
export interface ISocialAccount {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  platform: string;
  accountId?: string;
  accountName: string;
  accessTokenEncrypted: string;
  refreshTokenEncrypted?: string;
  tokenExpiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

const socialAccountSchema = new Schema<ISocialAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    platform: { type: String, required: true },
    accountId: { type: String },
    accountName: { type: String, required: true },
    accessTokenEncrypted: { type: String, required: true },
    refreshTokenEncrypted: { type: String },
    tokenExpiresAt: { type: Date },
    isActive: { type: Boolean, default: true, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const SocialAccount = mongoose.models["SocialAccount"]
  ? mongoose.model("SocialAccount")
  : mongoose.model<any>("SocialAccount", socialAccountSchema);

// 4. Social Posting Queue
export interface ISocialPostQueue {
  _id: Types.ObjectId;
  articleId?: Types.ObjectId;
  socialAccountId: Types.ObjectId;
  postContent: string;
  mediaUrls: any[];
  scheduledFor: Date;
  status: string;
  providerPostId?: string;
  errorLog?: any;
  retryCount: number;
  postedAt?: Date;
  createdAt: Date;
}

const socialPostQueueSchema = new Schema<ISocialPostQueue>(
  {
    articleId: { type: Schema.Types.ObjectId },
    socialAccountId: {
      type: Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
    },
    postContent: { type: String, required: true },
    mediaUrls: { type: [String], default: [] },
    scheduledFor: { type: Date, required: true },
    status: { type: String, default: "pending", required: true },
    providerPostId: { type: String },
    errorLog: { type: Schema.Types.Mixed },
    retryCount: { type: Number, default: 0, required: true },
    postedAt: { type: Date },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const SocialPostQueue = mongoose.models["SocialPostQueue"]
  ? mongoose.model("SocialPostQueue")
  : mongoose.model<any>("SocialPostQueue", socialPostQueueSchema);

// 5. System Settings (Branding, general, keys, security)
export interface ISystemSetting {
  _id: Types.ObjectId;
  key: string;
  value: any;
  group: string;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    group: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const SystemSetting = mongoose.models["SystemSetting"]
  ? mongoose.model("SystemSetting")
  : mongoose.model<any>("SystemSetting", systemSettingSchema);

// 6. Plugins registry
export interface IPlugin {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  version: string;
  isEnabled: boolean;
  config: any;
  hooksRegistered: any[];
  createdAt: Date;
}

const pluginSchema = new Schema<IPlugin>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    version: { type: String, default: "1.0.0", required: true },
    isEnabled: { type: Boolean, default: false, required: true },
    config: { type: Schema.Types.Mixed, default: {} },
    hooksRegistered: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

export const Plugin = mongoose.models["Plugin"]
  ? mongoose.model("Plugin")
  : mongoose.model<any>("Plugin", pluginSchema);
