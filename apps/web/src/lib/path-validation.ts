const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;
const MAX_WORKSPACE_IDENTIFIER_LENGTH = 512;

export function isValidPathSegment(value: string, maxLen = 128): boolean {
  return value.length > 0 && value.length <= maxLen && SAFE_PATH_SEGMENT.test(value);
}

export function normalizeWorkspaceIdentifier(value: string): string {
  const normalized = value.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  if (!normalized) {
    return "";
  }
  const parts = normalized.split("/");
  return parts[parts.length - 1] ?? "";
}

export function isValidWorkspaceIdentifier(value: string): boolean {
  if (value.length === 0 || value.length > MAX_WORKSPACE_IDENTIFIER_LENGTH) {
    return false;
  }
  const normalized = value.replaceAll("\\", "/");
  const schemeMatch = /^([a-z][a-z0-9+.-]*):\/\/(.+)$/i.exec(normalized);
  const path = schemeMatch ? schemeMatch[2] : normalized;
  if (schemeMatch && schemeMatch[1] !== "research") {
    return false;
  }
  if (path.startsWith("/") || path.endsWith("/")) {
    return false;
  }
  const parts = path.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    return false;
  }
  return isValidPathSegment(normalizeWorkspaceIdentifier(value));
}
