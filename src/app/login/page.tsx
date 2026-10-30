import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/portal";

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
        action={loginAction}
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
        <input type="hidden" name="next" value={next} />
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="client@company.com"
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Password</span>
          <input
            type="password"
            name="password"
            required
            placeholder="Password set by admin"
            style={inputStyle}
          />
        </label>
        {params.error ? (
          <p style={{ margin: 0, color: "#b91c1c", fontSize: 14 }}>
            Incorrect email or password.
          </p>
        ) : null}
        <button
          type="submit"
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
          Portal admins use emails listed in <code>PORTAL_ADMIN_EMAILS</code>.{" "}
          <Link href="/" style={{ color: "var(--accent)" }}>
            Home
          </Link>
        </p>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "0.75rem",
  fontSize: 15,
};
