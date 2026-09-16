import ProjectWizard from "@/components/admin/ProjectWizard";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return (
    <ProjectWizard initialCategory={category === "short" ? "short" : "long"} />
  );
}
