"use client";

import { FormEvent, useState } from "react";

type TrialFormCopy = {
  successEyebrow: string;
  successTitle: string;
  successBody: string;
  team: string;
  teamPlaceholder: string;
  contact: string;
  contactPlaceholder: string;
  scenario: string;
  scenarioPlaceholder: string;
  submit: string;
};

export function TrialForm({ copy }: { copy?: TrialFormCopy }) {
  const [submitted, setSubmitted] = useState(false);

  const t = copy ?? {
    successEyebrow: "申请已记录",
    successTitle: "我们会通过你留下的联系方式继续跟进。",
    successBody: "当前页面使用前端占位提交流程，后续可以直接接入真实线索系统。",
    team: "团队名称",
    teamPlaceholder: "例如：模型安全组 / 法务合规组",
    contact: "联系人",
    contactPlaceholder: "姓名 / 邮箱 / 企业微信",
    scenario: "使用场景",
    scenarioPlaceholder: "请简要描述你想审计的模型、使用团队和当前风险关注点。",
    submit: "提交试用申请",
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="surface-card p-6">
        <div className="caption">{t.successEyebrow}</div>
        <h2 className="mt-3 text-[28px] font-[450] leading-tight">{t.successTitle}</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form className="surface-card grid gap-5 p-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="caption" htmlFor="trial-team">{t.team}</label>
        <input id="trial-team" className="portal-input" placeholder={t.teamPlaceholder} required />
      </div>
      <div className="grid gap-2">
        <label className="caption" htmlFor="trial-contact">{t.contact}</label>
        <input id="trial-contact" className="portal-input" placeholder={t.contactPlaceholder} required />
      </div>
      <div className="grid gap-2">
        <label className="caption" htmlFor="trial-scene">{t.scenario}</label>
        <textarea
          id="trial-scene"
          className="portal-input min-h-[140px] resize-y"
          placeholder={t.scenarioPlaceholder}
          required
        />
      </div>
      <button type="submit" className="portal-pill portal-pill-primary h-[56px]">
        {t.submit}
      </button>
    </form>
  );
}
