import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import * as schema from "./schema";

function getDbPath() {
  return process.env.DIFFAUDIT_DB_PATH ?? path.join(process.cwd(), "data", "diffaudit.db");
}

function getJournalMode() {
  return process.env.VITEST ? "DELETE" : "WAL";
}

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT UNIQUE,
  pending_email TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(provider, provider_account_id),
  UNIQUE(user_id, provider)
);
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS passkeys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL,
  transports TEXT,
  device_type TEXT,
  backed_up INTEGER NOT NULL DEFAULT 0,
  name TEXT,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);
CREATE TABLE IF NOT EXISTS two_factor_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  totp_secret TEXT,
  recovery_codes TEXT,
  enabled INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

function ensureColumn(sqlite: Database.Database, table: string, column: string, ddl: string) {
  const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((entry) => entry.name === column)) {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sqlite: Database.Database | null = null;

export function getDb() {
  if (!_db) {
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const sqlite = new Database(dbPath);
    sqlite.pragma(`journal_mode = ${getJournalMode()}`);
    sqlite.pragma("foreign_keys = ON");
    sqlite.exec(INIT_SQL);
    ensureColumn(sqlite, "users", "display_name", "display_name TEXT");
    ensureColumn(sqlite, "users", "pending_email", "pending_email TEXT");
    ensureColumn(sqlite, "users", "email_verified", "email_verified INTEGER NOT NULL DEFAULT 0");
    ensureColumn(sqlite, "users", "bio", "bio TEXT");
    _sqlite = sqlite;
    _db = drizzle(sqlite, { schema });
  }
  return _db;
}

export function resetDbForTests() {
  _db = null;
  if (_sqlite) {
    _sqlite.close();
    _sqlite = null;
  }
}

export { schema };
