/**
 * API base resolution for the SPA.
 *
 * The Go gateway serves both the SPA and /api/* from the same origin, so the
 * default is same-origin relative URLs. DIFFAUDIT_API_BASE_URL may be set at
 * build time only when the API is served from a different origin.
 */
export function backendBaseUrl(): string {
  return process.env.DIFFAUDIT_API_BASE_URL ?? "";
}
