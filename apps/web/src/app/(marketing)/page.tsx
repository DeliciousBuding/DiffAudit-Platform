import { MarketingHome } from "@/components/marketing-home";
import { clientLocale, clientLoggedIn } from "@/lib/next-shims/runtime";

export default function HomePage() {
  return (
    <MarketingHome
      loggedIn={clientLoggedIn()}
      workbenchUrl="/workspace/start"
      initialLocale={clientLocale()}
    />
  );
}
