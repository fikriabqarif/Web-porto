"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function setMessageRead(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = text(formData, "id");
  if (!id) return;

  const read = text(formData, "read") === "true";
  await prisma.message.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessage(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = text(formData, "id");
  if (!id) return;

  await prisma.message.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
