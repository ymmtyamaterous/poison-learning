import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/articles/")({
  component: ArticlesPage,
});

function ArticlesPage() {
  const { orpc } = useRouteContext({ from: "__root__" });

  const { data: articles } = useQuery(orpc.articles.list.queryOptions({ input: { limit: 50 } }));

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
          ◆ COLUMNS & ARTICLES ◆
        </div>
        <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "2.5rem", fontWeight: 700 }}>
          コラム
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
          毒物に関する深い知識を、科学的・歴史的観点から解説するコラムです。
        </p>
      </div>

      {/* 記事グリッド */}
      {articles && articles.items.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {articles.items.map((article) => (
            <Link
              key={article.id}
              to="/articles/$slug"
              params={{ slug: article.slug }}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1.75rem",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border-strong)";
                  el.style.transform = "translateY(-4px)";
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
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "0.625rem",
                    letterSpacing: "0.15em",
                    color: "var(--poison-green)",
                    marginBottom: "0.75rem",
                  }}
                >
                  COLUMN
                </div>
                <h2
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1.5,
                    marginBottom: "0.875rem",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                      flex: 1,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {article.excerpt}
                  </p>
                )}
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--poison-green)",
                      fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    続きを読む →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "5rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
          <p>記事はまだありません</p>
        </div>
      )}
    </div>
  );
}
