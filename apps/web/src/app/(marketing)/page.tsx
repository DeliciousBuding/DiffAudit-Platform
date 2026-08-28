import { MarketingHome } from "@/components/marketing-home";
import { clientLocale } from "@/lib/locale";
import { clientLoggedIn } from "@/lib/auth-config";

export default function HomePage() {
  return (
    <MarketingHome
      loggedIn={clientLoggedIn()}
      workbenchUrl="/workspace/start"
      initialLocale={clientLocale()}
    />
  );
}
