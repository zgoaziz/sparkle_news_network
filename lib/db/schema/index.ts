export * from "./users";
export * from "./categories";
export * from "./articles";
export * from "./comments";
export * from "./interactions";
export * from "./contact";
export * from "./admin-extended";
export * from "./notifications";
export * from "./sponsors";

// Backward compatibility exports for Drizzle table names
// These map to Mongoose models for gradual migration
import { User as UserModel } from "./users";
import { Category as CategoryModel } from "./categories";
import { Article as ArticleModel } from "./articles";
import { Comment as CommentModel } from "./comments";
import {
  Favorite as FavoriteModel,
  Like as LikeModel,
  ReadingHistory as ReadingHistoryModel,
} from "./interactions";
import {
  ContactMessage as ContactMessageModel,
  NewsletterSubscriber as NewsletterSubscriberModel,
} from "./contact";
import {
  AIProvider as AIProviderModel,
  AIRoutingLog as AIRoutingLogModel,
  SocialAccount as SocialAccountModel,
  SocialPostQueue as SocialPostQueueModel,
  SystemSetting as SystemSettingModel,
  Plugin as PluginModel,
} from "./admin-extended";
import { Sponsor as SponsorModel } from "./sponsors";

export const usersTable = UserModel;
export const categoriesTable = CategoryModel;
export const articlesTable = ArticleModel;
export const commentsTable = CommentModel;
export const favoritesTable = FavoriteModel;
export const likesTable = LikeModel;
export const readingHistoryTable = ReadingHistoryModel;
export const contactMessagesTable = ContactMessageModel;
export const newsletterSubscribersTable = NewsletterSubscriberModel;
export const aiProvidersTable = AIProviderModel;
export const aiRoutingLogsTable = AIRoutingLogModel;
export const socialAccountsTable = SocialAccountModel;
export const socialPostsQueueTable = SocialPostQueueModel;
export const systemSettingsTable = SystemSettingModel;
export const pluginsTable = PluginModel;
export const sponsorsTable = SponsorModel;
