import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SettingsClient } from "./SettingsClient";

describe("SettingsClient account verification", () => {
  it("renders a verification entry point for pending email addresses", () => {
    const markup = renderToStaticMarkup(
      <SettingsClient
        locale="en-US"
        oauthEnabled={{ google: true, github: true }}
        initialProfile={{
          id: "user-1",
          username: "delicious233",
          displayName: "Delicious 233",
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
        oauthEnabled={{ google: true, github: true }}
        initialProfile={{
          id: "user-1",
          username: "delicious233",
          displayName: "Delicious 233",
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
        oauthEnabled={{ google: true, github: true }}
        initialProfile={{
          id: "user-1",
          username: "delicious233",
          displayName: "Delicious 233",
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
        oauthEnabled={{ google: true, github: true }}
        initialProviderLinkStatus="github_connected"
        initialProfile={{
          id: "user-1",
          username: "delicious233",
          displayName: "Delicious 233",
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
