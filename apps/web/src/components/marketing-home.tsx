import Link from "next/link";

import { LanguagePicker } from "@/components/language-picker";
import { BrandMark } from "@/components/brand-mark";

const capabilityCards = [
  {
    number: "01",
    title: "把风险说明讲成人能看懂的话",
    copy: "首页负责把扩散模型隐私风险、证据结构和审计入口讲清楚，而不是把访客直接丢进一个研究后台。",
  },
  {
    number: "02",
    title: "把黑盒、灰盒、白盒收进同一个产品入口",
    copy: "同一套站点里统一承载价值主张、任务入口、结果展示和设置，让产品表达和操作流转落在同一个界面层里。",
  },
  {
    number: "03",
    title: "让审计路径可复用、可导出、可协作",
    copy: "工作台负责待办、任务、报告和团队设置，面向真实协作与产品化交付。",
  },
];

const flowCards = [
  {
    title: "登录进入统一工作台",
    copy: "共享认证入口和工作台合为一体，减少跳转和双站心智负担。",
  },
  {
    title: "创建任务并观察运行状态",
    copy: "在工作台里集中发起审计、查看流程进度和结果摘要。",
  },
  {
    title: "沉淀报告并回到团队决策",
    copy: "把模型风险、核心指标和导出动作留在同一产品语境里闭环。",
  },
];

export function MarketingHome({ loggedIn }: { loggedIn: boolean }) {
  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container site-header-inner">
          <div className="flex items-center gap-10">
            <BrandMark compact />
            <nav className="site-nav max-md:hidden">
              <a href="#capabilities" className="site-nav-link">核心能力</a>
              <a href="#flow" className="site-nav-link">流程说明</a>
              <Link href="/workspace" className="site-nav-link">工作台</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguagePicker />
            <Link href="/trial" className="portal-pill portal-pill-secondary">申请试用</Link>
            <Link href={loggedIn ? "/workspace" : "/login"} className="portal-pill portal-pill-primary">
              {loggedIn ? "进入工作台" : "登录"}
            </Link>
          </div>
        </div>
      </header>

      <section className="container hero-grid">
        <div className="hero-copy">
          <BrandMark hero />
          <div className="caption mt-10">DiffAudit Platform</div>
          <h1 className="landing-main-header mt-4">
            <span>把扩散模型隐私审计</span>
            <span>做成一个真正能协作的网站。</span>
          </h1>
          <p className="hero-subtitle">
            统一承载价值主张、核心能力、任务入口、结果报告与团队设置。首页讲清楚产品，工作台完成审计，整站保持同一种设计语言和协作语境。
          </p>
          <div className="hero-actions">
            <Link href={loggedIn ? "/workspace" : "/login"} className="portal-pill portal-pill-primary">
              {loggedIn ? "打开工作台" : "登录开始"}
            </Link>
            <Link href="/trial" className="portal-pill portal-pill-secondary">
              申请试用
            </Link>
          </div>
        </div>

        <div className="workspace-highlight">
          <div className="caption">当前方向</div>
          <h2 className="mt-3 text-[30px] font-[450] leading-tight">
            单站产品壳，统一首页、登录、审计、报告与设置。
          </h2>
          <div className="workspace-kpis mt-6">
            <div className="workspace-kpi">
              <div className="workspace-kpi-label">产品入口</div>
              <div className="workspace-kpi-value">1 个站点</div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">首页、登录和工作台由同一个站点统一承载。</p>
            </div>
            <div className="workspace-kpi">
              <div className="workspace-kpi-label">核心页面</div>
              <div className="workspace-kpi-value">6 个区域</div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">首页、登录、工作台、审计流程、报告、设置形成完整产品闭环。</p>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="container py-10">
        <div className="marketing-grid">
          {capabilityCards.map((card) => (
            <article key={card.number} className="marketing-card">
              <div className="marketing-card-number">{card.number}</div>
              <h2 className="marketing-card-title">{card.title}</h2>
              <p className="marketing-card-copy">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="flow" className="container py-10">
        <div className="surface-card p-6 md:p-8">
          <div className="caption">流程说明</div>
          <h2 className="mt-3 text-[34px] font-[450] leading-tight">从入口到报告，全部留在同一个产品语境里。</h2>
          <div className="marketing-grid mt-8">
            {flowCards.map((card, index) => (
              <article key={card.title} className="marketing-card">
                <div className="marketing-card-number">{`0${index + 1}`}</div>
                <h3 className="marketing-card-title">{card.title}</h3>
                <p className="marketing-card-copy">{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="surface-card flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="caption">开始使用</div>
            <h2 className="mt-3 text-[32px] font-[450] leading-tight">先登录，再在统一工作台里创建你的第一条审计任务。</h2>
            <p className="mt-4 max-w-[60ch] text-sm leading-7 text-muted-foreground">
              这一版先用中文首页和统一工作台闭环产品叙事，多语言结构已经预留，后续可继续补齐。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={loggedIn ? "/workspace" : "/login"} className="portal-pill portal-pill-primary">
              {loggedIn ? "继续进入工作台" : "登录"}
            </Link>
            <Link href="/trial" className="portal-pill portal-pill-secondary">
              申请试用
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
