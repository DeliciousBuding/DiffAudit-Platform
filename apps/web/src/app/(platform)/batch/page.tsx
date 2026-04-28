import { redirect } from "next/navigation";

export default function LegacyBatchPage() {
  redirect("/workspace/audits");
}
