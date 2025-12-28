import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  pgEnum,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["user", "educator", "admin"]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected",
]);
export const contentTypeEnum = pgEnum("content_type", [
  "article",
  "video",
  "podcast",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "content_verified",
  "content_rejected",
  "comment_added",
  "comment_reply",
  "like_added",
]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  name: text("name"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: text("password"),
  googleId: text("google_id").unique(),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("user").notNull(),
  specialty: text("specialty"),
  bio: text("bio"),
  location: text("location"),
  education: text("education"),
  website: text("website"),
  githubHandle: text("github_handle"),
  twitterHandle: text("twitter_handle"),
  linkedinHandle: text("linkedin_handle"),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sheeridVerifications = pgTable("sheerid_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  verificationId: text("verification_id").notNull().unique(),
  status: verificationStatusEnum("status").default("pending").notNull(),
  verificationData: jsonb("verification_data"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const content = pgTable(
  "content",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    body: text("body").notNull(),
    excerpt: text("excerpt"),
    type: contentTypeEnum("type").default("article").notNull(),
    mediaUrl: text("media_url"),
    topics: text("topics")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    source: text("source").default("user").notNull(),
    authorId: varchar("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    verificationStatus: verificationStatusEnum("verification_status")
      .default("pending")
      .notNull(),
    verifiedBy: varchar("verified_by").references(() => users.id),
    verifiedAt: timestamp("verified_at"),
    confidenceScore: integer("confidence_score").default(0),
    popularity: integer("popularity").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    authorIdx: index("content_author_idx").on(table.authorId),
    statusIdx: index("content_status_idx").on(table.verificationStatus),
    topicsIdx: index("content_topics_idx").on(table.topics),
  })
);

export const comments = pgTable(
  "comments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contentId: varchar("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    authorId: varchar("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: varchar("parent_id"), // Broken self-reference fixed for build
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    contentIdx: index("comments_content_idx").on(table.contentId),
    parentIdx: index("comments_parent_idx").on(table.parentId),
  })
);

export const likes = pgTable(
  "likes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contentId: varchar("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    contentUserIdx: index("likes_content_user_idx").on(
      table.contentId,
      table.userId
    ),
  })
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contentId: varchar("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("bookmarks_user_idx").on(table.userId),
    contentUserIdx: index("bookmarks_content_user_idx").on(
      table.contentId,
      table.userId
    ),
  })
);

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id")
    .notNull()
    .references(() => content.id, { onDelete: "cascade" }),
  reporterId: varchar("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: verificationStatusEnum("status").default("pending").notNull(),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const consents = pgTable("consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  consentType: text("consent_type").notNull(),
  consentedAt: timestamp("consented_at").defaultNow().notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    contentId: varchar("content_id").references(() => content.id, {
      onDelete: "cascade",
    }),
    commentId: varchar("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    readIdx: index("notifications_read_idx").on(table.read),
  })
);

export const commentLikes = pgTable(
  "comment_likes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    commentId: varchar("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    commentUserIdx: index("comment_likes_comment_user_idx").on(
      table.commentId,
      table.userId
    ),
  })
);

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedBy: true,
  verifiedAt: true,
  popularity: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  resolvedBy: true,
  resolvedAt: true,
});

export const insertSheerIDVerificationSchema = createInsertSchema(
  sheeridVerifications
).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertCommentLikeSchema = createInsertSchema(commentLikes).omit({
  id: true,
  createdAt: true,
});

// Select Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type SheerIDVerification = typeof sheeridVerifications.$inferSelect;
export type InsertSheerIDVerification = z.infer<
  typeof insertSheerIDVerificationSchema
>;

export type Session = typeof sessions.$inferSelect;
export type Consent = typeof consents.$inferSelect;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;
