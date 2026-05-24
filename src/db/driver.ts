import Database from 'better-sqlite3';
import { createClient, type Client } from '@libsql/client';
import path from 'path';

export type SqlValue = string | number | null | boolean;
export type SqlArgs = SqlValue[] | Record<string, SqlValue>;

let sqlite: Database.Database | null = null;
let turso: Client | null = null;

export function useTurso(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

function getSqlite(): Database.Database {
  if (!sqlite) {
    const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'app.db');
    sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
  }
  return sqlite;
}

function getTurso(): Client {
  if (!turso) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('TURSO_DATABASE_URL is not set');
    turso = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return turso;
}

function toArgs(args: SqlArgs): { named: Record<string, SqlValue>; list: SqlValue[] } {
  if (Array.isArray(args)) {
    return { named: {}, list: args };
  }
  return { named: args, list: Object.values(args) };
}

export async function qExec(sql: string): Promise<void> {
  if (useTurso()) {
    await getTurso().executeMultiple(sql);
    return;
  }
  getSqlite().exec(sql);
}

export async function qGet<T>(sql: string, args: SqlArgs = []): Promise<T | undefined> {
  if (useTurso()) {
    const { named, list } = toArgs(args);
    const result = Object.keys(named).length
      ? await getTurso().execute({ sql, args: named })
      : await getTurso().execute({ sql, args: list });
    return (result.rows[0] as T | undefined) ?? undefined;
  }
  const row = Array.isArray(args)
    ? getSqlite().prepare(sql).get(...args)
    : getSqlite().prepare(sql).get(args);
  return row as T | undefined;
}

export async function qAll<T>(sql: string, args: SqlArgs = []): Promise<T[]> {
  if (useTurso()) {
    const { named, list } = toArgs(args);
    const result = Object.keys(named).length
      ? await getTurso().execute({ sql, args: named })
      : await getTurso().execute({ sql, args: list });
    return result.rows as T[];
  }
  const rows = Array.isArray(args)
    ? getSqlite().prepare(sql).all(...args)
    : getSqlite().prepare(sql).all(args);
  return rows as T[];
}

export async function qRun(sql: string, args: SqlArgs = []): Promise<void> {
  if (useTurso()) {
    const { named, list } = toArgs(args);
    if (Object.keys(named).length) {
      await getTurso().execute({ sql, args: named });
    } else {
      await getTurso().execute({ sql, args: list });
    }
    return;
  }
  if (Array.isArray(args)) {
    getSqlite().prepare(sql).run(...args);
  } else {
    getSqlite().prepare(sql).run(args);
  }
}

/** Raw sqlite handle for local scripts only (seed, migrations). */
export function getLocalSqlite(): Database.Database {
  return getSqlite();
}
