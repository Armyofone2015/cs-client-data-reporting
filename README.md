# CS Client Data Reporting

Invite-only portal for clients to review participant activity from the app, plus an admin workspace to manage users, passwords, and portal usage.

## What's in this starter

- `/` landing page
- `/login` invite-only sign-in shell
- `/admin` user management + activity preview
- `/portal/[report]` client report layout with left-pane navigation

Auth, live admin data sync, and real charts are next.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the repository in Vercel.
3. Use the default Next.js settings and deploy.
4. After the first successful deploy, make the GitHub repo private if desired.
