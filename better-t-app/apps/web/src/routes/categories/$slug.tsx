import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/categories/$slug")({
  component: CategoryDetailPage,
});

const DANGER_BADGE: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "低危険", color: "#39e06a", bg: "rgba(57,224,106,0.1)" },
  2: { label: "中危険", color: "#c8e03a", bg: "rgba(200,224,58,0.1)" },
  3: { label: "高危険", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  4: { label: "猛毒", color: "#e03a3a", bg: "rgba(224,58,58,0.1)" },
  5: { label: "超猛毒", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

function DangerBadge({ level }: { level: number }) {
  const badge = DANGER_BADGE[level] ?? DANGER_BADGE[1];
  return (
    <span
      style={{
        fontSize: "0.625rem",
        fontFamily: "'Space Mono',monospace",
        padding: "0.2rem 0.5rem",
        borderRadius: "4px",
        border: `1px solid ${badge.color}33`,
        background: badge.bg,
        color: badge.color,
        whiteSpace: "nowrap",
      }}
    >
      Lv.{level} {badge.label}
    </span>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  植物毒: "🌿",
  動物毒: "🐍",
  菌類毒: "🍄",
  化学合成毒: "⚗️",
};

function CategoryDetailPage() {
  const { slug } = Route.useParams();
  const { orpc } = useRouteContext({ from: "__root__" });

  const { data: category, isLoading } = useQuery(orpc.categories.get.queryOptions({ input: { slug } }));
  const { data: toxinsData } = useQuery(
    orpc.toxins.list.queryOptions({
      input: {
        categorySlug: slug,
        limit: 50,
      },
    }),
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "var(--text-muted)",
          fontFamily: "'Space Mono',monospace",
          fontSize: "0.875rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!category) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "4rem" }}>🧪</div>
        <p style={{ color: "var(--text-muted)" }}>カテゴリが見つかりませんでした</p>
        <Link to="/categories" style={{ textDecoration: "none", color: "var(--poison-green)", fontSize: "0.875rem" }}>
          ← カテゴリ一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* パンくず */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "2rem",
          fontSize: "0.8125rem",
          color: "var(--text-muted)",
          fontFamily: "'Space Mono',monospace",
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "var(--text-muted)" }}>HOME</Link>
        <span>/</span>
        <Link to="/categories" style={{ textDecoration: "none", color: "var(--text-muted)" }}>カテゴリ</Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{category.nameJa}</span>
      </div>

      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "3rem",
          padding: "2rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
        }}
      >
        <div
          style={{
            fontSize: "4rem",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
          }}
        >
          {CATEGORY_ICONS[category.nameJa] ?? "🧪"}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.2em",
              color: "var(--poison-green)",
              marginBottom: "0.5rem",
            }}
          >
            CATEGORY
          </div>
          <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {category.nameJa}
          </h1>
          {category.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
              {category.description}
            </p>
          )}
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.5rem", fontFamily: "'Space Mono',monospace" }}>
            {toxinsData?.total ?? 0}種の毒物
          </p>
        </div>
      </div>

      {/* 毒物グリッド */}
      {toxinsData && toxinsData.items.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {toxinsData.items.map((toxin) => (
            <Link key={toxin.id} to="/toxins/$slug" params={{ slug: toxin.slug }} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border-strong)";
                  el.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.875rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {toxin.nameJa}
                    </h3>
                    {toxin.nameEn && (
                      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.625rem", color: "var(--text-muted)" }}>
                        {toxin.nameEn}
                      </p>
                    )}
                  </div>
                  <DangerBadge level={toxin.dangerLevel} />
                </div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {toxin.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <p>このカテゴリにはまだ毒物が登録されていません</p>
        </div>
      )}

      <div style={{ marginTop: "3rem" }}>
        <Link to="/categories" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--poison-green)", fontFamily: "'Space Mono',monospace" }}>
            ← カテゴリ一覧に戻る
          </span>
        </Link>
      </div>
    </div>
  );
}
