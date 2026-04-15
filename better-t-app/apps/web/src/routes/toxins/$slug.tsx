import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/toxins/$slug")({
  component: ToxinDetailPage,
});

const DANGER_BADGE: Record<number, { label: string; color: string; bg: string; glow: string }> = {
  1: { label: "低危険", color: "#39e06a", bg: "rgba(57,224,106,0.1)", glow: "rgba(57,224,106,0.2)" },
  2: { label: "中危険", color: "#c8e03a", bg: "rgba(200,224,58,0.1)", glow: "rgba(200,224,58,0.2)" },
  3: { label: "高危険", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", glow: "rgba(245,158,11,0.2)" },
  4: { label: "猛毒", color: "#e03a3a", bg: "rgba(224,58,58,0.1)", glow: "rgba(224,58,58,0.2)" },
  5: { label: "超猛毒", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", glow: "rgba(167,139,250,0.2)" },
};

function ToxinDetailPage() {
  const { slug } = Route.useParams();
  const { orpc } = useRouteContext({ from: "__root__" });
  const { data: session } = authClient.useSession();

  const { data: toxin, isLoading, isError } = useQuery(orpc.toxins.get.queryOptions({ input: { slug } }));

  const { data: isBookmarked, refetch: refetchBookmark } = useQuery({
    ...orpc.bookmarks.isBookmarked.queryOptions({ input: { toxinId: toxin?.id ?? 0 } }),
    enabled: !!session && !!toxin?.id,
  });

  const handleBookmark = async () => {
    if (!toxin) return;
    if (isBookmarked) {
      await fetch(`/rpc/bookmarks.remove`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toxinId: toxin.id }),
      });
    } else {
      await fetch(`/rpc/bookmarks.add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toxinId: toxin.id }),
      });
    }
    refetchBookmark();
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "var(--text-muted)",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.875rem",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (isError || !toxin) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "var(--text-muted)",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "4rem" }}>☠</div>
        <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.25rem" }}>
          毒物が見つかりませんでした
        </p>
        <Link to="/toxins" style={{ textDecoration: "none", color: "var(--poison-green)", fontSize: "0.875rem" }}>
          ← 毒図鑑に戻る
        </Link>
      </div>
    );
  }

  const badge = DANGER_BADGE[toxin.dangerLevel] ?? DANGER_BADGE[1];

  // 毒性機構をステップ表示用に分割（APIがJSON.parseした結果を返す）
  const mechanismSteps: string[] = Array.isArray(toxin.mechanism)
    ? toxin.mechanism
    : typeof toxin.mechanism === "string"
    ? (toxin.mechanism as string).split(/[。\n]/).filter((s: string) => s.trim().length > 0)
    : [];

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 1.5rem" }}>
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
        <Link to="/" style={{ textDecoration: "none", color: "var(--text-muted)" }}>
          HOME
        </Link>
        <span>/</span>
        <Link to="/toxins" style={{ textDecoration: "none", color: "var(--text-muted)" }}>
          毒図鑑
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{toxin.nameJa}</span>
      </div>

      {/* メインヘッダー */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: `1px solid ${badge.color}30`,
          borderRadius: "16px",
          padding: "2.5rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景グロー */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${badge.glow} 0%, transparent 70%)`,
            pointerEvents: "none",
            transform: "translate(30%, -30%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                {/* 危険度バッジ */}
                <span
                  style={{
                    padding: "0.35rem 0.875rem",
                    borderRadius: "6px",
                    border: `1px solid ${badge.color}44`,
                    background: badge.bg,
                    color: badge.color,
                    fontSize: "0.6875rem",
                    fontFamily: "'Space Mono',monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  Lv.{toxin.dangerLevel} {badge.label}
                </span>
                {toxin.category && (
                  <span
                    style={{
                      padding: "0.35rem 0.875rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-card)",
                      color: "var(--text-muted)",
                      fontSize: "0.6875rem",
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    {toxin.category.nameJa}
                  </span>
                )}
              </div>
              <h1
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                  marginBottom: "0.5rem",
                }}
              >
                {toxin.nameJa}
              </h1>
              {toxin.nameEn && (
                <p
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "0.9375rem",
                    color: "var(--text-muted)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {toxin.nameEn}
                </p>
              )}
            </div>
            {session && (
              <button
                type="button"
                onClick={handleBookmark}
                style={{
                  background: isBookmarked ? "rgba(57,224,106,0.15)" : "var(--bg-card)",
                  border: `1px solid ${isBookmarked ? "var(--poison-green)" : "var(--border)"}`,
                  borderRadius: "8px",
                  padding: "0.625rem 1rem",
                  color: isBookmarked ? "var(--poison-green)" : "var(--text-secondary)",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {isBookmarked ? "★ 保存済み" : "☆ 保存する"}
              </button>
            )}
          </div>

          {/* 概要 */}
          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              maxWidth: "700px",
            }}
          >
            {toxin.excerpt}
          </p>
        </div>
      </div>

      {/* 2カラムグリッド */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* 左: メインコンテンツ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* 詳細説明 */}
          {toxin.description && (
            <section
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.75rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  color: "var(--text-primary)",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "0.75rem",
                }}
              >
                詳細
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.9 }}>
                {toxin.description}
              </p>
            </section>
          )}

          {/* 毒性メカニズム */}
          {mechanismSteps.length > 0 && (
            <section
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.75rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  color: "var(--text-primary)",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "0.75rem",
                }}
              >
                毒性メカニズム
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {mechanismSteps.map((step: string, idx: number) => (
                  <div
                    key={`step-${idx}`}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: `${badge.color}22`,
                        border: `1px solid ${badge.color}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.625rem",
                        color: badge.color,
                        fontWeight: 700,
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7, paddingTop: "0.25rem" }}>
                      {step.trim()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* タグ */}
          {toxin.tags && toxin.tags.length > 0 && (
            <section
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.75rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  color: "var(--text-primary)",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "0.75rem",
                }}
              >
                タグ
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {toxin.tags.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 右: サイドバー情報 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* 基本情報 */}
          <section
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: "0.6875rem",
                letterSpacing: "0.15em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              基本情報
            </h3>
            <dl style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <dt style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                  危険度
                </dt>
                <dd>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: badge.color,
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    Lv.{toxin.dangerLevel} / 5 — {badge.label}
                  </span>
                </dd>
              </div>
              {toxin.category && (
                <div>
                  <dt style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                    カテゴリ
                  </dt>
                  <dd>
                    <Link
                      to="/categories/$slug"
                      params={{ slug: toxin.category.slug }}
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--poison-green)",
                        textDecoration: "none",
                      }}
                    >
                      {toxin.category.nameJa}
                    </Link>
                  </dd>
                </div>
              )}
              {toxin.ld50 && (
                <div>
                  <dt style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                    致死量（LD₅₀）
                  </dt>
                  <dd
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-primary)",
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    {toxin.ld50}
                  </dd>
                </div>
              )}
              {toxin.producingOrganism && (
                <div>
                  <dt style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                    産生生物
                  </dt>
                  <dd style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{toxin.producingOrganism}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* 警告 */}
          <section
            style={{
              background: "rgba(224,58,58,0.06)",
              border: "1px solid rgba(224,58,58,0.2)",
              borderRadius: "12px",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                fontSize: "0.6875rem",
                fontFamily: "'Space Mono',monospace",
                color: "#e03a3a",
                marginBottom: "0.5rem",
                letterSpacing: "0.1em",
              }}
            >
              ⚠ WARNING
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              本サイトの情報は教育目的のみです。危険物質の不正使用・製造は法律で厳しく禁じられています。
            </p>
          </section>
        </div>
      </div>

      {/* 戻るボタン */}
      <div style={{ marginTop: "3rem" }}>
        <Link to="/toxins" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--poison-green)",
              fontFamily: "'Space Mono',monospace",
            }}
          >
            ← 毒図鑑に戻る
          </span>
        </Link>
      </div>
    </div>
  );
}
