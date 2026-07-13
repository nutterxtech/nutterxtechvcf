/**
 * Lightweight schema bootstrap — runs CREATE TABLE IF NOT EXISTS for every
 * table via raw SQL so the app is self-healing on a fresh database.
 *
 * Called once at server startup (or on the first Vercel cold start).
 * Safe to run on every boot: all statements are idempotent.
 */
import pg from "pg";

export async function ensureSchema(databaseUrl: string): Promise<void> {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined,
    connectionTimeoutMillis: 10_000,
  });

  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "registrations" (
        "id"         serial PRIMARY KEY,
        "name"       text NOT NULL,
        "phone"      text NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "settings" (
        "id"                   serial PRIMARY KEY,
        "company_name"         text NOT NULL DEFAULT 'Nutterx Technologies',
        "title"                text NOT NULL DEFAULT 'Technology Solutions Company',
        "phone"                text NOT NULL DEFAULT '',
        "email"                text NOT NULL DEFAULT '',
        "website"              text NOT NULL DEFAULT '',
        "address"              text NOT NULL DEFAULT '',
        "registration_target"  integer NOT NULL DEFAULT 500,
        "updated_at"           timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "session" (
        "sid"    varchar NOT NULL COLLATE "default",
        "sess"   json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
      );

      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

      -- Seed a default settings row so reads never return null
      INSERT INTO "settings" DEFAULT VALUES ON CONFLICT DO NOTHING;
    `);
  } finally {
    await client.end();
  }
}
