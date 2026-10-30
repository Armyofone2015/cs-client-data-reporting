/**
 * Positive Intelligence admin panel API client.
 * Env: ADMIN_EMAIL + ADMIN_PASS (same as the client metrics dashboard).
 */

export const PI_API = "https://api.positiveintelligence.com/v2.4";
const PI_ADMIN_ORIGIN = "https://admin.positiveintelligence.com";
const TOKEN_CACHE_TTL_MS = 10 * 60 * 1000;
const PI_AUTH_TIMEOUT_MS = 15_000;

let cachedToken: { token: string; expiresAt: number } | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  const message = String(error ?? "").trim();
  return message || fallback;
}

export function getAdminPanelCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASS?.trim();
  if (!email || !password) return null;
  return { email, password };
}

export function normalizeReportRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter(isRecord);
  }
  if (!isRecord(data)) return [];
  const candidates = data.data ?? data.rows ?? data.results;
  return Array.isArray(candidates) ? candidates.filter(isRecord) : [];
}

export function getPiApiHeaders(token: string) {
  return {
    "X-Access-Token": token,
    Accept: "application/json, text/plain, */*",
    Referer: `${PI_ADMIN_ORIGIN}/`,
    Origin: PI_ADMIN_ORIGIN,
  };
}

async function requestPiAdminToken(email: string, pass: string): Promise<string> {
  const response = await fetch(`${PI_API}/auth/tokens`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login: email,
      password: pass,
      scope: "admin",
    }),
    signal: AbortSignal.timeout(PI_AUTH_TIMEOUT_MS),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`PI auth API failed (${response.status}): ${responseBody}`);
  }

  let payload: { token?: unknown } | null = null;
  try {
    const parsed = responseBody ? JSON.parse(responseBody) : null;
    payload = isRecord(parsed) ? parsed : null;
  } catch {
    throw new Error("PI auth API returned invalid JSON");
  }

  const token = typeof payload?.token === "string" ? payload.token.trim() : "";
  if (!token) throw new Error("PI auth API returned no token");
  return token;
}

export async function getPiAdminToken(
  email: string,
  pass: string,
  options?: { forceRefresh?: boolean }
): Promise<string> {
  const forceRefresh = options?.forceRefresh ?? false;
  const now = Date.now();

  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  const token = await requestPiAdminToken(email, pass);
  cachedToken = {
    token,
    expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
  };
  return token;
}

export async function withPiAdminToken<T>(
  run: (token: string) => Promise<T>
): Promise<T> {
  const creds = getAdminPanelCredentials();
  if (!creds) {
    throw new Error(
      "Admin panel credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASS in Vercel env vars."
    );
  }

  let token = await getPiAdminToken(creds.email, creds.password);
  try {
    return await run(token);
  } catch (error) {
    const message = getErrorMessage(error, "");
    if (!message.includes("401")) throw error;
    token = await getPiAdminToken(creds.email, creds.password, {
      forceRefresh: true,
    });
    return run(token);
  }
}
