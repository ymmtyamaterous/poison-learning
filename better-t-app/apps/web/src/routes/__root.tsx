import type { AppRouterClient } from "@better-t-app/api/routers/index";
import { Toaster } from "@better-t-app/ui/components/sonner";
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Link, Outlet, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { link, orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "毒学 ~poison learning~",
      },
      {
        name: "description",
        content: "毒学は、毒物・危険物質を科学的・歴史的観点から学べる総合知識プラットフォームです。",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function Navbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/toxins" as const, label: "毒図鑑" },
    { to: "/categories" as const, label: "カテゴリ" },
    { to: "/chemistry" as const, label: "化学" },
    { to: "/articles" as const, label: "コラム" },
    { to: "/history" as const, label: "歴史" },
    { to: "/ranking" as const, label: "ランキング" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
        background: "rgba(8,11,16,0.85)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* ロゴ */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>☠</span>
          <div style={{ lineHeight: 1.2 }}>
            <span
              style={{
                display: "block",
                fontFamily: "'Noto Serif JP', serif",
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "var(--poison-green)",
                letterSpacing: "0.05em",
              }}
            >
              毒学
            </span>
            <span
              style={{
                display: "block",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.625rem",
                color: "var(--text-secondary)",
                letterSpacing: "0.1em",
              }}
            >
              poison learning
            </span>
          </div>
        </Link>

        {/* デスクトップ ナビリンク */}
        <div className="nav-desktop-links">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{ textDecoration: "none" }}
              activeProps={{
                style: { color: "var(--poison-green)" },
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "var(--poison-green)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* 右側: 検索 + 認証 + ハンバーガー */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* 検索（デスクトップ） */}
          <Link to="/search" style={{ textDecoration: "none" }} className="nav-desktop-search">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.375rem 1rem",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>🔍</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "'Space Mono',monospace" }}>
                検索...
              </span>
            </div>
          </Link>

          {/* 認証ボタン（デスクトップ） */}
          <div className="nav-desktop-search">
            {session ? (
              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  router.navigate({ to: "/" });
                }}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "8px",
                  padding: "0.375rem 1rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                ログアウト
              </button>
            ) : (
              <Link to="/login" style={{ textDecoration: "none" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 1rem",
                    background: "var(--poison-green)",
                    color: "#000",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}
                >
                  ログイン
                </span>
              </Link>
            )}
          </div>

          {/* ハンバーガーボタン（モバイル） */}
          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="メニューを開く"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className={`nav-mobile-menu${mobileMenuOpen ? " open" : ""}`}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              textDecoration: "none",
              padding: "0.875rem 0",
              borderBottom: "1px solid var(--border)",
              display: "block",
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
            }}
            activeProps={{
              style: {
                textDecoration: "none",
                padding: "0.875rem 0",
                borderBottom: "1px solid var(--border)",
                display: "block",
                fontSize: "0.9375rem",
                color: "var(--poison-green)",
              },
            }}
          >
            {label}
          </Link>
        ))}
        <Link
          to="/search"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            textDecoration: "none",
            padding: "0.875rem 0",
            borderBottom: "1px solid var(--border)",
            display: "block",
            fontSize: "0.9375rem",
            color: "var(--text-secondary)",
          }}
        >
          🔍 検索
        </Link>
        <div style={{ paddingTop: "1rem" }}>
          {session ? (
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                setMobileMenuOpen(false);
                router.navigate({ to: "/" });
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid var(--border-strong)",
                borderRadius: "8px",
                padding: "0.625rem 1rem",
                color: "var(--text-secondary)",
                fontSize: "0.9375rem",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              ログアウト
            </button>
          ) : (
            <Link to="/login" style={{ textDecoration: "none" }} onClick={() => setMobileMenuOpen(false)}>
              <span
                style={{
                  display: "block",
                  padding: "0.625rem 1rem",
                  background: "var(--poison-green)",
                  color: "#000",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ログイン
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
        padding: "4rem 1.5rem 2rem",
        marginTop: "auto",
      }}
    >
      <div
        className="responsive-footer-grid"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {/* ブランド */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.5rem" }}>☠</span>
            <div>
              <div
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontWeight: 700,
                  color: "var(--poison-green)",
                  fontSize: "1.125rem",
                }}
              >
                毒学
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.625rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                }}
              >
                poison learning
              </div>
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            毒物・危険物質を科学的・歴史的観点から学べる総合知識プラットフォーム
          </p>
        </div>

        {/* カテゴリ */}
        <div>
          <h4
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.15em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Categories
          </h4>
          {["植物毒", "動物毒", "菌類毒", "化学合成毒"].map((cat) => (
            <div key={cat} style={{ marginBottom: "0.5rem" }}>
              <Link
                to="/categories"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--poison-green)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {cat}
              </Link>
            </div>
          ))}
        </div>

        {/* コンテンツ */}
        <div>
          <h4
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.15em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Content
          </h4>
          {[
            { to: "/toxins" as const, label: "毒図鑑" },
            { to: "/articles" as const, label: "コラム" },
            { to: "/chemistry" as const, label: "化学構造一覧" },
            { to: "/history" as const, label: "歴史年表" },
            { to: "/ranking" as const, label: "ランキング" },
          ].map(({ to, label }) => (
            <div key={to} style={{ marginBottom: "0.5rem" }}>
              <Link
                to={to}
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)", textDecoration: "none" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--poison-green)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {label}
              </Link>
            </div>
          ))}
        </div>

        {/* 情報 */}
        <div>
          <h4
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.15em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            About
          </h4>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            本サイトの情報は教育目的のみに提供されています。
            危険物質の不正使用は法律で厳しく禁じられています。
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.7, marginTop: "0.75rem" }}>
            🤖 本サイトのコンテンツは生成AIにより作成されています。情報の正確性については保証できません。
          </p>
        </div>
      </div>

      <div
        className="responsive-footer-bottom"
        style={{
          maxWidth: "1280px",
          margin: "3rem auto 0",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace" }}>
          © 2025 毒学. Educational purposes only.
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-muted)",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
            }}
          >
            🤖 AI生成コンテンツ
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-muted)",
              background: "rgba(224,58,58,0.1)",
              border: "1px solid rgba(224,58,58,0.2)",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
            }}
          >
            ⚠ 教育目的のみ
          </span>
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const [client] = useState<AppRouterClient>(() => createORPCClient(link));
  const [_orpcUtils] = useState(() => createTanstackQueryUtils(client));

  return (
    <>
      <HeadContent />
      <Navbar />
      <div style={{ paddingTop: "64px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Outlet />
        <Footer />
      </div>
      <Toaster richColors />
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
