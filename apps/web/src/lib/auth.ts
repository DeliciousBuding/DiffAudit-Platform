import { eq, and } from "drizzle-orm";
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

export function githubOAuthConfigured(
  env: GitHubOAuthEnv = process.env as GitHubOAuthEnv,
): boolean {
  return Boolean(env.GITHUB_CLIENT_ID?.trim() && env.GITHUB_CLIENT_SECRET?.trim());
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
      email: null,
      passwordHash,
      avatarUrl: null,
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
    email,
    passwordHash,
    createdAt: now,
  }).run();

  return { id, username };
}

export async function verifyCredentials(
  login: string,
  password: string,
): Promise<{ id: string; username: string; avatarUrl: string | null } | null> {
  const db = getDb();
  const user = db.select().from(schema.users).where(
    eq(schema.users.username, login),
  ).get();

  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, username: user.username, avatarUrl: user.avatarUrl };
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
  profile: { username: string; email: string | null; avatarUrl: string | null },
): { id: string; username: string } {
  const db = getDb();

  const existing = db
    .select({ userId: schema.oauthAccounts.userId, username: schema.users.username })
    .from(schema.oauthAccounts)
    .innerJoin(schema.users, eq(schema.oauthAccounts.userId, schema.users.id))
    .where(
      and(
        eq(schema.oauthAccounts.provider, provider),
        eq(schema.oauthAccounts.providerAccountId, providerAccountId),
      ),
    )
    .get();

  if (existing) return { id: existing.userId, username: existing.username };

  const userId = crypto.randomUUID();
  const now = new Date();

  let username = profile.username;
  const taken = db.select().from(schema.users).where(eq(schema.users.username, username)).get();
  if (taken) {
    username = `${username}-${crypto.randomBytes(3).toString("hex")}`;
  }

  db.insert(schema.users).values({
    id: userId,
    username,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
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

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_MS / 1000,
};
