import { prisma } from "@/lib/db";

export async function logActivity(input: {
  userId?: string | null;
  email?: string | null;
  action: string;
  detail?: string | null;
}) {
  try {
    await prisma.activityEvent.create({
      data: {
        userId: input.userId || null,
        email: input.email?.trim().toLowerCase() || null,
        action: input.action,
        detail: input.detail || null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity", error);
  }
}
