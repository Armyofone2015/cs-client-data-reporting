import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      if (
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth")
      ) {
        return true;
      }

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/login?next=/admin", request.nextUrl));
        }
        if (role !== "admin") {
          return Response.redirect(new URL("/portal", request.nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/portal")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/login?next=/portal", request.nextUrl));
        }
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role ?? "client";
        token.piGroupId = user.piGroupId ?? null;
        token.piGroupName = user.piGroupName ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        if (token.email) session.user.email = String(token.email);
        if (token.name) session.user.name = String(token.name);
        session.user.role = token.role === "admin" ? "admin" : "client";
        session.user.piGroupId =
          typeof token.piGroupId === "string" ? token.piGroupId : null;
        session.user.piGroupName =
          typeof token.piGroupName === "string" ? token.piGroupName : null;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
