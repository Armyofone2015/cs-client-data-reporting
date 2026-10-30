import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import { PortalShell } from "@/components/PortalShell";
import {
  EngagementReport,
  MilestonesReport,
  OverviewReport,
  ParticipantsReport,
} from "@/components/ReportViews";
import { getAdminPanelCredentials } from "@/lib/pi-admin";
import { fetchEngagementSnapshot } from "@/lib/pi-reports";
import { getReport } from "@/lib/reports";

export default async function PortalReportPage({
  params,
}: {
  params: Promise<{ report: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?next=/portal");
  }

  const { report: reportSlug } = await params;
  const report = getReport(reportSlug);
  if (!report) notFound();

  const groupId = session.user.piGroupId;
  const groupName = session.user.piGroupName;

  await logActivity({
    userId: session.user.role === "client" ? session.user.id : null,
    email: session.user.email,
    action: `Viewed ${report.title}`,
    detail: groupName || groupId || undefined,
  });

  let content: React.ReactNode;

  if (session.user.role === "admin") {
    content = (
      <Notice>
        You are signed in as a portal admin. Client reports appear after you create a
        client user and sign in with that account.
      </Notice>
    );
  } else if (!groupId) {
    content = (
      <Notice>
        This account is not linked to an admin panel engagement group yet. Ask an
        admin to attach one.
      </Notice>
    );
  } else if (!getAdminPanelCredentials()) {
    content = (
      <Notice>
        Admin panel credentials are missing. Add <code>ADMIN_EMAIL</code> and{" "}
        <code>ADMIN_PASS</code> in Vercel environment variables.
      </Notice>
    );
  } else {
    try {
      const data = await fetchEngagementSnapshot(groupId);
      content =
        report.slug === "overview" ? (
          <OverviewReport data={data} />
        ) : report.slug === "participants" ? (
          <ParticipantsReport data={data} />
        ) : report.slug === "engagement" ? (
          <EngagementReport data={data} />
        ) : (
          <MilestonesReport data={data} />
        );
    } catch (error) {
      content = (
        <Notice>
          Could not load engagement data from the admin panel:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Notice>
      );
    }
  }

  return (
    <PortalShell activeSlug={report.slug} groupName={groupName}>
      <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
        Client report
      </p>
      <h1 style={{ margin: "0.35rem 0 0.75rem" }}>{report.title}</h1>
      <p style={{ color: "var(--muted)", maxWidth: 640, marginTop: 0 }}>
        {report.description}
      </p>
      {content}
    </PortalShell>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: "1rem",
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "1.5rem",
        color: "var(--muted)",
      }}
    >
      {children}
    </div>
  );
}
