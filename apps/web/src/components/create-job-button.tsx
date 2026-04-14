"use client";

import { useEffect, useState } from "react";

type JobTemplatePayload = Record<string, unknown>;

export type JobSubmissionResult = {
  jobId: string;
  status: string;
};

async function readResponseDetail(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await response.json()) as Record<string, unknown>;
      if (body && typeof body.detail === "string") {
        return body.detail;
      }
    } catch {
      // fall through
    }
  }

  try {
    const text = await response.text();
    if (text) {
      return text;
    }
  } catch {
    // fall through
  }

  return response.statusText || "request failed";
}

export async function submitAuditJob(contractKey: string): Promise<JobSubmissionResult> {
  const templateUrl = `/api/v1/audit/job-template?contract_key=${encodeURIComponent(contractKey)}`;
  const templateResponse = await fetch(templateUrl, { cache: "no-store" });
  if (!templateResponse.ok) {
    throw new Error(await readResponseDetail(templateResponse));
  }

  const templatePayload = (await templateResponse.json()) as JobTemplatePayload;

  const createResponse = await fetch("/api/v1/audit/jobs", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(templatePayload),
    cache: "no-store",
  });

  if (!createResponse.ok) {
    throw new Error(await readResponseDetail(createResponse));
  }

  const jobRecord = (await createResponse.json()) as { job_id?: string; status?: string };
  if (!jobRecord?.job_id) {
    throw new Error("audit job submitted but response missing job_id");
  }

  return {
    jobId: jobRecord.job_id,
    status: jobRecord.status ?? "unknown",
  };
}

type CreateJobButtonProps = {
  contractKey: string;
  label: string;
};

type ButtonState = "idle" | "loading" | "success" | "error";

export function CreateJobButton({ contractKey, label }: CreateJobButtonProps) {
  const [status, setStatus] = useState<ButtonState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = window.setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 4000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  const handleClick = async () => {
    if (status === "loading") {
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const result = await submitAuditJob(contractKey);
      setStatus("success");
      setMessage(`Job ${result.jobId} queued`);
    } catch (error) {
      setStatus("error");
      const detail = error instanceof Error ? error.message : "Job request failed";
      setMessage(detail);
    }
  };

  const messageClass = status === "error" ? "text-xs text-red-500" : "text-xs text-muted-foreground";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        className="portal-pill portal-pill-primary disabled:opacity-50 disabled:cursor-wait"
        disabled={status === "loading"}
      >
        {label}
      </button>
      {message ? (
        <span role="status" aria-live="polite" className={messageClass}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
