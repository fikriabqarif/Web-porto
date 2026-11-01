"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-guard";
import type { FormState } from "@/lib/form-state";
import { setSetting } from "@/lib/settings";
import { storeFile, UploadError } from "@/lib/upload";
import { flattenFieldErrors, settingsSchema } from "@/lib/validation";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function revalidateSite(): void {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
}

export async function saveSettings(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { status: "error", message: "Your session has expired. Please log in again." };

  const parsed = settingsSchema.safeParse({
    contactEmail: text(formData, "contactEmail"),
    github: text(formData, "github"),
    linkedin: text(formData, "linkedin"),
    instagram: text(formData, "instagram"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: flattenFieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  await setSetting("contactEmail", data.contactEmail);
  await setSetting(
    "socials",
    JSON.stringify({ github: data.github, linkedin: data.linkedin, instagram: data.instagram }),
  );

  revalidateSite();
  return { status: "success", message: "Settings saved." };
}

export async function uploadCv(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { status: "error", message: "Your session has expired. Please log in again." };

  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a PDF file first.", errors: { cv: "Choose a PDF file first." } };
  }
  if (file.type !== "application/pdf") {
    return { status: "error", message: "The CV must be a PDF.", errors: { cv: "The CV must be a PDF." } };
  }

  try {
    const url = await storeFile(file, "cv");
    await setSetting("cvUrl", url);
    revalidateSite();
    return { status: "success", message: "CV uploaded." };
  } catch (error) {
    if (error instanceof UploadError) return { status: "error", message: error.message, errors: { cv: error.message } };
    return { status: "error", message: "Upload failed. Please try again.", errors: { cv: "Upload failed." } };
  }
}

export async function removeCv(): Promise<void> {
  if (!(await isAdmin())) return;
  await setSetting("cvUrl", "");
  revalidateSite();
}
