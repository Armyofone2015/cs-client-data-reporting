/** Comma-separated emails allowed to use the portal admin UI. */
export function getPortalAdminEmails() {
  return (process.env.PORTAL_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPortalAdminEmail(email: string) {
  return getPortalAdminEmails().includes(email.trim().toLowerCase());
}
