import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SettingsClient } from "./SettingsClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

function withToast(ui: React.ReactElement) {
  return ui;
}

describe("SettingsClient account verification", () => {
  it("renders Runner admission gates from research boundaries without promoting watch items", () => {
    const markup = renderToStaticMarkup(withToast(
      <SettingsClient
        locale="en-US"
        oauthEnabled={{ google: true, github: true }}
        initialResearchBoundaries={{
          status: "ok",
          source: "registry",
          candidate_policy: "not-exposed-as-live-jobs",
          boundaries: [
            {
              boundary_key: "h2-output-cloud-geometry-candidate-no-runtime-job",
              description: "H2 output-cloud geometry candidate",
              status: "watch-only",
              signal_strength: "strong-controlled-seed-stable-cross-cache-transfer",
              admission_blocker: "research-side-response-cache-geometry-not-second-public-asset-or-product-contract",
            },
            {
              boundary_key: "h2-img2img-output-cloud-portability-weak-no-runtime-job",
              description: "H2 img2img output-cloud portability weak gate",
              status: "watch-only",
              signal_strength: "weak-or-unstable-not-distinct-from-simple-distance",
              admission_blocker: "img2img-portability-failed-admission-cache-and-simple-distance-distinctness",
            },
            {
              boundary_key: "rediffuse-stl10-bounded-scout-and-score-norm-completed-weak-results-no-runtime-job",
              description: "ReDiffuse STL-10 weak scout",
              status: "watch-only",
              signal_strength: "weak-random-level",
              admission_blocker: "bounded-scout-and-score-norm-failed-membership-signal",
            },
          ],
          source_readiness: { ready: true },
        }}
      />,
    ));

    expect(markup).toContain("data-runner-boundary-panel");
    expect(markup).toContain("Runner admission gates");
    expect(markup).toContain("Watch-only");
    expect(markup).toContain(">3<");
    expect(markup).toContain("Admitted");
    expect(markup).toContain(">0<");
    expect(markup).toContain("Research candidates stay outside live jobs");
    expect(markup).toContain("H2 output-cloud geometry candidate");
    expect(markup).toContain("strong-controlled-seed-stable-cross-cache-transfer / research-side-response-cache-geometry-not-second-public-asset-or-product-contract");
    expect(markup).toContain("H2 img2img output-cloud portability weak gate");
    expect(markup).toContain("weak-or-unstable-not-distinct-from-simple-distance / img2img-portability-failed-admission-cache-and-simple-distance-distinctness");
    expect(markup).toContain("ReDiffuse STL-10 weak scout");
    expect(markup).toContain("weak-random-level / bounded-scout-and-score-norm-failed-membership-signal");
  });

  it("renders a verification entry point for pending email addresses", () => {
    const markup = renderToStaticMarkup(withToast(
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
    ));

    expect(markup).toContain("Pending email");
    expect(markup).toContain("Generate verification link");
    expect(markup).toContain("Pending email stays out of password sign-in until it is verified.");
  });

  it("renders the verification success notice when the page returns from the callback", () => {
    const markup = renderToStaticMarkup(withToast(
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
    ));

    expect(markup).toContain("Email verified. This address is now your canonical sign-in email.");
  });

  it("shows connect actions for oauth providers that are not linked yet", () => {
    const markup = renderToStaticMarkup(withToast(
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
    ));

    expect(markup).toContain("Connected sign-in methods");
    expect(markup).toContain("Google");
    expect(markup).toContain("Connect GitHub");
  });

  it("shows provider link feedback after returning from oauth connect", () => {
    const markup = renderToStaticMarkup(withToast(
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
    ));

    expect(markup).toContain("GitHub is now connected to this account.");
  });

  it("renders a unified account access state panel for verified email, providers, password, and two-factor status", () => {
    const markup = renderToStaticMarkup(withToast(
      <SettingsClient
        locale="en-US"
        mode="account"
        oauthEnabled={{ google: true, github: true }}
        initialProfile={{
          id: "user-1",
          username: "demo-reviewer",
          displayName: "Demo Reviewer",
          email: "review@diffaudit.test",
          pendingEmail: null,
          emailVerified: true,
          avatarUrl: null,
          bio: null,
          providers: ["github", "google"],
          hasPassword: true,
          twoFactorEnabled: true,
        }}
      />,
    ));

    expect(markup).toContain("data-account-state-panel");
    expect(markup).toContain("data-account-state-key=\"email\"");
    expect(markup).toContain("review@diffaudit.test");
    expect(markup).toContain("Verified");
    expect(markup).toContain("data-account-state-key=\"providers\"");
    expect(markup).toContain("GitHub / Google");
    expect(markup).toContain("data-account-state-key=\"password\"");
    expect(markup).toContain("Configured");
    expect(markup).toContain("data-account-state-key=\"two-factor\"");
    expect(markup).toContain("Enabled");
  });
});
