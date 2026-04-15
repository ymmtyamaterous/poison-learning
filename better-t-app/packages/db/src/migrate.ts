import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index";
import { seed } from "./seed";

/**
 * マイグレーションを実行し、シードデータを投入する。
 * - マイグレーションフォルダは環境変数 MIGRATIONS_FOLDER が優先される。
 *   未設定の場合は実行ファイルと同階層の ./migrations を使用する。
 * - シードは onConflictDoNothing() のため冪等（何度実行しても安全）。
 */
export async function runMigrations() {
  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER ??
    path.join(import.meta.dirname, "migrations");

  console.log(`🔄 Running migrations from: ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  console.log("✅ Migrations complete");

  console.log("🌱 Running seed...");
  await seed();
  console.log("✅ Seed complete");
}
