export type AuditJobListPayload<T> = T[] | { jobs?: T[] | null };

export function normalizeAuditJobList<T>(payload: AuditJobListPayload<T> | unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && Array.isArray((payload as { jobs?: unknown }).jobs)) {
    return (payload as { jobs: T[] }).jobs;
  }

  return [];
}
