import { Router } from "express";
import { count } from "drizzle-orm";
import { db, registrationsTable } from "@workspace/db";

const router = Router();

/** GET /count — public, returns total registration count */
router.get("/count", async (req, res) => {
  const [result] = await db.select({ count: count() }).from(registrationsTable);
  res.json({ count: Number(result?.count ?? 0) });
});

export default router;
