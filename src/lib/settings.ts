import { prisma } from "@/lib/prisma";

export type Socials = { github: string; linkedin: string; instagram: string };

export type SiteSettings = {
  contactEmail: string;
  cvUrl: string;
  socials: Socials;
};

const EMPTY_SOCIALS: Socials = { github: "", linkedin: "", instagram: "" };

function parseSocials(raw: string | undefined): Socials {
  if (!raw) return { ...EMPTY_SOCIALS };
  try {
    const parsed = JSON.parse(raw) as Partial<Record<keyof Socials, unknown>>;
    const pick = (value: unknown) => (typeof value === "string" ? value : "");
    return {
      github: pick(parsed.github),
      linkedin: pick(parsed.linkedin),
      instagram: pick(parsed.instagram),
    };
  } catch {
    return { ...EMPTY_SOCIALS };
  }
}

export async function getSettings(fallbackEmail = ""): Promise<SiteSettings> {
  let rows: { key: string; value: string }[] = [];
  try {
    rows = await prisma.setting.findMany();
  } catch {
    // Database not reachable yet (fresh clone before `prisma migrate`).
    rows = [];
  }

  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    contactEmail: map.get("contactEmail") || fallbackEmail,
    cvUrl: map.get("cvUrl") || "",
    socials: parseSocials(map.get("socials")),
  };
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
