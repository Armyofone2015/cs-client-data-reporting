import Link from "next/link";
import { CLIENT_REPORTS } from "@/lib/reports";

export function PortalShell({
  activeSlug,
  children,
}: {
  activeSlug: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
      }}
    >
      <aside
        style={{
          background: "#0f172a",
          color: "white",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 12 }}>Client portal</p>
          <h1 style={{ margin: "0.25rem 0 0", fontSize: "1.15rem" }}>
            Activity reports
          </h1>
        </div>
        <nav style={{ display: "grid", gap: 6 }}>
          {CLIENT_REPORTS.map((report) => {
            const active = report.slug === activeSlug;
            return (
              <Link
                key={report.slug}
                href={`/portal/${report.slug}`}
                style={{
                  padding: "0.75rem 0.85rem",
                  borderRadius: 10,
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {report.title}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <Link href="/" style={{ opacity: 0.75, fontSize: 14 }}>
            Back to home
          </Link>
        </div>
      </aside>
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}
