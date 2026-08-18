import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { UserAvatar } from "./user-avatar";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("./logout-button", () => ({
  LogoutButton: ({ label }: { label?: string }) =>
    React.createElement("button", { type: "button" }, label ?? "Sign out"),
}));

describe("UserAvatar", () => {
  it("renders the trigger with explicit menu semantics", () => {
    const markup = renderToStaticMarkup(React.createElement(UserAvatar, { locale: "en-US" }));

    expect(markup).toContain('aria-label="User menu"');
    expect(markup).toContain('aria-haspopup="menu"');
  });

});
