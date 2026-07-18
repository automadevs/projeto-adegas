import { notFound } from "next/navigation";

import { ManagerShell } from "../_components/manager-shell";

const sections = new Set([
  "dashboard",
  "finance",
  "products",
  "inventory",
  "sales",
  "suppliers",
  "purchases",
  "reports",
  "employees",
  "admin"
]);

export function generateStaticParams() {
  return Array.from(sections).map((section) => ({ section }));
}

export default async function ManagerSectionPage({
  params
}: {
  readonly params: Promise<{ readonly section: string }>;
}) {
  const { section } = await params;
  if (!sections.has(section)) {
    notFound();
  }

  return <ManagerShell />;
}
