import { getProfile, serializeProfile, getAllServices, serializeService } from "@/lib/data";
import ProfileForm from "@/components/admin/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [p, svc] = await Promise.all([getProfile(), getAllServices()]);
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">PROFILE & WEBSITE SETTINGS</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
        Profile
      </h1>
      <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-mist">
        Everything here flows straight into the live site — hero, about,
        services, contact and footer.
      </p>
      {p && (
        <ProfileForm
          initial={serializeProfile(p)}
          services={svc.map(serializeService)}
        />
      )}
    </div>
  );
}
