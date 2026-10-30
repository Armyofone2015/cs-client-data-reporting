import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { AdminUserManager } from "@/components/AdminUserManager";
import { getAdminPanelCredentials } from "@/lib/pi-admin";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login?next=/admin");
  }

  const [users, activities] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.activityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const adminPanelConfigured = !!getAdminPanelCredentials();

  return (
    <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            Admin workspace
          </p>
          <h1 style={{ margin: "0.25rem 0" }}>Users & activity</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Invite-only client access. Engagement data comes from the admin panel
            via <code>ADMIN_EMAIL</code> / <code>ADMIN_PASS</code>.
          </p>
          <p
            style={{
              margin: "0.75rem 0 0",
              color: adminPanelConfigured ? "#047857" : "#b91c1c",
              fontWeight: 600,
            }}
          >
            {adminPanelConfigured
              ? "Admin panel credentials detected."
              : "Admin panel credentials missing — add ADMIN_EMAIL and ADMIN_PASS in Vercel."}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              border: "1px solid var(--border)",
              background: "white",
              borderRadius: 10,
              padding: "0.6rem 0.9rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Sign out
          </button>
        </form>
      </div>

      <AdminUserManager
        users={users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          piGroupId: user.piGroupId,
          piGroupName: user.piGroupName,
          lastSignInAt: user.lastSignInAt?.toISOString() ?? null,
          isActive: user.isActive,
        }))}
      />

      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem",
          marginTop: "1.25rem",
        }}
      >
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>User activity</h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {activities.map((item) => (
            <li
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "0.75rem",
                padding: "0.85rem 0",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div>
                <strong>{item.email || "System"}</strong>
                <div style={{ color: "var(--muted)", marginTop: 2 }}>
                  {item.action}
                  {item.detail ? ` — ${item.detail}` : ""}
                </div>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>
                {item.createdAt.toLocaleString()}
              </span>
            </li>
          ))}
          {activities.length === 0 ? (
            <li style={{ color: "var(--muted)" }}>No activity yet.</li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
