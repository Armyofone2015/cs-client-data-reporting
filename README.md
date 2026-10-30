# CS Client Data Reporting

Invite-only portal for clients to review participant engagement from the Positive Intelligence **admin panel**, plus an admin workspace to manage users, passwords, and portal usage.

## Features

- `/login` — invite-only client and portal-admin sign-in
- `/admin` — add/remove client users, set passwords, link each user to an admin panel engagement group, view activity
- `/portal` — left-pane reports: overview, participants, engagement trends, milestones

## Environment variables

Add these in Vercel (Project → Settings → Environment Variables):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string for users + activity |
| `AUTH_SECRET` | Auth.js session secret |
| `AUTH_URL` | Public app URL (e.g. `https://your-app.vercel.app`) |
| `PORTAL_ADMIN_EMAILS` | Comma-separated emails allowed into `/admin` |
| `PORTAL_ADMIN_PASSWORD` | Shared password for portal admins |
| `ADMIN_EMAIL` | Admin panel login email (PI) |
| `ADMIN_PASS` | Admin panel login password (PI) |

`ADMIN_EMAIL` / `ADMIN_PASS` are the same admin panel credentials used by the client metrics dashboard.

After setting `DATABASE_URL`, run once (locally or via Vercel build):

```bash
npx prisma db push
```

## Local development

```bash
cp .env.example .env.local
npm install
npx prisma db push
npm run dev
```

## Deploy notes

1. Set all env vars in Vercel.
2. Redeploy.
3. Sign in at `/login` with a `PORTAL_ADMIN_EMAILS` address + `PORTAL_ADMIN_PASSWORD`.
4. Add a client user, search/select their admin panel group, set a password.
5. Client signs in and sees engagement reports for that group.
