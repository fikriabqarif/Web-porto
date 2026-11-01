import { CvForm } from "@/components/admin/cv-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { site } from "@/content/profile";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings(site.email);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="label">Site</p>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">Contact details, social links and the public CV file.</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Contact &amp; socials</h2>
        <SettingsForm
          initial={{
            contactEmail: settings.contactEmail,
            github: settings.socials.github,
            linkedin: settings.socials.linkedin,
            instagram: settings.socials.instagram,
          }}
        />
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-bold tracking-tight">CV</h2>
        <CvForm currentUrl={settings.cvUrl} />
      </section>
    </div>
  );
}
