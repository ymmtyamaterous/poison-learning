import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/categories/")({
  component: CategoriesPage,
});

const CATEGORY_ICONS: Record<string, string> = {
  植物毒: "🌿",
  動物毒: "🐍",
  菌類毒: "🍄",
  化学合成毒: "⚗️",
};

function CategoriesPage() {
  const { orpc } = useRouteContext({ from: "__root__" });

  const { data: categoriesData } = useQuery(orpc.categories.list.queryOptions());

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.6875rem",
            letterSpacing: "0.3em",
            color: "var(--poison-green)",
            marginBottom: "0.75rem",
          }}
        >
          ◆ CATEGORIES ◆
        </div>
        <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "2.5rem", fontWeight: 700 }}>
          毒の分類
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", maxWidth: "480px", margin: "0.75rem auto 0", lineHeight: 1.7, fontSize: "0.9375rem" }}>
          毒物は起源・性質によって分類されます。カテゴリを選択して、その分野の毒物を探索しましょう。
        </p>
      </div>

      {/* カテゴリグリッド */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {categoriesData?.map((cat) => (
          <Link key={cat.id} to="/categories/$slug" params={{ slug: cat.slug }} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "2.5rem 2rem",
                transition: "all 0.3s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-strong)";
                el.style.background = "var(--bg-card-hover)";
                el.style.transform = "translateY(-6px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.background = "var(--bg-card)";
                el.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  fontSize: "3.5rem",
                  marginBottom: "1.25rem",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                }}
              >
                {CATEGORY_ICONS[cat.nameJa] ?? "🧪"}
              </div>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                {cat.nameJa}
              </h2>
              {cat.description && (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.7,
                    flex: 1,
                  }}
                >
                  {cat.description}
                </p>
              )}
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "0.375rem 1rem",
                  background: "rgba(57,224,106,0.08)",
                  border: "1px solid rgba(57,224,106,0.2)",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  color: "var(--poison-green)",
                  fontFamily: "'Space Mono',monospace",
                }}
              >
                詳細を見る →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
