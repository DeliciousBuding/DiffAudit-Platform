import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SettingsClient } from "./SettingsClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

describe("SettingsClient account verification", () => {
  it("renders a verification entry point for pending email addresses", () => {
    const markup = renderToStaticMarkup(
      <SettingsClient
        locale="en-US"
        mode="account"
        oauthEnabled={{ google: true, github: true }}
        initialProfile={{
          id: "user-1",
          username: "demo-reviewer",
          displayName: "Demo Reviewer",
          email: null,
          pendingEmail: "verify@diffaudit.test",
          emailVerified: false,
          avatarUrl: null,
          bio: null,
          providers: ["google"],
          hasPassword: false,
          twoFactorEnabled: false,
        }}
      />,
    );

    expect(markup).toContain("Pending email");
    expect(markup).toContain("Generate verification link");
    expect(markup).toContain("Pending email stays out of password sign-in until it is verified.");
  });

  it("renders the verification success notice when the page returns from the callback", () => {
    const markup = renderToStaticMarkup(
      <SettingsClient
        locale="en-US"
        mode="account"
        oauthEnabled={{ google: true, github: true }}
        initialProfile={{
          id: "user-1",
          username: "demo-reviewer",
          displayName: "Demo Reviewer",
          email: "verify@diffaudit.test",
          pendingEmail: null,
          emailVerified: true,
          avatarUrl: null,
          bio: null,
          providers: ["google"],
          hasPassword: true,
          twoFactorEnabled: false,
        }}
        initialEmailVerificationStatus="1"
      />,
    );

    expect(markup).toContain("Email verified. This address is now your canonical sign-in email.");
  });

  it("shows connect actions for oauth providers that are not linked yet", () => {
    const markup = renderToStaticMarkup(
      <SettingsClient
        locale="en-US"
        mode="account"
        oauthEnabled={{ google: true, github: true }}
        initialProfile={{
          id: "user-1",
          username: "demo-reviewer",
          displayName: "Demo Reviewer",
          email: null,
          pendingEmail: null,
          emailVerified: false,
          avatarUrl: null,
          bio: null,
          providers: ["google"],
          hasPassword: true,
          twoFactorEnabled: false,
        }}
      />,
    );

    expect(markup).toContain("Connected sign-in methods");
    expect(markup).toContain("Google");
    expect(markup).toContain("Connect GitHub");
  });

  it("shows provider link feedback after returning from oauth connect", () => {
    const markup = renderToStaticMarkup(
      <SettingsClient
        locale="en-US"
        mode="account"
        oauthEnabled={{ google: true, github: true }}
        initialProviderLinkStatus="github_connected"
        initialProfile={{
          id: "user-1",
          username: "demo-reviewer",
          displayName: "Demo Reviewer",
          email: null,
          pendingEmail: null,
          emailVerified: false,
          avatarUrl: null,
          bio: null,
          providers: ["google", "github"],
          hasPassword: true,
          twoFactorEnabled: false,
        }}
      />,
    );

    expect(markup).toContain("GitHub is now connected to this account.");
  });
});
