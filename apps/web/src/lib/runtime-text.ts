const WINDOWS_PATH_RE = /[A-Za-z]:\\[^\s"'<>]+/g;
const UNIX_PRIVATE_PATH_RE = /\/(?:home|root|Users|mnt|var|etc|srv|opt)\/[^\s"'<>]+/g;
const TOKEN_RE = /\b(?:token|secret|apikey|api_key|password)=([^\s"'<>]+)/gi;
const URL_RE = /\bhttps?:\/\/[^\s"'<>]+/gi;

export function sanitizeRuntimeText(value: string | null | undefined) {
  if (!value) {
    return value ?? null;
  }

  return value
    .replace(TOKEN_RE, (match) => match.replace(/=.*/, "=<redacted>"))
    .replace(WINDOWS_PATH_RE, "<local-path>")
    .replace(UNIX_PRIVATE_PATH_RE, "<local-path>")
    .replace(URL_RE, "<runtime-url>");
}
