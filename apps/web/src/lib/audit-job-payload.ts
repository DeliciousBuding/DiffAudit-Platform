export type AuditJobListPayload<T> = T[] | { jobs?: T[] | null };

export function normalizeAuditJobList<T>(payload: AuditJobListPayload<T> | unknown): T[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && "jobs" in payload) {
    const jobs = (payload as { jobs?: unknown }).jobs;
    if (Array.isArray(jobs)) {
      return jobs as T[];
    }
    if (jobs === null || jobs === undefined) {
      return [];
    }
  }

  return null;
}
