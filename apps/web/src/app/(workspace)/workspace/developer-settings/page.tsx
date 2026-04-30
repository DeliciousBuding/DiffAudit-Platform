import { redirect } from "next/navigation";

export default function DeveloperSettingsPage() {
  redirect("/workspace/api-keys");
}
