import AttendantHome from "../../page";
import { notFound } from "next/navigation";

const sections = new Set([
  "home",
  "orders",
  "tables",
  "station",
  "sales",
  "sync",
  "more"
]);

export function generateStaticParams() {
  return Array.from(sections).map((section) => ({ section }));
}

export default async function OrderSectionPage({
  params
}: {
  readonly params: Promise<{ readonly section: string }>;
}) {
  const { section } = await params;
  if (!sections.has(section)) {
    notFound();
  }

  return <AttendantHome />;
}
