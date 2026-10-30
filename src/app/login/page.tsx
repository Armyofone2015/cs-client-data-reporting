import Link from "next/link";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <form
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "2rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            Invite-only access
          </p>
          <h1 style={{ margin: "0.35rem 0 0", fontSize: "1.5rem" }}>Sign in</h1>
        </div>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Email</span>
          <input
            type="email"
            name="email"
            placeholder="client@company.com"
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "0.75rem",
              fontSize: 15,
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Password</span>
          <input
            type="password"
            name="password"
            placeholder="Password set by admin"
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "0.75rem",
              fontSize: 15,
            }}
          />
        </label>
        <button
          type="button"
          style={{
            background: "var(--accent)",
            color: "white",
            border: 0,
            borderRadius: 10,
            padding: "0.8rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Continue
        </button>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
          Auth wiring comes next. For now use{" "}
          <Link href="/portal" style={{ color: "var(--accent)" }}>
            client preview
          </Link>{" "}
          or{" "}
          <Link href="/admin" style={{ color: "var(--accent)" }}>
            admin preview
          </Link>
          .
        </p>
      </form>
    </main>
  );
}
