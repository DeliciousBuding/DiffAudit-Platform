import { proxyJsonToBackend } from "@/lib/api-proxy";
import { sanitizeAuditJobPayload } from "@/lib/audit-job-payload";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";
import { createDemoJob, listDemoJobs } from "@/lib/demo-jobs-store";

const MAX_AUDIT_CONTROL_REQUEST_BODY_BYTES = 1 << 20;

export async function GET(request: Request) {
  if (await isDemoModeEnabledServer(request)) {
    return Response.json(sanitizeAuditJobPayload({ jobs: listDemoJobs() }));
  }
  return proxyJsonToBackend(
    "/api/v1/audit/jobs",
    undefined,
    sanitizeAuditJobPayload,
  );
}

export async function POST(request: Request) {
  const bodyResult = await readAuditControlBody(request);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  if (await isDemoModeEnabledServer(request)) {
    const payload = parseJsonObject(bodyResult.body);
    const job = createDemoJob({
      contract_key: typeof payload?.contract_key === "string" ? payload.contract_key : undefined,
      workspace_name: typeof payload?.workspace_name === "string" ? payload.workspace_name : undefined,
      job_type: typeof payload?.job_type === "string" ? payload.job_type : undefined,
      target_model:
        typeof payload?.target_model === "string"
          ? payload.target_model
          : typeof payload?.contract_key === "string"
            ? payload.contract_key
            : undefined,
    });
    return Response.json(sanitizeAuditJobPayload({ ok: true, job }), { status: 201 });
  }

  return proxyJsonToBackend(
    "/api/v1/audit/jobs",
    {
      method: "POST",
      body: bodyResult.body,
    },
    sanitizeAuditJobPayload,
  );
}

type BodyReadResult =
  | { ok: true; body: string }
  | { ok: false; response: Response };

async function readAuditControlBody(request: Request): Promise<BodyReadResult> {
  if (isContentLengthTooLarge(request.headers.get("content-length"))) {
    return oversizedBodyResponse();
  }

  if (!request.body) {
    return { ok: true, body: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_AUDIT_CONTROL_REQUEST_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        return oversizedBodyResponse();
      }

      chunks.push(value);
    }
  } catch {
    return {
      ok: false,
      response: Response.json({ detail: "request body unavailable" }, { status: 400 }),
    };
  }

  return { ok: true, body: new TextDecoder().decode(joinChunks(chunks, totalBytes)) };
}

function isContentLengthTooLarge(value: string | null) {
  if (!value) return false;
  const contentLength = Number(value);
  return Number.isFinite(contentLength) && contentLength > MAX_AUDIT_CONTROL_REQUEST_BODY_BYTES;
}

function oversizedBodyResponse(): BodyReadResult {
  return {
    ok: false,
    response: Response.json({ detail: "request body too large" }, { status: 413 }),
  };
}

function joinChunks(chunks: Uint8Array[], totalBytes: number) {
  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function parseJsonObject(body: string): Record<string, unknown> | null {
  try {
    const payload = JSON.parse(body);
    return payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
