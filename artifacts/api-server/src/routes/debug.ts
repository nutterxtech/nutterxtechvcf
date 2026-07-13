import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

/**
 * GET /api/debug — temporary diagnostic endpoint.
 * Runs a raw SELECT 1 against the pool and returns the actual pg error
 * (no credentials exposed). Remove this route once the DB issue is resolved.
 */
router.get("/debug", async (req, res) => {
  const dbUrl = process.env.DATABASE_URL;

  const info: Record<string, unknown> = {
    DATABASE_URL: dbUrl ? `set (${dbUrl.replace(/:([^:@]+)@/, ":***@")})` : "NOT SET",
    NODE_ENV: process.env.NODE_ENV ?? "not set",
  };

  try {
    const result = await pool.query("SELECT 1 AS ok, current_database() AS db, current_user AS usr");
    info.connection = "OK";
    info.row = result.rows[0];
  } catch (err: any) {
    info.connection = "FAILED";
    info.error = err?.message ?? String(err);
    info.code = err?.code;
    info.detail = err?.detail;
    info.hint = err?.hint;
    info.cause = err?.cause?.message ?? null;
  }

  res.json(info);
});

export default router;
