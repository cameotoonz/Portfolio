import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio Login — Nitesh Kuamr",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-[10%] left-[15%] size-100 rounded-full bg-cyan2/6 blur-[110px]" />
        <div className="absolute bottom-[5%] right-[10%] size-90 rounded-full bg-magenta/6 blur-[110px]" />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.34em] text-cream">
            NITESH KUAMR
          </p>
          <p className="mt-3 text-[9px] tracking-[0.3em] text-mist/70">
            STUDIO — PRIVATE AREA
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
