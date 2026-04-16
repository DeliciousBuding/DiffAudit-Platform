import { eq, and, ne, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { getDb, schema } from "@/lib/db";

export const SESSION_COOKIE_NAME = "diffaudit_session";
export const DEFAULT_REDIRECT_PATH = "/workspace";
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function protectedPagePath(pathname: string): boolean {
  return pathname === "/workspace" || pathname.startsWith("/workspace/");
}

export function protectedApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/v1/");
}

export function authPagePath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

export function sanitizeRedirectPath(
  redirectPath: string | null | undefined,
  fallbackPath: string = DEFAULT_REDIRECT_PATH,
): string {
  if (!redirectPath) return fallbackPath;
  const p = redirectPath.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return fallbackPath;
  return p;
}

export function buildLoginPath(redirectPath: string): string {
  const safe = sanitizeRedirectPath(redirectPath);
  const url = new URL("/login", "http://localhost");
  url.searchParams.set("redirectTo", safe);
  return `${url.pathname}${url.search}`;
}

type GitHubOAuthEnv = {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

type GoogleOAuthEnv = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

export function githubOAuthConfigured(
  env: GitHubOAuthEnv = process.env as GitHubOAuthEnv,
): boolean {
  return Boolean(env.GITHUB_CLIENT_ID?.trim() && env.GITHUB_CLIENT_SECRET?.trim());
}

export function googleOAuthConfigured(
  env: GoogleOAuthEnv = process.env as GoogleOAuthEnv,
): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim());
}

type LegacySharedAuthEnv = {
  DIFFAUDIT_SHARED_USERNAME?: string;
  DIFFAUDIT_SHARED_PASSWORD?: string;
};

export async function ensureLegacySharedUser(
  env: LegacySharedAuthEnv = process.env as LegacySharedAuthEnv,
): Promise<{ id: string; username: string } | null> {
  const username = env.DIFFAUDIT_SHARED_USERNAME?.trim();
  const password = env.DIFFAUDIT_SHARED_PASSWORD;

  if (!username || !password) {
    return null;
  }

  const db = getDb();
  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();

  const now = new Date();

  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
  db.insert(schema.users).values({
    id,
    username,
    displayName: username,
    email: null,
    emailVerified: false,
    passwordHash,
    avatarUrl: null,
    bio: null,
    createdAt: now,
  }).run();
    return { id, username };
  }

  if (existing.passwordHash && await bcrypt.compare(password, existing.passwordHash)) {
    return { id: existing.id, username: existing.username };
  }

  db.update(schema.users)
    .set({
      passwordHash: await bcrypt.hash(password, 10),
    })
    .where(eq(schema.users.id, existing.id))
    .run();

  return { id: existing.id, username: existing.username };
}

export async function createUser(
  username: string,
  email: string | null,
  password: string,
): Promise<{ id: string; username: string }> {
  const db = getDb();
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();

  db.insert(schema.users).values({
    id,
    username,
    displayName: username,
    email: null,
    pendingEmail: null,
    emailVerified: false,
    passwordHash,
    avatarUrl: null,
    bio: null,
    createdAt: now,
  }).run();

  return { id, username };
}

export async function setUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  const db = getDb();
  const passwordHash = await bcrypt.hash(password, 10);

  db.update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, userId))
    .run();
}

export async function verifyUserPassword(
  userId: string,
  password: string,
): Promise<boolean> {
  const db = getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();

  if (!user?.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function verifyCredentials(
  login: string,
  password: string,
): Promise<{ id: string; username: string; avatarUrl: string | null } | null> {
  const db = getDb();
  const identifier = login.trim();
  const user = db
    .select()
    .from(schema.users)
    .where(
      or(
        eq(schema.users.username, identifier),
        eq(schema.users.email, identifier),
      ),
    )
    .get();

  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, username: user.username, avatarUrl: user.avatarUrl };
}

type OAuthProfile = {
  username: string;
  displayName?: string | null;
  email: string | null;
  emailVerified?: boolean;
  avatarUrl: string | null;
};

export type CurrentUserProfile = {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  pendingEmail: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  bio: string | null;
  providers: string[];
  hasPassword: boolean;
};

type EmailVerificationRequest = {
  token: string;
  email: string;
  verificationUrl: string;
};

type EmailVerificationResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: "invalid" | "expired" | "missing_pending_email" };

type SetPendingEmailResult =
  | { ok: true; pendingEmail: string }
  | { ok: false; reason: "invalid_email" | "email_in_use" };

type LinkOAuthAccountResult =
  | { ok: true; userId: string; status: "linked" | "already_linked" }
  | { ok: false; reason: "provider_in_use" | "provider_already_connected" };

function hashVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function syncOAuthProfileToUser(
  userId: string,
  current: {
    username: string;
    displayName: string | null;
    email: string | null;
    pendingEmail: string | null;
    emailVerified: boolean;
    avatarUrl: string | null;
  },
  profile: OAuthProfile,
) {
  const db = getDb();

  let nextEmail = current.email;
  let nextPendingEmail = current.pendingEmail;
  let nextEmailVerified = current.emailVerified;

  if (profile.emailVerified && profile.email) {
    if (!current.email || current.email === profile.email || current.pendingEmail === profile.email) {
      nextEmail = profile.email;
      nextPendingEmail = null;
      nextEmailVerified = true;
    }
  } else if (!current.email && !current.pendingEmail && profile.email) {
    nextPendingEmail = profile.email;
  }

  db.update(schema.users)
    .set({
      displayName: profile.displayName ?? current.displayName ?? current.username,
      email: nextEmail,
      pendingEmail: nextPendingEmail,
      emailVerified: nextEmailVerified,
      avatarUrl: profile.avatarUrl ?? current.avatarUrl,
    })
    .where(eq(schema.users.id, userId))
    .run();
}

export function createSession(userId: string): string {
  const db = getDb();
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  db.insert(schema.sessions).values({
    id,
    userId,
    token,
    expiresAt,
    createdAt: now,
  }).run();

  return token;
}

export function createEmailVerificationRequest(
  userId: string,
  platformUrl: string,
): EmailVerificationRequest | null {
  const db = getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();

  if (!user?.pendingEmail) {
    return null;
  }

  db.delete(schema.emailVerificationTokens).where(eq(schema.emailVerificationTokens.userId, userId)).run();

  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

  db.insert(schema.emailVerificationTokens).values({
    id: crypto.randomUUID(),
    userId,
    tokenHash: hashVerificationToken(token),
    email: user.pendingEmail,
    expiresAt,
    createdAt: now,
  }).run();

  const url = new URL("/api/auth/verify-email", platformUrl);
  url.searchParams.set("token", token);

  return {
    token,
    email: user.pendingEmail,
    verificationUrl: url.toString(),
  };
}

export function setPendingEmail(userId: string, email: string): SetPendingEmailResult {
  const normalizedEmail = normalizeEmail(email);
  if (!emailLooksValid(normalizedEmail)) {
    return { ok: false, reason: "invalid_email" };
  }

  const db = getDb();
  const claimedEmail = db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.email, normalizedEmail),
        eq(schema.users.emailVerified, true),
        ne(schema.users.id, userId),
      ),
    )
    .get();

  if (claimedEmail) {
    return { ok: false, reason: "email_in_use" };
  }

  db.update(schema.users)
    .set({ pendingEmail: normalizedEmail })
    .where(eq(schema.users.id, userId))
    .run();

  db.delete(schema.emailVerificationTokens)
    .where(eq(schema.emailVerificationTokens.userId, userId))
    .run();

  return {
    ok: true,
    pendingEmail: normalizedEmail,
  };
}

export function linkOAuthAccount(
  userId: string,
  provider: string,
  providerAccountId: string,
  profile: OAuthProfile,
): LinkOAuthAccountResult {
  const db = getDb();
  const existingProviderAccount = db
    .select()
    .from(schema.oauthAccounts)
    .where(
      and(
        eq(schema.oauthAccounts.provider, provider),
        eq(schema.oauthAccounts.providerAccountId, providerAccountId),
      ),
    )
    .get();

  if (existingProviderAccount) {
    if (existingProviderAccount.userId !== userId) {
      return { ok: false, reason: "provider_in_use" };
    }

    const currentUser = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
    if (currentUser) {
      syncOAuthProfileToUser(userId, currentUser, profile);
    }
    return { ok: true, userId, status: "already_linked" };
  }

  const existingProviderForUser = db
    .select()
    .from(schema.oauthAccounts)
    .where(
      and(
        eq(schema.oauthAccounts.userId, userId),
        eq(schema.oauthAccounts.provider, provider),
      ),
    )
    .get();

  if (existingProviderForUser) {
    return { ok: false, reason: "provider_already_connected" };
  }

  db.insert(schema.oauthAccounts).values({
    id: crypto.randomUUID(),
    userId,
    provider,
    providerAccountId,
    createdAt: new Date(),
  }).run();

  const currentUser = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (currentUser) {
    syncOAuthProfileToUser(userId, currentUser, profile);
  }

  return { ok: true, userId, status: "linked" };
}

export function verifyEmailToken(token: string): EmailVerificationResult {
  const db = getDb();
  const tokenHash = hashVerificationToken(token);
  const record = db
    .select()
    .from(schema.emailVerificationTokens)
    .where(eq(schema.emailVerificationTokens.tokenHash, tokenHash))
    .get();

  if (!record) {
    return { ok: false, reason: "invalid" };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    db.delete(schema.emailVerificationTokens).where(eq(schema.emailVerificationTokens.id, record.id)).run();
    return { ok: false, reason: "expired" };
  }

  const user = db.select().from(schema.users).where(eq(schema.users.id, record.userId)).get();
  if (!user?.pendingEmail || user.pendingEmail !== record.email) {
    db.delete(schema.emailVerificationTokens).where(eq(schema.emailVerificationTokens.userId, record.userId)).run();
    return { ok: false, reason: "missing_pending_email" };
  }

  db.update(schema.users)
    .set({
      email: record.email,
      pendingEmail: null,
      emailVerified: true,
    })
    .where(eq(schema.users.id, record.userId))
    .run();

  db.delete(schema.emailVerificationTokens).where(eq(schema.emailVerificationTokens.userId, record.userId)).run();

  return {
    ok: true,
    userId: record.userId,
    email: record.email,
  };
}

export function validateSession(
  token: string | undefined,
): { userId: string; username: string; avatarUrl: string | null } | null {
  if (!token) return null;

  const db = getDb();
  const row = db
    .select({
      userId: schema.sessions.userId,
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      expiresAt: schema.sessions.expiresAt,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(eq(schema.sessions.token, token))
    .get();

  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    db.delete(schema.sessions).where(eq(schema.sessions.token, token)).run();
    return null;
  }

  return { userId: row.userId, username: row.username, avatarUrl: row.avatarUrl };
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.delete(schema.sessions).where(eq(schema.sessions.token, token)).run();
}

export function findOrCreateOAuthUser(
  provider: string,
  providerAccountId: string,
  profile: OAuthProfile,
): { id: string; username: string } {
  const db = getDb();

  const existing = db
    .select({
      userId: schema.oauthAccounts.userId,
      username: schema.users.username,
      displayName: schema.users.displayName,
      email: schema.users.email,
      pendingEmail: schema.users.pendingEmail,
      emailVerified: schema.users.emailVerified,
      avatarUrl: schema.users.avatarUrl,
    })
    .from(schema.oauthAccounts)
    .innerJoin(schema.users, eq(schema.oauthAccounts.userId, schema.users.id))
    .where(
      and(
        eq(schema.oauthAccounts.provider, provider),
        eq(schema.oauthAccounts.providerAccountId, providerAccountId),
      ),
    )
    .get();

  const now = new Date();

  if (existing) {
    syncOAuthProfileToUser(existing.userId, existing, profile);

    return { id: existing.userId, username: existing.username };
  }

  if (profile.email && profile.emailVerified) {
    const matchedByEmail = db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.email, profile.email), eq(schema.users.emailVerified, true)))
      .get();

    if (matchedByEmail) {
      db.insert(schema.oauthAccounts).values({
        id: crypto.randomUUID(),
        userId: matchedByEmail.id,
        provider,
        providerAccountId,
        createdAt: now,
      }).run();

      db.update(schema.users)
        .set({
          displayName: profile.displayName ?? matchedByEmail.displayName ?? matchedByEmail.username,
          email: profile.email,
          pendingEmail: null,
          emailVerified: true,
          avatarUrl: profile.avatarUrl,
        })
        .where(eq(schema.users.id, matchedByEmail.id))
        .run();

      return { id: matchedByEmail.id, username: matchedByEmail.username };
    }
  }

  const userId = crypto.randomUUID();

  let username = profile.username;
  const taken = db.select().from(schema.users).where(eq(schema.users.username, username)).get();
  if (taken) {
    username = `${username}-${crypto.randomBytes(3).toString("hex")}`;
  }

  db.insert(schema.users).values({
    id: userId,
    username,
    displayName: profile.displayName ?? username,
    email: profile.emailVerified ? profile.email : null,
    pendingEmail: profile.emailVerified ? null : profile.email,
    emailVerified: profile.emailVerified ?? false,
    avatarUrl: profile.avatarUrl,
    bio: null,
    createdAt: now,
  }).run();

  db.insert(schema.oauthAccounts).values({
    id: crypto.randomUUID(),
    userId,
    provider,
    providerAccountId,
    createdAt: now,
  }).run();

  return { id: userId, username };
}

export function getCurrentUserProfile(token: string | undefined): CurrentUserProfile | null {
  const session = validateSession(token);
  if (!session) {
    return null;
  }

  const db = getDb();
  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .get();

  if (!user) {
    return null;
  }

  const providers = db
    .select({ provider: schema.oauthAccounts.provider })
    .from(schema.oauthAccounts)
    .where(eq(schema.oauthAccounts.userId, user.id))
    .all()
    .map((entry) => entry.provider)
    .sort();

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName ?? user.username,
    email: user.email,
    pendingEmail: user.pendingEmail,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    providers,
    hasPassword: Boolean(user.passwordHash),
  };
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_MS / 1000,
};
