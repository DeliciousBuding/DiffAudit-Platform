import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WORKSPACE_COPY } from "@/lib/workspace-copy";

import { PlatformNavDesktop, PlatformNavMobile } from "./platform-nav.client";

const usePathnameMock = vi.fn();
const linkMock = vi.fn(
  ({
    children,
    href,
    prefetch,
    ...rest
  }: React.PropsWithChildren<{ href: string; prefetch?: boolean }>) =>
    React.createElement("a", { href, "data-prefetch": String(prefetch), ...rest }, children),
);

vi.mock("@/lib/router/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("@/lib/router/link", () => ({
  default: (props: React.PropsWithChildren<{ href: string; prefetch?: boolean }>) =>
    linkMock(props),
}));

describe("platform nav prefetch", () => {
  afterEach(() => {
    usePathnameMock.mockReset();
    linkMock.mockClear();
  });

  it("disables desktop nav prefetch for workspace routes", () => {
    usePathnameMock.mockReturnValue("/workspace/start");

    renderToStaticMarkup(<PlatformNavDesktop locale="en-US" />);

    expect(linkMock).toHaveBeenCalled();
    for (const call of linkMock.mock.calls) {
      expect(call[0].prefetch).toBe(false);
    }
  });

  it("disables mobile nav prefetch for workspace routes", () => {
    usePathnameMock.mockReturnValue("/workspace/reports");

    renderToStaticMarkup(<PlatformNavMobile locale="zh-CN" />);

    expect(linkMock).toHaveBeenCalled();
    for (const call of linkMock.mock.calls) {
      expect(call[0].prefetch).toBe(false);
    }
  });

  it("uses localized desktop navigation labels from workspace copy", () => {
    usePathnameMock.mockReturnValue("/workspace/start");

    const markup = renderToStaticMarkup(<PlatformNavDesktop locale="en-US" />);

    expect(markup).toContain(`aria-label="${WORKSPACE_COPY["en-US"].shell.desktopNavAriaLabel}"`);
  });

  it("uses localized mobile navigation labels from workspace copy", () => {
    usePathnameMock.mockReturnValue("/workspace/start");

    const markup = renderToStaticMarkup(<PlatformNavMobile locale="zh-CN" />);

    expect(markup).toContain(`aria-label="${WORKSPACE_COPY["zh-CN"].shell.mobileNavAriaLabel}"`);
  });
});
