import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

const DANGER_BADGE: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "低危険", color: "#39e06a", bg: "rgba(57,224,106,0.1)" },
  2: { label: "中危険", color: "#c8e03a", bg: "rgba(200,224,58,0.1)" },
  3: { label: "高危険", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  4: { label: "猛毒", color: "#e03a3a", bg: "rgba(224,58,58,0.1)" },
  5: { label: "超猛毒", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

function DangerDots({ level }: { level: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "3px", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: static dots
          key={i}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: i < level ? "var(--crimson)" : "rgba(224,58,58,0.2)",
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
}

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { orpc } = useRouteContext({ from: "__root__" });
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"toxin" | "article">("toxin");

  const { data: bookmarks, isLoading } = useQuery(
    orpc.bookmarks.list.queryOptions({ input: { type: "all" } }),
  );

  const removeMutation = useMutation({
    mutationFn: (bookmarkId: number) =>
      orpc.bookmarks.remove.call({ bookmarkId }),
    onSuccess: () => {
      queryClient.invalidateQueries(orpc.bookmarks.list.queryOptions({ input: { type: "all" } }));
    },
  });

  const user = session.data?.user;
  const toxinBookmarks = bookmarks?.toxins ?? [];
  const articleBookmarks = bookmarks?.articles ?? [];
  const currentList = tab === "toxin" ? toxinBookmarks : articleBookmarks;

  const avatarLetter = user?.name ? user.name[0]?.toUpperCase() : "?";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* ユーザー情報 */}
      <div
        className="dashboard-user-card"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "var(--poison-glow)",
            border: "2px solid var(--poison-green)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontFamily: "'Space Mono',monospace",
            color: "var(--poison-green)",
            flexShrink: 0,
          }}
        >
          {avatarLetter}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              color: "var(--poison-green)",
              marginBottom: "0.25rem",
            }}
          >
            ◆ MY PAGE
          </div>
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {user?.name ?? "ゲスト"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", margin: "0.25rem 0 0" }}>
            {user?.email}
          </p>
        </div>
        <div className="dashboard-user-stats" style={{ textAlign: "center" }}>
          <div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--poison-green)",
              }}
            >
              {toxinBookmarks.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>毒物</div>
          </div>
          <div
            style={{
              width: "1px",
              background: "var(--border)",
              alignSelf: "stretch",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--acid-yellow)",
              }}
            >
              {articleBookmarks.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>記事</div>
          </div>
        </div>
      </div>

      {/* ブックマークセクション */}
      <div>
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            color: "var(--poison-green)",
            marginBottom: "0.5rem",
          }}
        >
          ◆ BOOKMARKS
        </div>
        <h2
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
          }}
        >
          ブックマーク
        </h2>

        {/* タブ */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "1px solid var(--border)",
            marginBottom: "1.5rem",
          }}
        >
          {(["toxin", "article"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "0.625rem 1.25rem",
                background: "none",
                border: "none",
                borderBottom: tab === t ? "2px solid var(--poison-green)" : "2px solid transparent",
                color: tab === t ? "var(--poison-green)" : "var(--text-secondary)",
                fontFamily: "'Space Mono',monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                cursor: "pointer",
                transition: "color 0.2s",
                marginBottom: "-1px",
              }}
            >
              {t === "toxin" ? `毒物 (${toxinBookmarks.length})` : `記事 (${articleBookmarks.length})`}
            </button>
          ))}
        </div>

        {/* カードリスト */}
        {isLoading ? (
          <div style={{ color: "var(--text-secondary)", padding: "3rem", textAlign: "center" }}>
            読み込み中...
          </div>
        ) : currentList.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              color: "var(--text-secondary)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📌</div>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>まだブックマークがありません</p>
            <Link
              to={tab === "toxin" ? "/toxins" : "/articles"}
              style={{
                display: "inline-block",
                marginTop: "1rem",
                color: "var(--poison-green)",
                fontSize: "0.8125rem",
                textDecoration: "none",
              }}
            >
              {tab === "toxin" ? "毒図鑑を見る →" : "記事一覧を見る →"}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {tab === "toxin"
              ? toxinBookmarks.map((item) => {
                  const badge = DANGER_BADGE[item.dangerLevel] ?? DANGER_BADGE[1];
                  return (
                    <div
                      key={item.bookmarkId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 1.25rem",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          "var(--border-strong)";
                        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          background: badge.bg,
                          border: `1px solid ${badge.color}33`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.25rem",
                          flexShrink: 0,
                        }}
                      >
                        ☠
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          to="/toxins/$slug"
                          params={{ slug: item.slug }}
                          style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: "0.8125rem",
                            color: "var(--text-primary)",
                            textDecoration: "none",
                          }}
                        >
                          {item.nameEn}
                        </Link>
                        <div
                          style={{
                            fontFamily: "'Noto Sans JP', sans-serif",
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {item.nameJa}
                        </div>
                      </div>
                      <div className="dashboard-toxin-meta">
                        <DangerDots level={item.dangerLevel} />
                        <span
                          className="dashboard-toxin-badge"
                          style={{
                            fontSize: "0.625rem",
                            fontFamily: "'Space Mono',monospace",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            border: `1px solid ${badge.color}33`,
                            background: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMutation.mutate(item.bookmarkId)}
                          disabled={removeMutation.isPending}
                          title="ブックマーク解除"
                          style={{
                            background: "none",
                            border: "1px solid rgba(224,58,58,0.3)",
                            borderRadius: "6px",
                            color: "rgba(224,58,58,0.7)",
                            cursor: "pointer",
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.75rem",
                            transition: "all 0.2s",
                            opacity: removeMutation.isPending ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "rgba(224,58,58,0.1)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor =
                              "rgba(224,58,58,0.6)";
                            (e.currentTarget as HTMLButtonElement).style.color = "#e03a3a";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "none";
                            (e.currentTarget as HTMLButtonElement).style.borderColor =
                              "rgba(224,58,58,0.3)";
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "rgba(224,58,58,0.7)";
                          }}
                        >
                          🗑 解除
                        </button>
                      </div>
                    </div>
                  );
                })
              : articleBookmarks.map((item) => (
                  <div
                    key={item.bookmarkId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 1.25rem",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)";
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "8px",
                        background: "rgba(57,224,106,0.08)",
                        border: "1px solid rgba(57,224,106,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                        flexShrink: 0,
                      }}
                    >
                      {item.emoji ?? "📄"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to="/articles/$slug"
                        params={{ slug: item.slug }}
                        style={{
                          fontFamily: "'Noto Serif JP', serif",
                          fontSize: "0.875rem",
                          color: "var(--text-primary)",
                          textDecoration: "none",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </Link>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.125rem" }}>
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString("ja-JP")
                          : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(item.bookmarkId)}
                      disabled={removeMutation.isPending}
                      title="ブックマーク解除"
                      style={{
                        background: "none",
                        border: "1px solid rgba(224,58,58,0.3)",
                        borderRadius: "6px",
                        color: "rgba(224,58,58,0.7)",
                        cursor: "pointer",
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.75rem",
                        transition: "all 0.2s",
                        flexShrink: 0,
                        opacity: removeMutation.isPending ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(224,58,58,0.1)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          "rgba(224,58,58,0.6)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#e03a3a";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "none";
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          "rgba(224,58,58,0.3)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(224,58,58,0.7)";
                      }}
                    >
                      🗑 解除
                    </button>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
