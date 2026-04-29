import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CreateTaskClient } from "./CreateTaskClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const models = [
  {
    contractKey: "black-box/recon/demo",
    label: "Recon demo",
    track: "black-box",
    capabilityLabel: "Membership inference",
    availability: "ready",
  },
];

describe("CreateTaskClient accessibility", () => {
  it("exposes localized stepper state on first render", () => {
    const markup = renderToStaticMarkup(<CreateTaskClient locale="en-US" availableModels={models} />);

    expect(markup).toContain('role="list"');
    expect(markup).toContain('aria-label="Create audit task steps"');
    expect(markup).toContain('aria-current="step"');
    expect(markup).toContain("disabled");
    expect(markup).toContain('aria-disabled="true"');
  });

  it("binds parameter labels and switch names in Chinese copy", () => {
    const markup = renderToStaticMarkup(<CreateTaskClient locale="zh-CN" availableModels={models} />);
    const source = readFileSync(new URL("./CreateTaskClient.tsx", import.meta.url), "utf8");

    expect(markup).toContain('aria-label="创建审计任务步骤"');
    expect(source).toContain('aria-label={labels.adaptiveSampling}');
    expect(source).toContain("htmlFor={roundsInputId}");
    expect(source).toContain("id={roundsInputId}");
    expect(source).toContain("htmlFor={batchSizeInputId}");
    expect(source).toContain("id={batchSizeInputId}");
  });
});
