import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/toxins/")({
  component: ToxinsPage,
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
        letterSpacing: "0.05em",
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

const SORT_OPTIONS = [
  { value: "dangerLevel_desc", label: "危険度（高い順）" },
  { value: "dangerLevel_asc", label: "危険度（低い順）" },
  { value: "nameJa_asc", label: "名前順（あ〜ん）" },
  { value: "createdAt_desc", label: "追加が新しい順" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function ToxinsPage() {
  const { orpc } = useRouteContext({ from: "__root__" });
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedDanger, setSelectedDanger] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<SortValue>("dangerLevel_desc");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [sortField, sortOrder] = sortBy.split("_") as [string, "asc" | "desc"];

  const { data: categoriesData } = useQuery(orpc.categories.list.queryOptions());
  const { data: toxinsData } = useQuery(
    orpc.toxins.list.queryOptions({
      input: {
        categorySlug: selectedCategory,
        dangerLevel: selectedDanger,
        sortBy: sortField as "dangerLevel" | "name" | "createdAt",
        sortOrder: sortOrder,
        limit,
        page,
      },
    }),
  );

  const totalPages = toxinsData ? Math.ceil(toxinsData.total / limit) : 1;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.6875rem",
            letterSpacing: "0.3em",
            color: "var(--poison-green)",
            marginBottom: "0.5rem",
          }}
        >
          ◆ TOXIN DATABASE ◆
        </div>
        <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "2rem", fontWeight: 700 }}>
          毒図鑑
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.875rem" }}>
          {toxinsData ? `${toxinsData.total}種の毒物を収録` : "読み込み中..."}
        </p>
      </div>

      {/* フィルター */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
          padding: "1.25rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          alignItems: "flex-end",
        }}
      >
        {/* カテゴリフィルター */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.6875rem",
              fontFamily: "'Space Mono',monospace",
              color: "var(--text-muted)",
              marginBottom: "0.375rem",
              letterSpacing: "0.1em",
            }}
          >
            カテゴリ
          </label>
          <select
            value={selectedCategory ?? ""}
            onChange={(e) => {
              setSelectedCategory(e.target.value || undefined);
              setPage(1);
            }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              padding: "0.375rem 0.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <option value="">すべて</option>
            {categoriesData?.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.nameJa}
              </option>
            ))}
          </select>
        </div>

        {/* 危険度フィルター */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.6875rem",
              fontFamily: "'Space Mono',monospace",
              color: "var(--text-muted)",
              marginBottom: "0.375rem",
              letterSpacing: "0.1em",
            }}
          >
            危険度
          </label>
          <select
            value={selectedDanger ?? ""}
            onChange={(e) => {
              setSelectedDanger(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              padding: "0.375rem 0.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <option value="">すべて</option>
            {[1, 2, 3, 4, 5].map((lv) => (
              <option key={lv} value={lv}>
                Lv.{lv} - {DANGER_BADGE[lv]?.label}
              </option>
            ))}
          </select>
        </div>

        {/* ソート */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.6875rem",
              fontFamily: "'Space Mono',monospace",
              color: "var(--text-muted)",
              marginBottom: "0.375rem",
              letterSpacing: "0.1em",
            }}
          >
            並び替え
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortValue);
              setPage(1);
            }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              padding: "0.375rem 0.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* リセット */}
        {(selectedCategory || selectedDanger) && (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(undefined);
                setSelectedDanger(undefined);
                setPage(1);
              }}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--text-muted)",
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              ✕ リセット
            </button>
          </div>
        )}
      </div>

      {/* グリッド */}
      {toxinsData && toxinsData.items.length > 0 ? (
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}
        >
          {toxinsData.items.map((toxin) => (
            <Link key={toxin.id} to="/toxins/$slug" params={{ slug: toxin.slug }} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  height: "100%",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border-strong)";
                  el.style.transform = "translateY(-3px)";
                  el.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border)";
                  el.style.transform = "translateY(0)";
                  el.style.background = "var(--bg-card)";
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
                        marginBottom: "0.25rem",
                      }}
                    >
                      {toxin.nameJa}
                    </h3>
                    {toxin.nameEn && (
                      <p
                        style={{
                          fontFamily: "'Space Mono',monospace",
                          fontSize: "0.625rem",
                          color: "var(--text-muted)",
                          letterSpacing: "0.05em",
                        }}
                      >
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
                    marginBottom: "0.875rem",
                  }}
                >
                  {toxin.excerpt}
                </p>
                {toxin.category && (
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      padding: "0.15rem 0.5rem",
                      color: "var(--text-muted)",
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    {toxin.category.nameJa}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <p>条件に合う毒物が見つかりませんでした</p>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "3rem",
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: page === 1 ? "var(--text-muted)" : "var(--text-primary)",
              cursor: page === 1 ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            ← 前
          </button>
          <span
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              padding: "0 1rem",
            }}
          >
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            次 →
          </button>
        </div>
      )}
    </div>
  );
}
