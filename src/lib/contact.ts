import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { site } from "@/content/profile";

export type ContactPayload = { name: string; email: string; body: string };

export type ContactResult = { ok: true } | { ok: false; error: string; status: number };

/**
 * Stores a contact message. Used by both the server action (the /contact form)
 * and POST /api/contact so the two paths can never drift apart.
 */
export async function createContactMessage(payload: ContactPayload): Promise<ContactResult> {
  const { name, email, body } = payload;

  try {
    await prisma.message.create({ data: { name, email, body } });
  } catch {
    return { ok: false, error: "Could not save your message. Please try again.", status: 500 };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const settings = await getSettings(site.email);
      const to = settings.contactEmail || site.email;
      if (to) {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>",
          to,
          replyTo: email,
          subject: `New portfolio message from ${name}`,
          text: `From: ${name} <${email}>\n\n${body}`,
        });
      }
    } catch {
      // The message is already in the database — email is best-effort only.
    }
  }

  return { ok: true };
}
