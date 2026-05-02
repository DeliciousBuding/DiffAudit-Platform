import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("next/link", () => ({
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
});
