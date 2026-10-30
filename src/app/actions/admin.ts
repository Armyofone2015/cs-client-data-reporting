"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { searchAdminPanelGroups } from "@/lib/pi-reports";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function searchGroupsAction(query: string) {
  const session = await requireAdmin();
  if (!session) {
    return { ok: false as const, error: "Unauthorized", groups: [] as const };
  }

  try {
    const groups = await searchAdminPanelGroups(query);
    return { ok: true as const, groups };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Search failed",
      groups: [] as const,
    };
  }
}

export async function createClientUserAction(formData: FormData) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Unauthorized" };

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const piGroupId = String(formData.get("piGroupId") || "").trim();
  const piGroupName = String(formData.get("piGroupName") || "").trim();

  if (!email.includes("@")) {
    return { ok: false as const, error: "Enter a valid client email" };
  }
  if (password.trim().length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters" };
  }
  if (!piGroupId) {
    return {
      ok: false as const,
      error: "Search and select an admin panel engagement group",
    };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: name || null,
        passwordHash,
        role: "CLIENT",
        piGroupId,
        piGroupName: piGroupName || null,
        isActive: true,
      },
      update: {
        name: name || null,
        passwordHash,
        piGroupId,
        piGroupName: piGroupName || null,
        isActive: true,
        role: "CLIENT",
      },
    });

    await logActivity({
      userId: null,
      email: session.user.email,
      action: "Created or updated client user",
      detail: `${user.email} → ${piGroupName || piGroupId}`,
    });

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to save user",
    };
  }
}

export async function setClientPasswordAction(formData: FormData) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Unauthorized" };

  const userId = String(formData.get("userId") || "").trim();
  const password = String(formData.get("password") || "");

  if (!userId) return { ok: false as const, error: "Missing user" };
  if (password.trim().length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters" };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await logActivity({
      email: session.user.email,
      action: "Set client password",
      detail: user.email,
    });

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to set password",
    };
  }
}

export async function removeClientUserAction(formData: FormData) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Unauthorized" };

  const userId = String(formData.get("userId") || "").trim();
  if (!userId) return { ok: false as const, error: "Missing user" };

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false, passwordHash: null },
    });

    await logActivity({
      email: session.user.email,
      action: "Removed client user",
      detail: user.email,
    });

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to remove user",
    };
  }
}
