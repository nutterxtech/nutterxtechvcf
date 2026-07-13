import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

// Augment express-session with our admin field
declare module "express-session" {
  interface SessionData {
    adminUsername: string;
  }
}

const app = express();

// Security headers
app.use(helmet());

// Logging
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: { id: unknown; method: string; url?: string }) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res: { statusCode: number }) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// CORS — reflect the request origin with credentials (works for Replit + Vercel)
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
// - Production (Vercel + Supabase): uses connect-pg-simple so sessions survive
//   across serverless invocations. DATABASE_URL must be set in Vercel env vars.
// - Local dev (Replit): falls back to in-memory (fine for a long-running process).
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  logger.warn("SESSION_SECRET not set — using insecure fallback.");
}

const databaseUrl = process.env.DATABASE_URL;

let sessionStore: session.Store | undefined;
if (databaseUrl) {
  const PgStore = connectPgSimple(session);
  sessionStore = new PgStore({
    conString: databaseUrl,
    createTableIfMissing: true,
    // Keep session rows tidy — prune expired sessions daily
    pruneSessionInterval: 60 * 60 * 24,
  });
  logger.info("Session store: PostgreSQL (connect-pg-simple)");
} else {
  logger.warn("DATABASE_URL not set — using in-memory session store (not suitable for production).");
}

app.use(
  session({
    store: sessionStore,
    secret: sessionSecret ?? "dev-secret-please-set-SESSION_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 h
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use("/api", router);

export default app;
