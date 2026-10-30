import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.role === "admin") redirect("/admin");
  if (session?.user) redirect("/portal");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>
          CS Client Data Reporting
        </p>
        <h1 style={{ margin: "0.5rem 0 0.75rem", fontSize: "1.75rem" }}>
          Client activity portal
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
          Invite-only access for clients to review participant engagement from the
          admin panel, with an admin workspace to manage users and monitor usage.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <Link
            href="/login"
            style={{
              background: "var(--accent)",
              color: "white",
              padding: "0.7rem 1rem",
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
