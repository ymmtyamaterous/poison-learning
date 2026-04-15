import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

const DANGER_BADGE: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "低危険", color: "#39e06a", bg: "rgba(57,224,106,0.1)" },
  2: { label: "中危険", color: "#c8e03a", bg: "rgba(200,224,58,0.1)" },
  3: { label: "高危険", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  4: { label: "猛毒", color: "#e03a3a", bg: "rgba(224,58,58,0.1)" },
  5: { label: "超猛毒", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

function SearchPage() {
  const { orpc } = useRouteContext({ from: "__root__" });
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data: results, isFetching } = useQuery({
    ...orpc.search.query.queryOptions({ input: { q: submitted } }),
    enabled: submitted.length >= 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSubmitted(query.trim());
  };

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
          ◆ SEARCH ◆
        </div>
        <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "2.5rem", fontWeight: 700 }}>
          検索
        </h1>
      </div>

      {/* 検索フォーム */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "2.5rem" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="毒物名・成分名・症状などを入力..."
            style={{
              width: "100%",
              padding: "1rem 4rem 1rem 1.25rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontSize: "1rem",
              outline: "none",
              fontFamily: "'Noto Sans JP', sans-serif",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--poison-green)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-strong)";
            }}
          />
          <button
            type="submit"
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--poison-green)",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            検索
          </button>
        </div>
      </form>

      {/* 結果 */}
      {isFetching && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.875rem",
          }}
        >
          検索中...
        </div>
      )}

      {!isFetching && submitted && results && (
        <>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
            }}
          >
            「{submitted}」の検索結果 — {(results.toxins?.length ?? 0) + (results.articles?.length ?? 0)}件
          </div>

          {/* 毒物 */}
          {results.toxins && results.toxins.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                毒図鑑
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {results.toxins.map((toxin) => {
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
                          padding: "1.25rem",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = "var(--border-strong)";
                          el.style.background = "var(--bg-card-hover)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = "var(--border)";
                          el.style.background = "var(--bg-card)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                          <h3
                            style={{
                              fontFamily: "'Noto Serif JP', serif",
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                            }}
                          >
                            {toxin.nameJa}
                          </h3>
                          {toxin.nameEn && (
                            <span
                              style={{
                                fontFamily: "'Space Mono',monospace",
                                fontSize: "0.625rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {toxin.nameEn}
                            </span>
                          )}
                          <span
                            style={{
                              padding: "0.15rem 0.5rem",
                              borderRadius: "4px",
                              border: `1px solid ${badge.color}33`,
                              background: badge.bg,
                              color: badge.color,
                              fontSize: "0.625rem",
                              fontFamily: "'Space Mono',monospace",
                              marginLeft: "auto",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Lv.{toxin.dangerLevel} {badge.label}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {toxin.excerpt}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 記事 */}
          {results.articles && results.articles.length > 0 && (
            <section>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                コラム
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {results.articles.map((article) => (
                  <Link
                    key={article.id}
                    to="/articles/$slug"
                    params={{ slug: article.slug }}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        padding: "1.25rem",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "var(--border-strong)";
                        el.style.background = "var(--bg-card-hover)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "var(--border)";
                        el.style.background = "var(--bg-card)";
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Space Mono',monospace",
                          fontSize: "0.5625rem",
                          color: "var(--poison-green)",
                          marginBottom: "0.375rem",
                          letterSpacing: "0.1em",
                        }}
                      >
                        COLUMN
                      </div>
                      <h3
                        style={{
                          fontFamily: "'Noto Serif JP', serif",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(results.toxins?.length ?? 0) + (results.articles?.length ?? 0) === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "4rem",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <p>「{submitted}」に一致する結果が見つかりませんでした</p>
            </div>
          )}
        </>
      )}

      {!submitted && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <p style={{ fontSize: "0.9375rem" }}>キーワードを入力して検索してください</p>
          <p style={{ fontSize: "0.8125rem", marginTop: "0.5rem" }}>例: アコニチン、フグ毒、青酸</p>
        </div>
      )}
    </div>
  );
}
