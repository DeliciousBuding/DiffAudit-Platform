import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { BrandMark } from "./brand-mark";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", props),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: React.PropsWithChildren<{ href: string }>) => React.createElement("a", { href, ...rest }, children),
}));

describe("BrandMark", () => {
  it("renders a homepage link when href is provided", () => {
    const markup = renderToStaticMarkup(<BrandMark compact href="/" prefetch={false} />);

    expect(markup).toContain('href="/"');
    expect(markup).toContain("DiffAudit");
  });

  it("renders without a link by default", () => {
    const markup = renderToStaticMarkup(<BrandMark compact />);

    expect(markup).not.toContain('href="/"');
  });
});
