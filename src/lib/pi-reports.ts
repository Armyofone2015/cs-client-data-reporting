import {
  getPiApiHeaders,
  normalizeReportRows,
  PI_API,
  withPiAdminToken,
} from "@/lib/pi-admin";

const REPORT_TIMEOUT_MS = 180_000;
const WEEKLY_TIMEOUT_MS = 30_000;

export type WeeklyPoint = {
  weekIndex: number;
  weekEndDay: string;
  totalMuscle: number;
  participantCount: number;
};

export type ParticipantSummary = {
  name: string;
  email: string;
  sageLevel: number | null;
  totalMuscle: number | null;
  status: string;
};

export type EngagementSnapshot = {
  groupId: string;
  participantCount: number;
  averageMuscle: number | null;
  levelCounts: number[];
  participants: ParticipantSummary[];
  weekly: WeeklyPoint[];
  fetchedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function flattenRow(
  row: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const nextKey = prefix ? `${prefix}_${key}` : key;
    if (isRecord(value)) {
      Object.assign(flat, flattenRow(value, nextKey));
    } else {
      flat[nextKey] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
  }
  return flat;
}

function getValue(
  row: Record<string, unknown>,
  aliases: string[],
  matcher?: (normalized: string) => boolean
): string {
  const normalizedAliases = aliases.map(normalizeKey);
  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.includes(normalizeKey(key))) {
      return String(value ?? "").trim();
    }
  }
  if (matcher) {
    for (const [key, value] of Object.entries(row)) {
      if (matcher(normalizeKey(key))) {
        return String(value ?? "").trim();
      }
    }
  }
  return "";
}

function parseNumber(value: string): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function isFriendsAndFamily(row: Record<string, unknown>): boolean {
  const value = getValue(
    row,
    ["F&F", "ff", "friends_and_family", "family_and_friends", "team_member"],
    (key) =>
      key === "ff" ||
      key.includes("friendsandfamily") ||
      key.includes("familyandfriends") ||
      key.includes("teammember")
  );
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return (
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "y" ||
    normalized === "1" ||
    normalized.startsWith("yes")
  );
}

function isArchived(row: Record<string, unknown>): boolean {
  const email = getValue(
    row,
    ["Login", "login", "Email", "email"],
    (key) => key.includes("email") || key.includes("login")
  );
  return email.toLowerCase().includes("archived");
}

function extractSageLevel(row: Record<string, unknown>): number | null {
  const levelJson = getValue(row, ["level_data_level"], (key) =>
    key.endsWith("leveldatalevel")
  );
  if (levelJson) {
    try {
      const parsed = JSON.parse(levelJson) as { index?: unknown };
      if (typeof parsed?.index === "number" && Number.isFinite(parsed.index)) {
        return Math.min(Math.max(Math.floor(parsed.index), 0), 5);
      }
    } catch {
      // fall through
    }
  }

  const levelRaw = getValue(
    row,
    ["level_data_current_level", "current_level", "sage_level"],
    (key) =>
      key.includes("currentlevel") ||
      key.includes("sagelevel") ||
      key.includes("musclelevel")
  );
  const level = parseNumber(levelRaw);
  if (level === null) return null;
  return Math.min(Math.max(Math.floor(level), 0), 5);
}

function summarizeParticipants(rows: Record<string, unknown>[]): {
  participants: ParticipantSummary[];
  averageMuscle: number | null;
  levelCounts: number[];
} {
  const participants: ParticipantSummary[] = [];
  const levelCounts = [0, 0, 0, 0, 0, 0];
  let muscleTotal = 0;
  let muscleCount = 0;

  for (const raw of rows) {
    const row = flattenRow(raw);
    if (isArchived(raw) || isFriendsAndFamily(raw)) continue;

    const email = getValue(
      row,
      ["Login", "login", "Email", "email"],
      (key) => key.includes("email") || key.includes("login")
    );
    const name =
      getValue(
        row,
        ["name", "full_name", "participant_name", "first_name"],
        (key) => key === "name" || key.includes("fullname")
      ) || email || "Participant";
    const muscle = parseNumber(
      getValue(
        row,
        ["total_muscle", "muscle_total", "average_total_muscle", "muscle_points"],
        (key) => key.includes("totalmuscle") || key.includes("muscle")
      )
    );
    const sageLevel = extractSageLevel(row);

    if (muscle !== null) {
      muscleTotal += muscle;
      muscleCount += 1;
    }
    if (sageLevel !== null) {
      levelCounts[sageLevel] += 1;
    }

    participants.push({
      name,
      email,
      sageLevel,
      totalMuscle: muscle,
      status: sageLevel !== null ? `Level ${sageLevel}` : "In progress",
    });
  }

  participants.sort((a, b) => (b.totalMuscle ?? 0) - (a.totalMuscle ?? 0));

  return {
    participants,
    averageMuscle: muscleCount ? muscleTotal / muscleCount : null,
    levelCounts,
  };
}

function aggregateWeekly(rows: Record<string, unknown>[]): WeeklyPoint[] {
  const buckets = new Map<
    number,
    { totalMuscle: number; count: number; weekEndDay: string }
  >();

  for (const raw of rows) {
    const row = flattenRow(raw);
    if (isArchived(raw) || isFriendsAndFamily(raw)) continue;

    const weekRaw = getValue(
      row,
      ["week_index", "week", "week_number", "program_week"],
      (key) =>
        key === "week" ||
        key.includes("weekindex") ||
        key.includes("weeknumber") ||
        key.includes("programweek")
    );
    const weekIndex = parseNumber(weekRaw);
    if (weekIndex === null) continue;

    const muscle = parseNumber(
      getValue(
        row,
        ["total_muscle", "muscle_total", "average_total_muscle", "muscle_points"],
        (key) => key.includes("totalmuscle") || key.includes("muscle")
      )
    );
    if (muscle === null) continue;

    const weekEndDay = getValue(
      row,
      ["week_end_day", "week_ending", "end_date"],
      (key) => key.includes("weekend") || key.includes("enddate")
    );

    const existing = buckets.get(weekIndex) ?? {
      totalMuscle: 0,
      count: 0,
      weekEndDay: weekEndDay || "",
    };
    existing.totalMuscle += muscle;
    existing.count += 1;
    if (weekEndDay) existing.weekEndDay = weekEndDay;
    buckets.set(weekIndex, existing);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([weekIndex, bucket]) => ({
      weekIndex,
      weekEndDay: bucket.weekEndDay,
      totalMuscle: bucket.count ? bucket.totalMuscle / bucket.count : 0,
      participantCount: bucket.count,
    }));
}

async function fetchSageStats(token: string, groupId: string) {
  const response = await fetch(
    `${PI_API}/admin/reports/sage_stats?group=${encodeURIComponent(groupId)}`,
    {
      headers: getPiApiHeaders(token),
      signal: AbortSignal.timeout(REPORT_TIMEOUT_MS),
    }
  );
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Sage stats API failed (${response.status}): ${body.slice(0, 300)}`);
  }

  try {
    return normalizeReportRows(JSON.parse(body));
  } catch {
    throw new Error("Sage stats API returned a non-JSON payload");
  }
}

async function fetchWeeklyRows(token: string, groupId: string) {
  const response = await fetch(
    `${PI_API}/admin/reports/sage_weekly_report?group=${encodeURIComponent(groupId)}`,
    {
      headers: getPiApiHeaders(token),
      signal: AbortSignal.timeout(WEEKLY_TIMEOUT_MS),
    }
  );
  if (!response.ok) {
    return [] as Record<string, unknown>[];
  }
  const data = await response.json();
  return normalizeReportRows(data);
}

export async function searchAdminPanelGroups(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return withPiAdminToken(async (token) => {
    const response = await fetch(
      `${PI_API}/admin/groups?query=${encodeURIComponent(trimmed)}&fields=title%20_id`,
      { headers: getPiApiHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Group search failed (${response.status})`);
    }
    const groups = normalizeReportRows(await response.json());
    return groups
      .map((group) => ({
        id:
          typeof group._id === "string"
            ? group._id
            : typeof group.id === "string"
              ? group.id
              : "",
        name:
          typeof group.title === "string"
            ? group.title
            : typeof group.name === "string"
              ? group.name
              : "Unknown",
      }))
      .filter((group) => group.id);
  });
}

export async function fetchEngagementSnapshot(
  groupId: string
): Promise<EngagementSnapshot> {
  return withPiAdminToken(async (token) => {
    const [statsRows, weeklyRows] = await Promise.all([
      fetchSageStats(token, groupId),
      fetchWeeklyRows(token, groupId),
    ]);

    const summary = summarizeParticipants(statsRows);
    const weekly = aggregateWeekly(weeklyRows);

    return {
      groupId,
      participantCount: summary.participants.length,
      averageMuscle: summary.averageMuscle,
      levelCounts: summary.levelCounts,
      participants: summary.participants,
      weekly,
      fetchedAt: new Date().toISOString(),
    };
  });
}
