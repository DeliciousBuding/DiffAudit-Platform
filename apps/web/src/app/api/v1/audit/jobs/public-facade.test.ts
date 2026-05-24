import { afterEach, describe, expect, it, vi } from "vitest";

describe("audit job public facade routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sanitizes live audit job list responses before returning them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      jobs: [
        {
          job_id: "job_live",
          workspace_name: "C:\\runtime\\private\\run",
          target_model: "http://localhost:8765/model",
          summary_note: "wrote token=abc to control.internal",
        },
      ],
    })));

    const route = await import("./route");
    const response = await route.GET(new Request("http://localhost/api/v1/audit/jobs", {
      headers: { cookie: "platform-demo-mode=0" },
    }));
    const payload = await response.json();

    expect(payload).toEqual({
      jobs: [
        {
          job_id: "job_live",
          workspace_name: "<local-path>",
          target_model: "<runtime-url>",
          summary_note: "wrote token=<redacted> to <runtime-host>",
        },
      ],
    });
  });

  it("sanitizes live audit job detail responses before returning them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      job: {
        job_id: "job_detail",
        stdout_tail: "/srv/runtime/stdout.log",
        stderr_tail: "failed via https://runtime.internal/run",
        state_history: [
          { state: "failed", detail: "password=secret at 10.0.0.2" },
        ],
      },
    })));

    const route = await import("./[jobId]/route");
    const response = await route.GET(new Request("http://localhost/api/v1/audit/jobs/job_detail", {
      headers: { cookie: "platform-demo-mode=0" },
    }), {
      params: Promise.resolve({ jobId: "job_detail" }),
    });
    const payload = await response.json();

    expect(payload).toEqual({
      job: {
        job_id: "job_detail",
        stdout_tail: "<local-path>",
        stderr_tail: "failed via <runtime-url>",
        state_history: [
          { state: "failed", detail: "password=<redacted> at <runtime-host>" },
        ],
      },
    });
  });

  it("sanitizes live audit job creation responses before returning them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      ok: true,
      job: {
        job_id: "job_created",
        workspace_name: "/home/runtime/private/job",
        summary_note: "created through localhost:8765",
      },
    }, { status: 201 })));

    const route = await import("./route");
    const response = await route.POST(new Request("http://localhost/api/v1/audit/jobs", {
      method: "POST",
      headers: { cookie: "platform-demo-mode=0" },
      body: JSON.stringify({ contract_key: "black-box/recon/demo" }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      ok: true,
      job: {
        job_id: "job_created",
        workspace_name: "<local-path>",
        summary_note: "created through <runtime-host>",
      },
    });
  });

  it("rejects live audit job creation when content-length exceeds the facade body limit", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const route = await import("./route");
    const response = await route.POST(new Request("http://localhost/api/v1/audit/jobs", {
      method: "POST",
      headers: {
        cookie: "platform-demo-mode=0",
        "content-length": String((1 << 20) + 1),
      },
      body: "{}",
    }));
    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload).toEqual({ detail: "request body too large" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects live audit job creation when streamed body exceeds the facade body limit", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const route = await import("./route");
    const response = await route.POST(new Request("http://localhost/api/v1/audit/jobs", {
      method: "POST",
      headers: { cookie: "platform-demo-mode=0" },
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(1 << 20));
          controller.enqueue(new Uint8Array(1));
          controller.close();
        },
      }),
      duplex: "half",
    } as RequestInit));
    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload).toEqual({ detail: "request body too large" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sanitizes live audit job cancellation responses before returning them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      ok: true,
      job: {
        job_id: "job_cancelled",
        error: "cancelled at /var/runtime/jobs/job_cancelled",
      },
    })));

    const route = await import("./[jobId]/route");
    const response = await route.DELETE(new Request("http://localhost/api/v1/audit/jobs/job_cancelled", {
      headers: { cookie: "platform-demo-mode=0" },
    }), {
      params: Promise.resolve({ jobId: "job_cancelled" }),
    });
    const payload = await response.json();

    expect(payload).toEqual({
      ok: true,
      job: {
        job_id: "job_cancelled",
        error: "cancelled at <local-path>",
      },
    });
  });
});
