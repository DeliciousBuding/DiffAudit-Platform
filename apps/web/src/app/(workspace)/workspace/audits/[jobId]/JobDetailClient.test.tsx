import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { JobDetailClient } from "./JobDetailClient";

const useStateMock = vi.fn();
const useEffectMock = vi.fn();
const useRefMock = vi.fn();

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: (...args: unknown[]) => useStateMock(...args),
    useEffect: (...args: unknown[]) => useEffectMock(...args),
    useRef: (...args: unknown[]) => useRefMock(...args),
  };
});

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.PropsWithChildren<{ href: string }>) =>
    React.createElement("a", { href, ...rest }, children),
}));

vi.mock("@/components/modal", () => ({
  Modal: ({ children }: React.PropsWithChildren) => React.createElement(React.Fragment, null, children),
}));

describe("JobDetailClient", () => {
  afterEach(() => {
    useStateMock.mockReset();
    useEffectMock.mockReset();
    useRefMock.mockReset();
  });

  it("renders state history entries when the job detail payload provides them", () => {
    useStateMock
      .mockReturnValueOnce([
        {
          job_id: "job_x88_runtime",
          status: "completed",
          contract_key: "gray-box/pia/cifar10-ddpm",
          workspace_name: "pia-runtime-mainline",
          job_type: "pia_runtime_mainline",
          created_at: "2026-04-17T09:49:50.6756356Z",
          updated_at: "2026-04-17T09:50:04.7383118Z",
          state_history: [
            { state: "queued", timestamp: "2026-04-17T09:49:50.6756356Z" },
            { state: "running", timestamp: "2026-04-17T09:49:50.6756356Z" },
            { state: "completed", timestamp: "2026-04-17T09:50:04.7383118Z" },
          ],
        },
        vi.fn(),
      ])
      .mockReturnValueOnce([false, vi.fn()])
      .mockReturnValueOnce([null, vi.fn()])
      .mockReturnValueOnce([false, vi.fn()])
      .mockReturnValueOnce([false, vi.fn()]);

    useEffectMock.mockImplementation(() => undefined);
    useRefMock.mockReturnValue({ current: null });

    const markup = renderToStaticMarkup(<JobDetailClient jobId="job_x88_runtime" locale="en-US" />);

    expect(markup).toContain("State history");
    expect(markup).toContain("Queued");
    expect(markup).toContain("Running");
    expect(markup).toContain("Completed");
    expect(markup).toContain("2026");
  });
});
