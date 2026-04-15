import { articles, bookmarks, db, toxins } from "@better-t-app/db";
import { ORPCError } from "@orpc/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod/v4";
import { protectedProcedure } from "../index";

export const bookmarksRouter = {
  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(["toxin", "article", "all"]).default("all"),
      }),
    )
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;

      const toxinBookmarks =
        input.type === "all" || input.type === "toxin"
          ? await db
              .select({
                bookmarkId: bookmarks.id,
                bookmarkedAt: bookmarks.createdAt,
                toxin: toxins,
              })
              .from(bookmarks)
              .innerJoin(toxins, eq(bookmarks.toxinId, toxins.id))
              .where(and(eq(bookmarks.userId, userId), isNotNull(bookmarks.toxinId)))
          : [];

      const articleBookmarks =
        input.type === "all" || input.type === "article"
          ? await db
              .select({
                bookmarkId: bookmarks.id,
                bookmarkedAt: bookmarks.createdAt,
                article: articles,
              })
              .from(bookmarks)
              .innerJoin(articles, eq(bookmarks.articleId, articles.id))
              .where(and(eq(bookmarks.userId, userId), isNotNull(bookmarks.articleId)))
          : [];

      return {
        toxins: toxinBookmarks.map((r) => ({
          ...r.toxin,
          bookmarkId: r.bookmarkId,
          bookmarkedAt: r.bookmarkedAt,
        })),
        articles: articleBookmarks.map((r) => ({
          ...r.article,
          bookmarkId: r.bookmarkId,
          bookmarkedAt: r.bookmarkedAt,
        })),
      };
    }),

  add: protectedProcedure
    .input(
      z.object({
        toxinId: z.number().int().optional(),
        articleId: z.number().int().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      if (!input.toxinId && !input.articleId) {
        throw new ORPCError("BAD_REQUEST", { message: "toxinId or articleId is required" });
      }
      const userId = context.session.user.id;
      const inserted = await db
        .insert(bookmarks)
        .values({ userId, toxinId: input.toxinId, articleId: input.articleId })
        .returning({ id: bookmarks.id });
      const bookmarkId = inserted[0]?.id;
      if (!bookmarkId) throw new ORPCError("INTERNAL_SERVER_ERROR");
      return { success: true as const, bookmarkId };
    }),

  remove: protectedProcedure
    .input(z.object({ bookmarkId: z.number().int() }))
    .handler(async ({ context, input }) => {
      await db
        .delete(bookmarks)
        .where(
          and(eq(bookmarks.id, input.bookmarkId), eq(bookmarks.userId, context.session.user.id)),
        );
      return { success: true as const };
    }),

  isBookmarked: protectedProcedure
    .input(
      z.object({
        toxinId: z.number().int().optional(),
        articleId: z.number().int().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      let row: typeof bookmarks.$inferSelect | undefined;

      if (input.toxinId) {
        row = await db.query.bookmarks.findFirst({
          where: and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.toxinId, input.toxinId),
            isNull(bookmarks.articleId),
          ),
        });
      } else if (input.articleId) {
        row = await db.query.bookmarks.findFirst({
          where: and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.articleId, input.articleId),
            isNull(bookmarks.toxinId),
          ),
        });
      }

      return { bookmarked: !!row, bookmarkId: row?.id ?? null };
    }),
};
