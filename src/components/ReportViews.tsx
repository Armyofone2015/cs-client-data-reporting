import type { EngagementSnapshot } from "@/lib/pi-reports";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "1rem 1.1rem",
      }}
    >
      <div style={{ color: "var(--muted)", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "1.25rem",
      }}
    >
      <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>{title}</h2>
      {children}
    </section>
  );
}

export function OverviewReport({ data }: { data: EngagementSnapshot }) {
  const maxLevel = Math.max(...data.levelCounts, 1);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.85rem",
        }}
      >
        <Stat label="Participants" value={String(data.participantCount)} />
        <Stat
          label="Avg muscle points"
          value={data.averageMuscle !== null ? data.averageMuscle.toFixed(1) : "—"}
        />
        <Stat label="Weeks tracked" value={String(data.weekly.length)} />
      </div>

      <Panel title="Sage level distribution">
        <div style={{ display: "grid", gap: 10 }}>
          {data.levelCounts.map((count, level) => (
            <div key={level} style={{ display: "grid", gridTemplateColumns: "70px 1fr 40px", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Level {level}</span>
              <div style={{ background: "#eef3f9", borderRadius: 999, height: 10, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(count / maxLevel) * 100}%`,
                    background: "var(--accent)",
                    height: "100%",
                  }}
                />
              </div>
              <strong style={{ fontSize: 13 }}>{count}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ParticipantsReport({ data }: { data: EngagementSnapshot }) {
  return (
    <Panel title="Participant progress">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 13 }}>
              <th style={{ padding: "0.55rem 0" }}>Participant</th>
              <th>Status</th>
              <th>Sage level</th>
              <th>Muscle points</th>
            </tr>
          </thead>
          <tbody>
            {data.participants.map((participant) => (
              <tr
                key={`${participant.email}-${participant.name}`}
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <td style={{ padding: "0.75rem 0" }}>
                  <strong>{participant.name}</strong>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    {participant.email || "—"}
                  </div>
                </td>
                <td>{participant.status}</td>
                <td>{participant.sageLevel ?? "—"}</td>
                <td>
                  {participant.totalMuscle !== null
                    ? participant.totalMuscle.toFixed(1)
                    : "—"}
                </td>
              </tr>
            ))}
            {data.participants.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "1rem 0", color: "var(--muted)" }}>
                  No participants found for this engagement.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function EngagementReport({ data }: { data: EngagementSnapshot }) {
  const maxMuscle = Math.max(...data.weekly.map((point) => point.totalMuscle), 1);

  return (
    <Panel title="Engagement trends">
      {data.weekly.length === 0 ? (
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Weekly trend data is not available for this engagement yet.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data.weekly.map((point) => (
            <div
              key={point.weekIndex}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 120px",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                Week {point.weekIndex}
              </span>
              <div style={{ background: "#eef3f9", borderRadius: 999, height: 12, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(point.totalMuscle / maxMuscle) * 100}%`,
                    background: "var(--accent)",
                    height: "100%",
                  }}
                />
              </div>
              <span style={{ fontSize: 13 }}>
                {point.totalMuscle.toFixed(1)} avg · {point.participantCount} ppl
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function MilestonesReport({ data }: { data: EngagementSnapshot }) {
  const level3Plus = data.levelCounts.slice(3).reduce((sum, n) => sum + n, 0);
  const top = data.participants.slice(0, 5);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.85rem",
        }}
      >
        <Stat label="At Level 3+" value={String(level3Plus)} />
        <Stat label="At Level 5" value={String(data.levelCounts[5] ?? 0)} />
        <Stat label="Active participants" value={String(data.participantCount)} />
      </div>
      <Panel title="Top progress markers">
        <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: 8 }}>
          {top.map((participant) => (
            <li key={`${participant.email}-milestone`}>
              <strong>{participant.name}</strong> — {participant.status}
              {participant.totalMuscle !== null
                ? ` · ${participant.totalMuscle.toFixed(1)} muscle points`
                : ""}
            </li>
          ))}
          {top.length === 0 ? (
            <li style={{ color: "var(--muted)" }}>No milestone data yet.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}
