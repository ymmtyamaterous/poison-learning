import { seed } from "./seed";

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
