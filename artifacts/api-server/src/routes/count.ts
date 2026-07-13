import { Router } from "express";
import { count } from "drizzle-orm";
import { db, registrationsTable, settingsTable } from "@workspace/db";

const router = Router();

/** GET /count — public, returns total registration count and current target */
router.get("/count", async (req, res) => {
  try {
    const [[countResult], settings] = await Promise.all([
      db.select({ count: count() }).from(registrationsTable),
      db
        .select({ registrationTarget: settingsTable.registrationTarget })
        .from(settingsTable)
        .limit(1),
    ]);

    const target = settings[0]?.registrationTarget ?? 500;
    res.json({ count: Number(countResult?.count ?? 0), target });
  } catch (err: any) {
    // Log the full underlying pg error so we can see what's really failing
    req.log.error({
      msg: err?.message,
      code: err?.code,
      cause: err?.cause?.message ?? err?.cause,
      detail: err?.detail,
    }, "count query failed");
    res.status(500).json({ error: "Database error", message: err?.message });
  }
});

export default router;
