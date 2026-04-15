import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

// ─── categories ────────────────────────────────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  nameJa: text("name_ja").notNull(),
  nameEn: text("name_en").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── tags ──────────────────────────────────────────────────────────────────────
export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── toxins ───────────────────────────────────────────────────────────────────
export const toxins = sqliteTable(
  "toxins",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    nameJa: text("name_ja").notNull(),
    nameEn: text("name_en").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    description: text("description").notNull(),
    emoji: text("emoji").notNull().default("☠"),
    dangerLevel: integer("danger_level").notNull(),
    molecularFormula: text("molecular_formula"),
    molecularWeight: real("molecular_weight"),
    ld50: text("ld50"),
    toxinClass: text("toxin_class"),
    target: text("target"),
    producingOrganism: text("producing_organism"),
    antidote: text("antidote"),
    mechanism: text("mechanism"), // JSON string of MechanismStep[]
    isSpotlight: integer("is_spotlight").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_toxins_category_id").on(table.categoryId),
    index("idx_toxins_danger_level").on(table.dangerLevel),
    index("idx_toxins_is_spotlight").on(table.isSpotlight),
  ],
);

// ─── toxin_tags ───────────────────────────────────────────────────────────────
export const toxinTags = sqliteTable(
  "toxin_tags",
  {
    toxinId: integer("toxin_id")
      .notNull()
      .references(() => toxins.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.toxinId, table.tagId] })],
);

// ─── articles ─────────────────────────────────────────────────────────────────
export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category").notNull(), // animal|plant|chemistry|history|medicine|culture
    emoji: text("emoji").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    publishedAt: text("published_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_articles_category").on(table.category),
    index("idx_articles_published_at").on(table.publishedAt),
  ],
);

// ─── article_tags ─────────────────────────────────────────────────────────────
export const articleTags = sqliteTable(
  "article_tags",
  {
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.tagId] })],
);

// ─── history_events ───────────────────────────────────────────────────────────
export const historyEvents = sqliteTable(
  "history_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    year: text("year").notNull(),
    yearSort: integer("year_sort").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    tag: text("tag").notNull(), // culture|science|incident|medicine
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index("idx_history_events_year_sort").on(table.yearSort)],
);

// ─── bookmarks ────────────────────────────────────────────────────────────────
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    toxinId: integer("toxin_id").references(() => toxins.id, {
      onDelete: "cascade",
    }),
    articleId: integer("article_id").references(() => articles.id, {
      onDelete: "cascade",
    }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index("idx_bookmarks_user_id").on(table.userId)],
);

// ─── Relations ────────────────────────────────────────────────────────────────
export const categoriesRelations = relations(categories, ({ many }) => ({
  toxins: many(toxins),
}));

export const toxinsRelations = relations(toxins, ({ one, many }) => ({
  category: one(categories, {
    fields: [toxins.categoryId],
    references: [categories.id],
  }),
  toxinTags: many(toxinTags),
  bookmarks: many(bookmarks),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  toxinTags: many(toxinTags),
  articleTags: many(articleTags),
}));

export const toxinTagsRelations = relations(toxinTags, ({ one }) => ({
  toxin: one(toxins, {
    fields: [toxinTags.toxinId],
    references: [toxins.id],
  }),
  tag: one(tags, {
    fields: [toxinTags.tagId],
    references: [tags.id],
  }),
}));

export const articlesRelations = relations(articles, ({ many }) => ({
  articleTags: many(articleTags),
  bookmarks: many(bookmarks),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, {
    fields: [bookmarks.userId],
    references: [user.id],
  }),
  toxin: one(toxins, {
    fields: [bookmarks.toxinId],
    references: [toxins.id],
  }),
  article: one(articles, {
    fields: [bookmarks.articleId],
    references: [articles.id],
  }),
}));
