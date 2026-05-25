const LOGIN_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS_PER_CLIENT_AND_LOGIN = 5;
const MAX_FAILED_ATTEMPTS_PER_LOGIN = 20;
const MAX_IDENTIFIER_LENGTH = 128;
const MAX_CLIENT_PART_LENGTH = 160;
const MAX_BUCKETS = 5_000;

type RateLimitBucket = {
  failedAttempts: number;
  resetAt: number;
};

type RateLimitRule = {
  key: string;
  maxFailedAttempts: number;
};

type LoginRateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterSeconds: number };

const loginRateLimitBuckets = new Map<string, RateLimitBucket>();
let nowMs = () => Date.now();

function normalizeBoundedValue(value: string | null | undefined, fallback: string, maxLength: number) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return fallback;
  return normalized.slice(0, maxLength);
}

function firstHeaderValue(headers: Headers, name: string) {
  return headers.get(name)?.split(",")[0]?.trim() || null;
}

function forwardedFor(headers: Headers) {
  const forwarded = headers.get("forwarded");
  if (!forwarded) return null;

  const firstEntry = forwarded.split(",")[0] ?? "";
  const match = firstEntry.match(/(?:^|;)\s*for=(?:"([^"]+)"|([^;]+))/i);
  return (match?.[1] ?? match?.[2])?.trim() || null;
}

function clientIdentity(request: Request) {
  const headers = request.headers;
  const address =
    firstHeaderValue(headers, "cf-connecting-ip")
    ?? firstHeaderValue(headers, "x-real-ip")
    ?? firstHeaderValue(headers, "x-forwarded-for")
    ?? forwardedFor(headers)
    ?? "unknown-client";
  const userAgent = headers.get("user-agent") ?? "unknown-agent";

  return normalizeBoundedValue(`${address}|${userAgent}`, "unknown-client", MAX_CLIENT_PART_LENGTH);
}

function loginIdentifier(login: string) {
  return normalizeBoundedValue(login, "unknown-login", MAX_IDENTIFIER_LENGTH);
}

function loginRateLimitRules(request: Request, login: string): RateLimitRule[] {
  const identifier = loginIdentifier(login);
  return [
    {
      key: `login:${identifier}`,
      maxFailedAttempts: MAX_FAILED_ATTEMPTS_PER_LOGIN,
    },
    {
      key: `client-login:${clientIdentity(request)}:${identifier}`,
      maxFailedAttempts: MAX_FAILED_ATTEMPTS_PER_CLIENT_AND_LOGIN,
    },
  ];
}

function liveBucket(key: string, currentTime: number) {
  const bucket = loginRateLimitBuckets.get(key);
  if (!bucket) return null;
  if (bucket.resetAt <= currentTime) {
    loginRateLimitBuckets.delete(key);
    return null;
  }
  return bucket;
}

function pruneExpiredBuckets(currentTime: number) {
  for (const [key, bucket] of loginRateLimitBuckets) {
    if (bucket.resetAt <= currentTime) {
      loginRateLimitBuckets.delete(key);
    }
  }
}

function enforceBucketLimit(currentTime: number) {
  pruneExpiredBuckets(currentTime);

  while (loginRateLimitBuckets.size > MAX_BUCKETS) {
    let oldestKey: string | null = null;
    let oldestResetAt = Number.POSITIVE_INFINITY;

    for (const [key, bucket] of loginRateLimitBuckets) {
      if (bucket.resetAt < oldestResetAt) {
        oldestKey = key;
        oldestResetAt = bucket.resetAt;
      }
    }

    if (!oldestKey) return;
    loginRateLimitBuckets.delete(oldestKey);
  }
}

export function checkLoginRateLimit(request: Request, login: string): LoginRateLimitResult {
  const currentTime = nowMs();
  let retryAfterSeconds = 0;

  for (const rule of loginRateLimitRules(request, login)) {
    const bucket = liveBucket(rule.key, currentTime);
    if (bucket && bucket.failedAttempts >= rule.maxFailedAttempts) {
      retryAfterSeconds = Math.max(
        retryAfterSeconds,
        Math.ceil((bucket.resetAt - currentTime) / 1000),
      );
    }
  }

  if (retryAfterSeconds > 0) {
    return { limited: true, retryAfterSeconds };
  }

  return { limited: false };
}

export function recordFailedLoginAttempt(request: Request, login: string) {
  const currentTime = nowMs();
  enforceBucketLimit(currentTime);

  for (const rule of loginRateLimitRules(request, login)) {
    const bucket = liveBucket(rule.key, currentTime);
    if (bucket) {
      bucket.failedAttempts += 1;
      continue;
    }

    loginRateLimitBuckets.set(rule.key, {
      failedAttempts: 1,
      resetAt: currentTime + LOGIN_LIMIT_WINDOW_MS,
    });
  }

  enforceBucketLimit(currentTime);
}

export function resetLoginRateLimit(request: Request, login: string) {
  for (const rule of loginRateLimitRules(request, login)) {
    loginRateLimitBuckets.delete(rule.key);
  }
}

export function resetLoginRateLimitForTests() {
  loginRateLimitBuckets.clear();
  nowMs = () => Date.now();
}

export function setLoginRateLimitClockForTests(clock: () => number) {
  nowMs = clock;
}
