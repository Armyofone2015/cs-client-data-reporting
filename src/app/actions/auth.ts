"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { isPortalAdminEmail } from "@/lib/portal-admins";

function isNextRedirect(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "").trim();

  const fallback = isPortalAdminEmail(email)
    ? "/admin"
    : "/portal";
  const redirectTo =
    next.startsWith("/admin") || next.startsWith("/portal") ? next : fallback;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    if (error instanceof AuthError) {
      redirect(`/login?error=invalid&next=${encodeURIComponent(redirectTo)}`);
    }
    redirect(`/login?error=invalid&next=${encodeURIComponent(redirectTo)}`);
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
