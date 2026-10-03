import { ImageResponse } from "next/og";

export const alt = "Clinora AI — Walk into every appointment better prepared.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social preview, rendered at build/request time. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 72,
          background: "linear-gradient(160deg, #eef5ff 0%, #f8fbff 60%, #e6fbff 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: "linear-gradient(135deg, #2563EB, #06B6D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 40,
                fontWeight: 700,
              }}
            >
              +
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#0F172A" }}>
              Clinora <span style={{ color: "#2563EB", marginLeft: 10 }}>AI</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, fontWeight: 800, color: "#0F172A", lineHeight: 1.05, letterSpacing: -2 }}>
              Walk into every appointment
            </div>
            <div
              style={{
                fontSize: 68,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: -2,
                backgroundImage: "linear-gradient(90deg, #1D4ED8, #06B6D4)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              better prepared.
            </div>
            <div style={{ marginTop: 24, fontSize: 26, color: "#64748B", lineHeight: 1.4 }}>
              Turn symptoms, notes and questions into a clear one-page visit brief.
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 20, color: "#334155" }}>
            {["Private by design", "Human-first", "English / Arabic"].map((label) => (
              <div
                key={label}
                style={{ display: "flex", padding: "10px 18px", borderRadius: 999, background: "white", border: "1px solid #E2E8F0" }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 380,
              padding: 28,
              borderRadius: 32,
              background: "white",
              border: "1px solid #E2E8F0",
              boxShadow: "0 30px 70px -30px rgba(30,64,175,0.45)",
              transform: "rotate(-3deg)",
            }}
          >
            <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Visit brief</div>
            <div style={{ display: "flex", marginTop: 6, fontSize: 16, color: "#64748B" }}>Primary care · Thu 09:30</div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1.5 }}>
              REASON FOR VISIT
            </div>
            <div style={{ display: "flex", marginTop: 6, fontSize: 19, fontWeight: 600, color: "#0F172A" }}>
              Recurring headaches, 3 weeks
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: 1.5 }}>
              QUESTIONS TO ASK
            </div>
            {["Could screen time be a factor?", "Is ibuprofen this often safe?", "When should I seek urgent care?"].map(
              (q, i) => (
                <div key={q} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 16, color: "#334155" }}>
                  <div
                    style={{
                      display: "flex",
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      border: "1.5px solid #93C5FD",
                      color: "#2563EB",
                      fontSize: 13,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </div>
                  {q}
                </div>
              ),
            )}
            <div
              style={{
                display: "flex",
                marginTop: 22,
                padding: "10px 14px",
                borderRadius: 14,
                background: "#ECFDF8",
                fontSize: 14,
                color: "#0F766E",
              }}
            >
              AI organized — review before sharing
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
