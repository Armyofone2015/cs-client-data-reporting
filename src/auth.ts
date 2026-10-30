import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { timingSafeEqual } from "crypto";
import { authConfig } from "@/auth.config";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { isPortalAdminEmail } from "@/lib/portal-admins";

function passwordsMatch(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function authenticatePortalAdmin(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const adminPassword = process.env.PORTAL_ADMIN_PASSWORD ?? "";

  if (!normalized.includes("@")) {
    throw new Error("Enter a valid email address");
  }
  if (!adminPassword) {
    throw new Error("PORTAL_ADMIN_PASSWORD is not configured");
  }
  if (!isPortalAdminEmail(normalized)) {
    throw new Error("That email is not authorized for admin access");
  }
  if (!passwordsMatch(password, adminPassword)) {
    throw new Error("Incorrect email or password");
  }

  return {
    id: `admin:${normalized}`,
    email: normalized,
    name: "Portal Admin",
    role: "admin" as const,
    piGroupId: null,
    piGroupName: null,
  };
}

async function authenticateClient(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    throw new Error("Enter a valid email address");
  }

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user?.passwordHash || !user.isActive || user.role !== "CLIENT") {
    throw new Error("Incorrect email or password");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new Error("Incorrect email or password");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastSignInAt: new Date() },
  });

  await logActivity({
    userId: user.id,
    email: user.email,
    action: "Signed in",
    detail: "Client portal",
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: "client" as const,
    piGroupId: user.piGroupId,
    piGroupName: user.piGroupName,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (
          !email ||
          !password ||
          typeof email !== "string" ||
          typeof password !== "string"
        ) {
          return null;
        }

        try {
          if (isPortalAdminEmail(email)) {
            return await authenticatePortalAdmin(email, password);
          }
          return await authenticateClient(email, password);
        } catch {
          return null;
        }
      },
    }),
  ],
});
