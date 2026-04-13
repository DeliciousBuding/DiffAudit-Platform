import { redirect } from "next/navigation";

export default function LegacyGuidePage() {
  redirect("/workspace/settings");
}
