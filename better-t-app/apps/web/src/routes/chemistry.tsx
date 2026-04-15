import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/chemistry")({
  component: ChemistryPage,
});

const DANGER_BADGE: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "低危険", color: "#39e06a", bg: "rgba(57,224,106,0.1)" },
  2: { label: "中危険", color: "#c8e03a", bg: "rgba(200,224,58,0.1)" },
  3: { label: "高危険", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  4: { label: "猛毒", color: "#e03a3a", bg: "rgba(224,58,58,0.1)" },
  5: { label: "超猛毒", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

const TOXIN_CLASS_OPTIONS = [
  { value: "", label: "すべて" },
  { value: "タンパク質毒素", label: "タンパク質毒素" },
  { value: "非タンパク質毒素", label: "非タンパク質毒素" },
  { value: "アルカロイド", label: "アルカロイド" },
  { value: "有機リン系", label: "有機リン系" },
];

const MW_RANGE_OPTIONS = [
  { value: "", label: "すべて" },
  { value: "small", label: "〜500 Da" },
  { value: "medium", label: "500〜5,000 Da" },
  { value: "large", label: "5,000 Da〜" },
];

function ChemistryPage() {
  const { orpc } = useRouteContext({ from: "__root__" });
  const [toxinClass, setToxinClass] = useState("");
  const [mwRange, setMwRange] = useState("");
  const [sortBy, setSortBy] = useState<"dangerLevel" | "name" | "createdAt">("dangerLevel");

  const { data: toxinsData, isLoading } = useQuery(
    orpc.toxins.list.queryOptions({
      input: {
        limit: 100,
        sortBy,
        sortOrder: "desc",
        toxinClass: toxinClass || undefined,
      },
    }),
  );

  // 分子量フィルタ（クライアント側）
  const filtered = toxinsData?.items.filter((t) => {
    if (!t.molecularFormula) return false; // 分子式なしは除外
    if (!mwRange) return true;
    const mw = t.molecularWeight ?? 0;
    if (mwRange === "small") return mw > 0 && mw <= 500;
    if (mwRange === "medium") return mw > 500 && mw <= 5000;
    if (mwRange === "large") return mw > 5000;
    return true;
  });

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
            marginBottom: "0.75rem",
          }}
        >
          ◆ MOLECULAR DATABASE ◆
        </div>
        <h1
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
          }}
        >
          毒の化学構造
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9375rem",
            lineHeight: 1.7,
            maxWidth: "600px",
          }}
        >
          毒物の分子式・分子量・LD₅₀・毒素クラスを一覧で比較できます。
        </p>
      </div>

      {/* フィルターバー */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
          padding: "1.25rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          alignItems: "flex-end",
        }}
      >
        {/* 毒素クラスフィルタ */}
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
            毒素クラス
          </label>
          <select
            value={toxinClass}
            onChange={(e) => setToxinClass(e.target.value)}
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
            {TOXIN_CLASS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 分子量範囲フィルタ */}
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
            分子量
          </label>
          <select
            value={mwRange}
            onChange={(e) => setMwRange(e.target.value)}
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
            {MW_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
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
            <option value="dangerLevel">危険度（高い順）</option>
            <option value="name">名前順</option>
            <option value="createdAt">追加が新しい順</option>
          </select>
        </div>

        {/* 件数表示 */}
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            alignSelf: "center",
          }}
        >
          {filtered ? (
            <span>
              <span style={{ color: "var(--poison-green)", fontWeight: 700 }}>{filtered.length}</span>
              {" "}件表示
            </span>
          ) : null}
        </div>
      </div>

      {/* 化学物質カードグリッド */}
      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              style={{
                height: "200px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filtered.map((toxin) => {
            const badge = DANGER_BADGE[toxin.dangerLevel] ?? DANGER_BADGE[1];
            return (
              <Link
                key={toxin.id}
                to="/toxins/$slug"
                params={{ slug: toxin.slug }}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.875rem",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(167,139,250,0.4)";
                    el.style.transform = "translateY(-4px)";
                    el.style.boxShadow = "0 8px 24px rgba(167,139,250,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--border)";
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  {/* 分子式 */}
                  <div
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#a78bfa",
                      letterSpacing: "0.05em",
                      lineHeight: 1.2,
                    }}
                  >
                    {toxin.molecularFormula ?? "—"}
                  </div>

                  {/* 名前 */}
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.2rem",
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

                  {/* プロパティグリッド */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      flex: 1,
                    }}
                  >
                    {toxin.molecularWeight && (
                      <div
                        style={{
                          padding: "0.5rem 0.625rem",
                          background: "var(--bg-surface)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.5625rem",
                            color: "var(--text-muted)",
                            fontFamily: "'Space Mono',monospace",
                            marginBottom: "0.2rem",
                          }}
                        >
                          分子量
                        </div>
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-primary)",
                            fontFamily: "'Space Mono',monospace",
                            fontWeight: 700,
                          }}
                        >
                          {toxin.molecularWeight.toLocaleString()} Da
                        </div>
                      </div>
                    )}
                    {toxin.ld50 && (
                      <div
                        style={{
                          padding: "0.5rem 0.625rem",
                          background: "var(--bg-surface)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.5625rem",
                            color: "var(--text-muted)",
                            fontFamily: "'Space Mono',monospace",
                            marginBottom: "0.2rem",
                          }}
                        >
                          LD₅₀
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: badge.color,
                            fontFamily: "'Space Mono',monospace",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {toxin.ld50}
                        </div>
                      </div>
                    )}
                    {toxin.toxinClass && (
                      <div
                        style={{
                          padding: "0.5rem 0.625rem",
                          background: "var(--bg-surface)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          gridColumn: "1 / -1",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.5625rem",
                            color: "var(--text-muted)",
                            fontFamily: "'Space Mono',monospace",
                            marginBottom: "0.2rem",
                          }}
                        >
                          毒素クラス
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {toxin.toxinClass}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 危険度バッジ */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                      }}
                    >
                      Lv.{toxin.dangerLevel} {badge.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "5rem 2rem",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚗️</div>
          <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.125rem" }}>
            条件に合う化学物質が見つかりませんでした
          </p>
        </div>
      )}
    </div>
  );
}
