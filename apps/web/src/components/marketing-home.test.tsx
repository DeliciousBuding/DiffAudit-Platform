import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { MarketingHome } from "./marketing-home";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: React.PropsWithChildren<{ href: string }>) => React.createElement("a", { href, ...rest }, children),
}));

vi.mock("./brand-mark", () => ({
  BrandMark: () => React.createElement("div", { "data-brand-mark": "true" }, "DiffAudit"),
}));

vi.mock("./particle-field", () => ({
  ParticleField: ({ className }: { className?: string }) =>
    React.createElement("canvas", { className, "data-particle-field": "true" }),
}));

vi.mock("./user-avatar", () => ({
  UserAvatar: () => React.createElement("div", { "data-user-avatar": "true" }, "avatar"),
}));

vi.mock("./platform-shell-icons", () => ({
  GithubIcon: () => React.createElement("svg", { "data-github-icon": "true" }),
}));

vi.mock("./language-picker", () => ({
  LanguagePicker: () => React.createElement("button", { "data-language-picker": "true" }, "lang"),
  getStoredLocale: () => "en-US",
}));

vi.mock("./theme-toggle-button", () => ({
  ThemeToggleButton: () => React.createElement("button", { "data-theme-toggle": "true" }, "theme"),
}));

describe("MarketingHome hero", () => {
  it("keeps the gz2 hero copy in zh-CN locale", () => {
    const markup = renderToStaticMarkup(
      <MarketingHome loggedIn={false} initialLocale="zh-CN" />,
    );

    expect(markup).toContain("Audit diffusion models");
    expect(markup).toContain("before they reach production.");
    expect(markup).toContain("Membership inference attack platform for privacy-aware AI compliance.");
    expect(markup).toContain("landing-subheader");
    expect(markup).toContain("landing-hero-body landing-hero-body-nowrap");
  });

  it("keeps the English subheadline on one line", () => {
    const markup = renderToStaticMarkup(
      <MarketingHome loggedIn={false} initialLocale="en-US" />,
    );

    expect(markup).toContain("Audit diffusion models");
    expect(markup).toContain("before they reach production.");
    expect(markup).toContain("landing-subheader landing-subheader-nowrap");
    expect(markup).toContain("Membership inference attack platform for privacy-aware AI compliance.");
    expect(markup).toContain("landing-hero-body landing-hero-body-nowrap");
  });
});
