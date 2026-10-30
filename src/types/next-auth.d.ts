import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "admin" | "client";
      piGroupId?: string | null;
      piGroupName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "admin" | "client";
    piGroupId?: string | null;
    piGroupName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "client";
    piGroupId?: string | null;
    piGroupName?: string | null;
  }
}
