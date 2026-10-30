import { notFound } from "next/navigation";
import { PortalShell } from "@/components/PortalShell";
import { getReport } from "@/lib/reports";

export default async function PortalReportPage({
  params,
}: {
  params: Promise<{ report: string }>;
}) {
  const { report: reportSlug } = await params;
  const report = getReport(reportSlug);

  if (!report) {
    notFound();
  }

  return (
    <PortalShell activeSlug={report.slug}>
      <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
        Client report
      </p>
      <h1 style={{ margin: "0.35rem 0 0.75rem" }}>{report.title}</h1>
      <p style={{ color: "var(--muted)", maxWidth: 640 }}>{report.description}</p>
      <div
        style={{
          marginTop: "1.5rem",
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "2rem",
          minHeight: 320,
          display: "grid",
          placeItems: "center",
          color: "var(--muted)",
        }}
      >
        Chart and supporting table for {report.title.toLowerCase()} will render
        here once admin activity data is connected.
      </div>
    </PortalShell>
  );
}
