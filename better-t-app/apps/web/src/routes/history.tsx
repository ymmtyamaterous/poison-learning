import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { orpc } = useRouteContext({ from: "__root__" });

  const { data: historyList } = useQuery(orpc.history.list.queryOptions({ input: {} }));

  // 年代でグループ化
  type HistoryEvent = NonNullable<typeof historyList>[number];
  const grouped: Record<string, HistoryEvent[]> = {};
  if (historyList) {
    for (const event of historyList) {
      const century = Math.floor(event.yearSort / 100);
      const era = `${century}世紀`;
      if (!grouped[era]) grouped[era] = [];
      grouped[era]?.push(event);
    }
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 1.5rem" }}>
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
          ◆ HISTORY OF POISON ◆
        </div>
        <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "2.5rem", fontWeight: 700 }}>
          歴史年表
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
          古代から現代まで、毒物に関わる重要な歴史的事件・発見を年表でたどります。
        </p>
      </div>

      {/* タイムライン */}
      <div style={{ position: "relative", paddingLeft: "2rem" }}>
        {/* 縦線 */}
        <div
          style={{
            position: "absolute",
            left: "8px",
            top: 0,
            bottom: 0,
            width: "2px",
            background: "linear-gradient(to bottom, var(--poison-green), transparent)",
          }}
        />

        {historyList?.map((event, idx) => (
          <div
            key={event.id}
            style={{
              position: "relative",
              marginBottom: "2.5rem",
              paddingLeft: "1.5rem",
            }}
          >
            {/* ドット */}
            <div
              style={{
                position: "absolute",
                left: "-1.75rem",
                top: "0.375rem",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: idx % 2 === 0 ? "var(--poison-green)" : "var(--bg-card)",
                border: "2px solid var(--poison-green)",
                boxShadow: idx % 2 === 0 ? "0 0 8px rgba(57,224,106,0.5)" : "none",
              }}
            />

            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.5rem",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--poison-green)",
                  marginBottom: "0.5rem",
                }}
              >
                {event.year}年
              </div>
              <h3
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                {event.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
