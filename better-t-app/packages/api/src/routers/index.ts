import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { bookmarksRouter } from "./bookmarks";
import {
  articlesRouter,
  categoriesRouter,
  historyRouter,
  searchRouter,
  statsRouter,
  toxinsRouter,
} from "./toxicology";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  toxins: toxinsRouter,
  categories: categoriesRouter,
  articles: articlesRouter,
  history: historyRouter,
  search: searchRouter,
  stats: statsRouter,
  bookmarks: bookmarksRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
