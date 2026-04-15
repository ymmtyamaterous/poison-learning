import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/ranking")({
  component: RankingPage,
});

const DANGER_BADGE: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "低危険", color: "#39e06a", bg: "rgba(57,224,106,0.1)" },
  2: { label: "中危険", color: "#c8e03a", bg: "rgba(200,224,58,0.1)" },
  3: { label: "高危険", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  4: { label: "猛毒", color: "#e03a3a", bg: "rgba(224,58,58,0.1)" },
  5: { label: "超猛毒", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function RankingPage() {
  const { orpc } = useRouteContext({ from: "__root__" });

  const { data: rankingData } = useQuery(orpc.toxins.ranking.queryOptions({ input: { limit: 20 } }));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
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
          ◆ DANGER RANKING ◆
        </div>
        <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "2.5rem", fontWeight: 700 }}>
          毒性ランキング
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginTop: "0.75rem",
            maxWidth: "480px",
            margin: "0.75rem auto 0",
            lineHeight: 1.7,
            fontSize: "0.9375rem",
          }}
        >
          危険度レベルで分類した毒物のランキングです。
        </p>
      </div>

      {/* ランキングリスト */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {rankingData?.items?.map((toxin, idx) => {
          const badge = DANGER_BADGE[toxin.dangerLevel] ?? DANGER_BADGE[1];
          const rankColor = RANK_COLORS[idx] ?? "var(--text-muted)";
          const isTop3 = idx < 3;

          return (
            <Link
              key={toxin.id}
              to="/toxins/$slug"
              params={{ slug: toxin.slug }}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  padding: "1.25rem 1.5rem",
                  background: isTop3 ? "var(--bg-surface)" : "var(--bg-card)",
                  border: isTop3 ? `1px solid ${badge.color}30` : "1px solid var(--border)",
                  borderRadius: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = isTop3 ? `${badge.color}60` : "var(--border-strong)";
                  el.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = isTop3 ? `${badge.color}30` : "var(--border)";
                  el.style.transform = "translateX(0)";
                }}
              >
                {/* 順位 */}
                <div
                  style={{
                    width: "3rem",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {isTop3 ? (
                    <span style={{ fontSize: "1.5rem" }}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {/* メイン情報 */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <h3
                      style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {toxin.nameJa}
                    </h3>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        border: `1px solid ${badge.color}33`,
                        background: badge.bg,
                        color: badge.color,
                        fontSize: "0.625rem",
                        fontFamily: "'Space Mono',monospace",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Lv.{toxin.dangerLevel} {badge.label}
                    </span>
                  </div>
                  {toxin.nameEn && (
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.6875rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {toxin.nameEn}
                    </span>
                  )}
                </div>

                {/* 危険度バー */}
                <div style={{ flexShrink: 0, width: "80px" }}>
                  <div
                    style={{
                      height: "4px",
                      background: "var(--bg-base)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(toxin.dangerLevel / 5) * 100}%`,
                        background: badge.color,
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "0.625rem",
                      color: badge.color,
                      fontFamily: "'Space Mono',monospace",
                      marginTop: "0.25rem",
                    }}
                  >
                    {toxin.dangerLevel}/5
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
