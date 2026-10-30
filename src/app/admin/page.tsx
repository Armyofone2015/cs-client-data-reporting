import Link from "next/link";

const sampleUsers = [
  {
    name: "Acme Health",
    email: "reports@acme.example",
    role: "Client",
    lastSignIn: "Oct 28, 2026",
  },
  {
    name: "Northwind Wellness",
    email: "ops@northwind.example",
    role: "Client",
    lastSignIn: "Oct 29, 2026",
  },
  {
    name: "Internal Admin",
    email: "admin@company.example",
    role: "Admin",
    lastSignIn: "Oct 30, 2026",
  },
];

const sampleActivity = [
  {
    user: "reports@acme.example",
    action: "Viewed Participant progress",
    when: "2 hours ago",
  },
  {
    user: "ops@northwind.example",
    action: "Signed in",
    when: "Yesterday",
  },
  {
    user: "admin@company.example",
    action: "Reset password for Acme Health",
    when: "Yesterday",
  },
];

export default function AdminPage() {
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
            Invite-only access control, password management, and portal usage.
          </p>
        </div>
        <Link href="/" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Home
        </Link>
      </div>

      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Users</h2>
          <button
            type="button"
            style={{
              background: "var(--accent)",
              color: "white",
              border: 0,
              borderRadius: 10,
              padding: "0.6rem 0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add user
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 13 }}>
              <th style={{ padding: "0.6rem 0" }}>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last sign-in</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.map((user) => (
              <tr key={user.email} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.85rem 0" }}>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.lastSignIn}</td>
                <td>
                  <button
                    type="button"
                    style={{
                      marginRight: 8,
                      border: "1px solid var(--border)",
                      background: "white",
                      borderRadius: 8,
                      padding: "0.35rem 0.6rem",
                      cursor: "pointer",
                    }}
                  >
                    Set password
                  </button>
                  <button
                    type="button"
                    style={{
                      border: "1px solid #fecaca",
                      background: "#fff5f5",
                      color: "#b91c1c",
                      borderRadius: 8,
                      padding: "0.35rem 0.6rem",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem",
        }}
      >
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>User activity</h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {sampleActivity.map((item) => (
            <li
              key={`${item.user}-${item.when}-${item.action}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "0.75rem",
                padding: "0.85rem 0",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div>
                <strong>{item.user}</strong>
                <div style={{ color: "var(--muted)", marginTop: 2 }}>
                  {item.action}
                </div>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>{item.when}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
