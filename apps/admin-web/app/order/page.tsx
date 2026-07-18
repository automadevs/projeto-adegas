import { redirect } from "next/navigation";

export default function OrderEntryPage() {
  redirect("/manager/dashboard?order=1");
}
