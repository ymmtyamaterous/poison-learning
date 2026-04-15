import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/articles/$slug")({
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { slug } = Route.useParams();
  const { orpc } = useRouteContext({ from: "__root__" });

  const { data: article, isLoading, isError } = useQuery(orpc.articles.get.queryOptions({ input: { slug } }));

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

  if (isError || !article) {
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
        <div style={{ fontSize: "4rem" }}>📝</div>
        <p style={{ color: "var(--text-muted)" }}>記事が見つかりませんでした</p>
        <Link to="/articles" style={{ textDecoration: "none", color: "var(--poison-green)", fontSize: "0.875rem" }}>
          ← コラム一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
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
        <Link to="/articles" style={{ textDecoration: "none", color: "var(--text-muted)" }}>コラム</Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{article.title}</span>
      </div>

      {/* ヘッダー */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "2.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.6875rem",
            letterSpacing: "0.2em",
            color: "var(--poison-green)",
            marginBottom: "1rem",
          }}
        >
          ◆ COLUMN
        </div>
        <h1
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.4,
            marginBottom: "1.25rem",
          }}
        >
          {article.title}
        </h1>
        {article.excerpt && (
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              borderLeft: "3px solid var(--poison-green)",
              paddingLeft: "1rem",
            }}
          >
            {article.excerpt}
          </p>
        )}

        {/* タグ */}
        {article.tags && article.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.25rem" }}>
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                style={{
                  padding: "0.2rem 0.625rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "999px",
                  fontSize: "0.6875rem",
                  color: "var(--text-muted)",
                  fontFamily: "'Space Mono',monospace",
                }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 本文 */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "2.5rem",
          marginBottom: "2rem",
        }}
      >
        {article.content ? (
          <div
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
              lineHeight: 2,
              whiteSpace: "pre-wrap",
            }}
          >
            {article.content}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>本文はまだありません</p>
        )}
      </div>

      <div>
        <Link to="/articles" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--poison-green)", fontFamily: "'Space Mono',monospace" }}>
            ← コラム一覧に戻る
          </span>
        </Link>
      </div>
    </div>
  );
}
