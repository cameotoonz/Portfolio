import { getSettings, serializeSettings } from "@/lib/data";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">SITE & SECURITY</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
        Settings
      </h1>
      <SettingsForm
        initial={
          s
            ? serializeSettings(s)
            : { id: 0, siteTitle: "", siteDescription: "" }
        }
      />
    </div>
  );
}
