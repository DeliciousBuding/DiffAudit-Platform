"use client";

import { FormEvent, useState } from "react";

export function TrialForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="surface-card p-6">
        <div className="caption">申请已记录</div>
        <h2 className="mt-3 text-[28px] font-[450] leading-tight">我们会用你填写的联系方式跟进试用。</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          当前页面使用前端占位提交流程，后续如需接真实线索系统，可以直接在这个表单上接入。
        </p>
      </div>
    );
  }

  return (
    <form className="surface-card grid gap-5 p-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="caption" htmlFor="trial-team">团队名称</label>
        <input id="trial-team" className="portal-input" placeholder="例如：模型安全组 / 法务合规组" required />
      </div>
      <div className="grid gap-2">
        <label className="caption" htmlFor="trial-contact">联系人</label>
        <input id="trial-contact" className="portal-input" placeholder="姓名 / 邮箱 / 企业微信" required />
      </div>
      <div className="grid gap-2">
        <label className="caption" htmlFor="trial-scene">使用场景</label>
        <textarea
          id="trial-scene"
          className="portal-input min-h-[140px] resize-y"
          placeholder="请简要描述你想审计的模型、使用团队和当前风险关注点。"
          required
        />
      </div>
      <button type="submit" className="portal-pill portal-pill-primary h-[56px]">
        提交试用申请
      </button>
    </form>
  );
}
