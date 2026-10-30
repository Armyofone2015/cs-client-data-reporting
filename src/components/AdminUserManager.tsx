"use client";

import { useState, useTransition } from "react";
import {
  createClientUserAction,
  removeClientUserAction,
  searchGroupsAction,
  setClientPasswordAction,
} from "@/app/actions/admin";

type ClientUser = {
  id: string;
  email: string;
  name: string | null;
  piGroupId: string | null;
  piGroupName: string | null;
  lastSignInAt: string | null;
  isActive: boolean;
};

type GroupOption = { id: string; name: string };

export function AdminUserManager({ users }: { users: ClientUser[] }) {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function searchGroups() {
    startTransition(async () => {
      setError(null);
      const result = await searchGroupsAction(query);
      if (!result.ok) {
        setError(result.error);
        setGroups([]);
        return;
      }
      setGroups(result.groups);
      if (!result.groups.length) {
        setError("No admin panel groups matched that search.");
      }
    });
  }

  function createUser(formData: FormData) {
    if (selectedGroup) {
      formData.set("piGroupId", selectedGroup.id);
      formData.set("piGroupName", selectedGroup.name);
    }
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await createClientUserAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Client user saved.");
      setSelectedGroup(null);
      setGroups([]);
      setQuery("");
    });
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem",
        }}
      >
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>Add / update client</h2>
        <form action={createUser} style={{ display: "grid", gap: "0.85rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Name</span>
              <input name="name" placeholder="Acme Health" style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Email</span>
              <input
                name="email"
                type="email"
                required
                placeholder="reports@client.com"
                style={inputStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Password</span>
              <input
                name="password"
                type="text"
                required
                minLength={8}
                placeholder="Set their password"
                style={inputStyle}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
            <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 220 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                Admin panel engagement group
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search group name"
                style={inputStyle}
              />
            </label>
            <button type="button" onClick={searchGroups} disabled={pending} style={secondaryButton}>
              Search
            </button>
          </div>

          {selectedGroup ? (
            <p style={{ margin: 0, color: "var(--accent)", fontWeight: 600 }}>
              Selected: {selectedGroup.name}
            </p>
          ) : null}

          {groups.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
              {groups.map((group) => (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    style={{
                      ...secondaryButton,
                      width: "100%",
                      textAlign: "left",
                      background:
                        selectedGroup?.id === group.id
                          ? "var(--accent-soft)"
                          : "white",
                    }}
                  >
                    {group.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <button type="submit" disabled={pending} style={primaryButton}>
            Save client user
          </button>
        </form>
        {error ? (
          <p style={{ color: "#b91c1c", marginBottom: 0 }}>{error}</p>
        ) : null}
        {message ? (
          <p style={{ color: "#047857", marginBottom: 0 }}>{message}</p>
        ) : null}
      </section>

      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem",
        }}
      >
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>Users</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 13 }}>
                <th style={{ padding: "0.6rem 0" }}>Client</th>
                <th>Engagement</th>
                <th>Last sign-in</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.85rem 0" }}>
                    <strong>{user.name || user.email}</strong>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>{user.email}</div>
                    {!user.isActive ? (
                      <div style={{ color: "#b91c1c", fontSize: 12 }}>Inactive</div>
                    ) : null}
                  </td>
                  <td>{user.piGroupName || user.piGroupId || "—"}</td>
                  <td>
                    {user.lastSignInAt
                      ? new Date(user.lastSignInAt).toLocaleString()
                      : "Never"}
                  </td>
                  <td>
                    <form
                      action={(formData) => {
                        startTransition(async () => {
                          const result = await setClientPasswordAction(formData);
                          setError(result.ok ? null : result.error);
                          setMessage(result.ok ? `Password updated for ${user.email}` : null);
                        });
                      }}
                      style={{ display: "flex", gap: 6 }}
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        name="password"
                        type="text"
                        minLength={8}
                        required
                        placeholder="New password"
                        style={{ ...inputStyle, minWidth: 140 }}
                      />
                      <button type="submit" style={secondaryButton}>
                        Set
                      </button>
                    </form>
                  </td>
                  <td>
                    <form
                      action={(formData) => {
                        startTransition(async () => {
                          const result = await removeClientUserAction(formData);
                          setError(result.ok ? null : result.error);
                          setMessage(result.ok ? `Removed ${user.email}` : null);
                        });
                      }}
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" style={dangerButton}>
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "1rem 0", color: "var(--muted)" }}>
                    No client users yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "0.7rem 0.75rem",
  fontSize: 14,
};

const primaryButton: React.CSSProperties = {
  background: "var(--accent)",
  color: "white",
  border: 0,
  borderRadius: 10,
  padding: "0.7rem 1rem",
  fontWeight: 600,
  cursor: "pointer",
  justifySelf: "start",
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "white",
  borderRadius: 10,
  padding: "0.65rem 0.85rem",
  cursor: "pointer",
  fontWeight: 600,
};

const dangerButton: React.CSSProperties = {
  border: "1px solid #fecaca",
  background: "#fff5f5",
  color: "#b91c1c",
  borderRadius: 8,
  padding: "0.45rem 0.7rem",
  cursor: "pointer",
};
