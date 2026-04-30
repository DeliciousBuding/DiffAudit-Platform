const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;

export function isValidPathSegment(value: string, maxLen = 128): boolean {
  return value.length > 0 && value.length <= maxLen && SAFE_PATH_SEGMENT.test(value);
}
