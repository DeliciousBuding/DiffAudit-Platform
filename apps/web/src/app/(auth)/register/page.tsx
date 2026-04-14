import { readServerLocale } from "@/lib/locale";
import { RegisterForm } from "@/components/register-form";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export default async function RegisterPage() {
  const locale = await readServerLocale();
  const copy = WORKSPACE_COPY[locale];

  return (
    <div className="mx-auto grid max-w-[960px] gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="workspace-highlight">
        <div className="caption">{copy.registerPage.eyebrow}</div>
        <h1 className="mt-3 text-[34px] font-[450] leading-tight">{copy.registerPage.title}</h1>
        <p className="mt-4 max-w-[48ch] text-sm leading-7 text-muted-foreground">{copy.registerPage.description}</p>
      </div>

      <div className="surface-card p-6 md:p-8">
        <div className="caption">{copy.registerPage.formEyebrow}</div>
        <h2 className="mt-3 text-[28px] font-[450] leading-tight">{copy.registerPage.formTitle}</h2>
        <div className="mt-6">
          <RegisterForm copy={copy.registerForm} pageCopy={copy.registerPage} />
        </div>
      </div>
    </div>
  );
}
