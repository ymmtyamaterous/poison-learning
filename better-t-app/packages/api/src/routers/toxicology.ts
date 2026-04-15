import {
  articleTags,
  articles,
  categories,
  db,
  historyEvents,
  tags,
  toxinTags,
  toxins,
} from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, asc, count, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { publicProcedure } from "../index";

// ─── helpers ──────────────────────────────────────────────────────────────────
async function enrichToxins(rows: (typeof toxins.$inferSelect)[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const tagRows = await db
    .select({ toxinId: toxinTags.toxinId, slug: tags.slug, name: tags.name, id: tags.id })
    .from(toxinTags)
    .innerJoin(tags, eq(toxinTags.tagId, tags.id))
    .where(inArray(toxinTags.toxinId, ids));

  const catIds = [...new Set(rows.map((r) => r.categoryId))];
  const catRows = await db
    .select()
    .from(categories)
    .where(inArray(categories.id, catIds));
  const catMap = Object.fromEntries(catRows.map((c) => [c.id, c]));

  return rows.map((r) => {
    const toxinTagList = tagRows
      .filter((t) => t.toxinId === r.id)
      .map(({ toxinId: _tid, ...rest }) => rest);
    const cat = catMap[r.categoryId];
    return {
      ...r,
      category: cat
        ? { id: cat.id, slug: cat.slug, nameJa: cat.nameJa, nameEn: cat.nameEn, icon: cat.icon, color: cat.color }
        : null,
      tags: toxinTagList,
      excerpt: r.description.slice(0, 120),
    };
  });
}

// ─── toxinsRouter ─────────────────────────────────────────────────────────────
export const toxinsRouter = {
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        categorySlug: z.string().optional(),
        dangerLevel: z.number().int().min(1).max(5).optional(),
        toxinClass: z.string().optional(),
        tag: z.string().optional(),
        sortBy: z.enum(["dangerLevel", "name", "createdAt"]).default("name"),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .handler(async ({ input }) => {
      const { page, limit, categorySlug, dangerLevel, toxinClass, tag, sortBy, sortOrder } =
        input;
      const offset = (page - 1) * limit;

      // tag フィルタ
      let filteredIds: number[] | undefined;
      if (tag) {
        const tagRow = await db.query.tags.findFirst({ where: eq(tags.slug, tag) });
        if (tagRow) {
          const rows = await db
            .select({ toxinId: toxinTags.toxinId })
            .from(toxinTags)
            .where(eq(toxinTags.tagId, tagRow.id));
          filteredIds = rows.map((r) => r.toxinId);
          if (filteredIds.length === 0) return { items: [], total: 0, page, limit, totalPages: 0 };
        }
      }

      // カテゴリフィルタ
      let catId: number | undefined;
      if (categorySlug) {
        const cat = await db.query.categories.findFirst({ where: eq(categories.slug, categorySlug) });
        if (!cat) return { items: [], total: 0, page, limit, totalPages: 0 };
        catId = cat.id;
      }

      const conditions = [
        catId !== undefined ? eq(toxins.categoryId, catId) : undefined,
        dangerLevel !== undefined ? eq(toxins.dangerLevel, dangerLevel) : undefined,
        toxinClass ? like(toxins.toxinClass, `%${toxinClass}%`) : undefined,
        filteredIds !== undefined ? inArray(toxins.id, filteredIds) : undefined,
      ].filter(Boolean);

      const whereClause = conditions.length > 0 ? and(...(conditions as Parameters<typeof and>)) : undefined;

      const orderCol =
        sortBy === "dangerLevel"
          ? toxins.dangerLevel
          : sortBy === "createdAt"
          ? toxins.createdAt
          : toxins.nameJa;
      const orderExpr = sortOrder === "desc" ? desc(orderCol) : orderCol;

      const [totalRows, rows] = await Promise.all([
        db.select({ count: count() }).from(toxins).where(whereClause),
        db.select().from(toxins).where(whereClause).orderBy(orderExpr).limit(limit).offset(offset),
      ]);

      const total = totalRows[0]?.count ?? 0;
      const enriched = await enrichToxins(rows);

      return { items: enriched, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const row = await db.query.toxins.findFirst({ where: eq(toxins.slug, input.slug) });
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Toxin not found" });

      const enrichedList = await enrichToxins([row]);
      const enriched = enrichedList[0];
      if (!enriched) throw new ORPCError("NOT_FOUND", { message: "Toxin not found" });

      // 関連毒物（同カテゴリ・同タグ、自分除く）
      const tagRows = await db
        .select({ toxinId: toxinTags.toxinId })
        .from(toxinTags)
        .innerJoin(tags, eq(toxinTags.tagId, tags.id))
        .where(inArray(toxinTags.tagId, (enriched.tags ?? []).map((t) => t.id)));

      const relatedIds = [
        ...new Set(tagRows.map((r) => r.toxinId).filter((id) => id !== row.id)),
      ].slice(0, 4);

      let related: Awaited<ReturnType<typeof enrichToxins>> = [];
      if (relatedIds.length > 0) {
        const relRows = await db
          .select()
          .from(toxins)
          .where(inArray(toxins.id, relatedIds))
          .limit(4);
        related = await enrichToxins(relRows);
      }

      return {
        ...enriched,
        mechanism: enriched.mechanism ? JSON.parse(enriched.mechanism) : null,
        relatedToxins: related,
      };
    }),

  spotlight: publicProcedure.handler(async () => {
    const rows = await db
      .select()
      .from(toxins)
      .where(eq(toxins.isSpotlight, 1))
      .limit(6);
    return enrichToxins(rows);
  }),

  ranking: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        categorySlug: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      let catId: number | undefined;
      if (input.categorySlug) {
        const cat = await db.query.categories.findFirst({
          where: eq(categories.slug, input.categorySlug),
        });
        if (cat) catId = cat.id;
      }

      const whereClause = catId !== undefined ? eq(toxins.categoryId, catId) : undefined;
      const rows = await db
        .select()
        .from(toxins)
        .where(whereClause)
        .orderBy(desc(toxins.dangerLevel), toxins.nameJa)
        .limit(input.limit);

      const enriched = await enrichToxins(rows);
      return { items: enriched.map((t: typeof enriched[number], i: number) => ({ ...t, rank: i + 1 })) };
    }),

  search: publicProcedure
    .input(z.object({ q: z.string().min(1) }))
    .handler(async ({ input }) => {
      const q = `%${input.q}%`;
      const rows = await db
        .select()
        .from(toxins)
        .where(or(like(toxins.nameJa, q), like(toxins.nameEn, q), like(toxins.description, q)))
        .limit(20);
      return enrichToxins(rows);
    }),
};

// ─── categoriesRouter ─────────────────────────────────────────────────────────
async function enrichCategories(rows: (typeof categories.$inferSelect)[]) {
  const ids = rows.map((r) => r.id);
  const countRows = await db
    .select({ categoryId: toxins.categoryId, cnt: count() })
    .from(toxins)
    .where(inArray(toxins.categoryId, ids))
    .groupBy(toxins.categoryId);
  const countMap = Object.fromEntries(countRows.map((r) => [r.categoryId, r.cnt]));
  return rows.map((r) => ({ ...r, toxinCount: countMap[r.id] ?? 0 }));
}

export const categoriesRouter = {
  list: publicProcedure.handler(async () => {
    const rows = await db.select().from(categories).orderBy(categories.displayOrder);
    return enrichCategories(rows);
  }),

  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const row = await db.query.categories.findFirst({ where: eq(categories.slug, input.slug) });
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      const [enriched] = await enrichCategories([row]);
      return enriched;
    }),
};

// ─── articlesRouter ───────────────────────────────────────────────────────────
async function enrichArticles(rows: (typeof articles.$inferSelect)[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const tagRows = await db
    .select({ articleId: articleTags.articleId, slug: tags.slug, name: tags.name, id: tags.id })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(inArray(articleTags.articleId, ids));

  return rows.map((r) => ({
    ...r,
    tags: tagRows.filter((t) => t.articleId === r.id).map(({ articleId: _aid, ...rest }) => rest),
  }));
}

export const articlesRouter = {
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(12),
        category: z.string().optional(),
        tag: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { page, limit, category, tag } = input;
      const offset = (page - 1) * limit;

      let filteredIds: number[] | undefined;
      if (tag) {
        const tagRow = await db.query.tags.findFirst({ where: eq(tags.slug, tag) });
        if (tagRow) {
          const rows = await db
            .select({ articleId: articleTags.articleId })
            .from(articleTags)
            .where(eq(articleTags.tagId, tagRow.id));
          filteredIds = rows.map((r) => r.articleId);
          if (filteredIds.length === 0)
            return { items: [], total: 0, page, limit, totalPages: 0 };
        }
      }

      const conditions = [
        category ? eq(articles.category, category) : undefined,
        filteredIds !== undefined ? inArray(articles.id, filteredIds) : undefined,
      ].filter(Boolean);

      const whereClause =
        conditions.length > 0 ? and(...(conditions as Parameters<typeof and>)) : undefined;

      const [totalRows, rows] = await Promise.all([
        db.select({ count: count() }).from(articles).where(whereClause),
        db
          .select()
          .from(articles)
          .where(whereClause)
          .orderBy(desc(articles.publishedAt))
          .limit(limit)
          .offset(offset),
      ]);

      const total = totalRows[0]?.count ?? 0;
      const enriched = await enrichArticles(rows);
      return { items: enriched, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const row = await db.query.articles.findFirst({ where: eq(articles.slug, input.slug) });
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Article not found" });
      const [enriched] = await enrichArticles([row]);

      // 関連記事（同カテゴリ・自分除く）
      const related = await db
        .select()
        .from(articles)
        .where(and(eq(articles.category, row.category), sql`${articles.id} != ${row.id}`))
        .orderBy(desc(articles.publishedAt))
        .limit(3);
      const enrichedRelated = await enrichArticles(related);

      return { ...enriched, relatedArticles: enrichedRelated };
    }),

  latest: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(6) }))
    .handler(async ({ input }) => {
      const rows = await db
        .select()
        .from(articles)
        .orderBy(desc(articles.publishedAt))
        .limit(input.limit);
      return enrichArticles(rows);
    }),
};

// ─── historyRouter ────────────────────────────────────────────────────────────
export const historyRouter = {
  list: publicProcedure
    .input(
      z.object({
        tag: z.enum(["culture", "science", "incident", "medicine"]).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const whereClause = input.tag ? eq(historyEvents.tag, input.tag) : undefined;
      return db
        .select()
        .from(historyEvents)
        .where(whereClause)
        .orderBy(asc(historyEvents.yearSort));
    }),
};

// ─── searchRouter ─────────────────────────────────────────────────────────────
export const searchRouter = {
  query: publicProcedure
    .input(
      z.object({
        q: z.string().min(1),
        type: z.enum(["all", "toxin", "article"]).default("all"),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .handler(async ({ input }) => {
      const q = `%${input.q}%`;
      const toxinResults =
        input.type === "all" || input.type === "toxin"
          ? await db
              .select()
              .from(toxins)
              .where(or(like(toxins.nameJa, q), like(toxins.nameEn, q), like(toxins.description, q)))
              .limit(input.limit)
          : [];
      const articleResults =
        input.type === "all" || input.type === "article"
          ? await db
              .select()
              .from(articles)
              .where(
                or(like(articles.title, q), like(articles.excerpt, q), like(articles.content, q)),
              )
              .limit(input.limit)
          : [];

      const enrichedToxins = await enrichToxins(toxinResults);
      const enrichedArticles = await enrichArticles(articleResults);

      return {
        toxins: enrichedToxins,
        articles: enrichedArticles,
        total: enrichedToxins.length + enrichedArticles.length,
      };
    }),
};

// ─── statsRouter ──────────────────────────────────────────────────────────────
export const statsRouter = {
  get: publicProcedure.handler(async () => {
    const [toxinCount, chemCount, histCount, catCount] = await Promise.all([
      db.select({ count: count() }).from(toxins),
      db
        .select({ count: count() })
        .from(toxins)
        .where(
          inArray(
            toxins.categoryId,
            db
              .select({ id: categories.id })
              .from(categories)
              .where(eq(categories.slug, "chemistry")),
          ),
        ),
      db
        .select({ count: count() })
        .from(articles)
        .where(or(eq(articles.category, "history"), eq(articles.category, "culture"))),
      db.select({ count: count() }).from(categories),
    ]);

    return {
      toxinCount: toxinCount[0]?.count ?? 0,
      chemistryCount: chemCount[0]?.count ?? 0,
      historyArticleCount: histCount[0]?.count ?? 0,
      categoryCount: catCount[0]?.count ?? 0,
    };
  }),
};
