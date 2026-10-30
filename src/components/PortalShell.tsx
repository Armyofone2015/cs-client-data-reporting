import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { CLIENT_REPORTS } from "@/lib/reports";

export function PortalShell({
  activeSlug,
  groupName,
  children,
}: {
  activeSlug: string;
  groupName?: string | null;
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
          {groupName ? (
            <p style={{ margin: "0.5rem 0 0", opacity: 0.75, fontSize: 13 }}>
              {groupName}
            </p>
          ) : null}
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
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: 0,
                color: "rgba(255,255,255,0.75)",
                cursor: "pointer",
                padding: 0,
                fontSize: 14,
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}
