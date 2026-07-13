/**
 * Vercel serverless entry point.
 * handler.mjs is pre-built by esbuild (via artifacts/api-server/build-vercel.mjs)
 * during the Vercel build step. It contains the entire Express app bundled
 * as a self-contained ESM module — no cross-directory TypeScript resolution needed.
 */
export { default } from "./app.mjs";
