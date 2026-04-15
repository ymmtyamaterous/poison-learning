import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
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

function Home() {
  const { orpc } = useRouteContext({ from: "__root__" });

  const { data: stats } = useQuery(orpc.stats.get.queryOptions());
  const { data: spotlightList } = useQuery(orpc.toxins.spotlight.queryOptions());
  const { data: latestArticles } = useQuery(orpc.articles.latest.queryOptions({ input: { limit: 6 } }));
  const { data: historyList } = useQuery(orpc.history.list.queryOptions({ input: {} }));
  const { data: rankingData } = useQuery(orpc.toxins.ranking.queryOptions({ input: { limit: 5 } }));
  const { data: categoriesData } = useQuery(orpc.categories.list.queryOptions());

  const CATEGORY_ICONS: Record<string, string> = {
    植物毒: "🌿",
    動物毒: "🐍",
    菌類毒: "🍄",
    化学合成毒: "⚗️",
  };

  return (
    <main style={{ flex: 1 }}>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "6rem 1.5rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(57,224,106,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            border: "1px solid rgba(57,224,106,0.1)",
            top: "10%",
            right: "10%",
            pointerEvents: "none",
          }}
          className="animate-spin-slow"
        />
        <div
          style={{
            position: "absolute",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            border: "1px solid rgba(57,224,106,0.06)",
            top: "15%",
            right: "13%",
            pointerEvents: "none",
          }}
          className="animate-spin-slow-rev"
        />

        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "2rem" }} className="animate-float">
            <span
              style={{
                fontSize: "5rem",
                filter: "drop-shadow(0 0 40px rgba(57,224,106,0.4))",
                display: "block",
                lineHeight: 1,
              }}
            >
              ☠
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.4em",
              color: "var(--poison-green)",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            ◆ The Science of Deadly Substances ◆
          </div>
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(3rem, 8vw, 5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, var(--poison-green), var(--acid-yellow))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              毒学
            </span>
          </h1>
          <p
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "clamp(0.75rem, 2vw, 1rem)",
              letterSpacing: "0.25em",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
            }}
          >
            poison learning
          </p>
          <p
            style={{
              maxWidth: "560px",
              margin: "0 auto 3rem",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              fontSize: "0.9375rem",
            }}
          >
            毒物・危険物質を科学的・歴史的観点から学べる総合知識プラットフォーム。
            <br />
            植物毒から化学合成毒まで、深い知識への扉を開く。
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/toxins" style={{ textDecoration: "none" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.875rem 2rem",
                  background: "var(--poison-green)",
                  color: "#000",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                }}
              >
                毒図鑑を見る →
              </span>
            </Link>
            <Link to="/categories" style={{ textDecoration: "none" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.875rem 2rem",
                  background: "transparent",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                }}
              >
                カテゴリを見る
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats バー */}
      {stats && (
        <section
          style={{
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            padding: "2rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              textAlign: "center",
            }}
          >
            {[
              { label: "収録毒物", value: stats.toxinCount, unit: "種" },
              { label: "カテゴリ", value: stats.categoryCount, unit: "分類" },
              { label: "コラム記事", value: stats.historyArticleCount, unit: "本" },
              { label: "科学系毒物", value: stats.chemistryCount, unit: "種" },
            ].map(({ label, value, unit }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    fontWeight: 700,
                    color: "var(--poison-green)",
                  }}
                >
                  {value}
                  <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginLeft: "0.25rem" }}>
                    {unit}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* カテゴリ */}
      {categoriesData && categoriesData.length > 0 && (
        <section style={{ padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.3em",
                  color: "var(--poison-green)",
                  marginBottom: "0.75rem",
                }}
              >
                ◆ CATEGORIES ◆
              </div>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 700,
                }}
              >
                毒の分類
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {categoriesData.map((cat) => (
                <Link key={cat.id} to="/categories/$slug" params={{ slug: cat.slug }} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "2rem 1.5rem",
                      textAlign: "center",
                      transition: "all 0.3s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--border-strong)";
                      el.style.background = "var(--bg-card-hover)";
                      el.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--border)";
                      el.style.background = "var(--bg-card)";
                      el.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                      {CATEGORY_ICONS[cat.nameJa] ?? "🧪"}
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {cat.nameJa}
                    </h3>
                    {cat.description && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          lineHeight: 1.6,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* スポットライト */}
      {spotlightList && spotlightList.length > 0 && (
        <section
          style={{
            padding: "5rem 1.5rem",
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.3em",
                  color: "var(--poison-green)",
                  marginBottom: "0.75rem",
                }}
              >
                ◆ SPOTLIGHT ◆
              </div>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 700,
                }}
              >
                注目の毒物
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {spotlightList.map((toxin) => (
                <Link key={toxin.id} to="/toxins/$slug" params={{ slug: toxin.slug }} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "1.75rem",
                      transition: "all 0.3s",
                      height: "100%",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--border-strong)";
                      el.style.transform = "translateY(-4px)";
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
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Noto Serif JP', serif",
                            fontSize: "1.25rem",
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
                              fontSize: "0.6875rem",
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
                        fontSize: "0.875rem",
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
          </div>
        </section>
      )}

      {/* ランキング + 歴史 */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
          }}
        >
          {/* ランキング */}
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.3em",
                  color: "var(--poison-green)",
                  marginBottom: "0.5rem",
                }}
              >
                ◆ RANKING ◆
              </div>
              <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.5rem", fontWeight: 700 }}>
                毒性ランキング
              </h2>
            </div>
            {rankingData?.items?.map((toxin, idx) => (
              <Link key={toxin.id} to="/toxins/$slug" params={{ slug: toxin.slug }} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "0.5rem",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: idx < 3 ? "var(--poison-green)" : "var(--text-muted)",
                      width: "2rem",
                      textAlign: "center",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                      {toxin.nameJa}
                    </div>
                    {toxin.nameEn && (
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-muted)",
                          fontFamily: "'Space Mono',monospace",
                        }}
                      >
                        {toxin.nameEn}
                      </div>
                    )}
                  </div>
                  <DangerBadge level={toxin.dangerLevel} />
                </div>
              </Link>
            ))}
            <div style={{ marginTop: "1rem" }}>
              <Link to="/ranking" style={{ textDecoration: "none" }}>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--poison-green)",
                    fontFamily: "'Space Mono',monospace",
                  }}
                >
                  全ランキングを見る →
                </span>
              </Link>
            </div>
          </div>

          {/* 歴史 */}
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.3em",
                  color: "var(--poison-green)",
                  marginBottom: "0.5rem",
                }}
              >
                ◆ HISTORY ◆
              </div>
              <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.5rem", fontWeight: 700 }}>
                歴史事件
              </h2>
            </div>
            <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
              <div
                style={{
                  position: "absolute",
                  left: "6px",
                  top: 0,
                  bottom: 0,
                  width: "1px",
                  background: "var(--border)",
                }}
              />
              {historyList?.slice(0, 5).map((event) => (
                <div key={event.id} style={{ position: "relative", marginBottom: "1.5rem" }}>
                  <div
                    className="animate-pulse-dot"
                    style={{
                      position: "absolute",
                      left: "-1.25rem",
                      top: "0.25rem",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--poison-green)",
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: "0.6875rem",
                      color: "var(--poison-green)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {event.year}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: "0.9375rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {event.title}
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
            <Link to="/history" style={{ textDecoration: "none" }}>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--poison-green)",
                  fontFamily: "'Space Mono',monospace",
                }}
              >
                年表を見る →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 最新記事 */}
      {latestArticles && latestArticles.length > 0 && (
        <section
          style={{
            padding: "5rem 1.5rem",
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "2.5rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.3em",
                    color: "var(--poison-green)",
                    marginBottom: "0.5rem",
                  }}
                >
                  ◆ LATEST ARTICLES ◆
                </div>
                <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.5rem", fontWeight: 700 }}>
                  最新コラム
                </h2>
              </div>
              <Link to="/articles" style={{ textDecoration: "none" }}>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--poison-green)",
                    fontFamily: "'Space Mono',monospace",
                  }}
                >
                  全記事を見る →
                </span>
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {latestArticles.map((article) => (
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
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--border-strong)";
                      el.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--border)";
                      el.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: "0.6875rem",
                        letterSpacing: "0.1em",
                        color: "var(--poison-green)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      COLUMN
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "1.0625rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        lineHeight: 1.5,
                        marginBottom: "0.75rem",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {article.title}
                    </h3>
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
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA バナー */}
      <section
        style={{
          padding: "5rem 1.5rem",
          textAlign: "center",
          background: "linear-gradient(180deg, var(--bg-base) 0%, rgba(57,224,106,0.04) 50%, var(--bg-base) 100%)",
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>⚗️</div>
          <h2
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            深い知識への扉を開く
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: 1.8,
              marginBottom: "2rem",
              fontSize: "0.9375rem",
            }}
          >
            毒学の世界は広大です。科学的なメカニズムから歴史的な事件まで、
            あなたの好奇心を満たす知識がここにあります。
          </p>
          <Link to="/toxins" style={{ textDecoration: "none" }}>
            <span
              style={{
                display: "inline-block",
                padding: "1rem 2.5rem",
                background: "var(--poison-green)",
                color: "#000",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              毒図鑑を探索する ☠
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
