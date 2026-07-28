import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Cloudflare Workers Builds for hogback-docs-admin still validates/deploys from
 * the repo root when Root directory is unset. Preview deploys default to
 * `npx wrangler versions upload` at the root, which reads `./out`.
 * Copy the admin export there during Workers CI only.
 */
if (process.env.WORKERS_CI !== "1") {
  process.exit(0);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const adminDir = path.resolve(scriptDir, "..");
const adminOut = path.join(adminDir, "out");
const rootOut = path.resolve(adminDir, "../../out");

await rm(rootOut, { recursive: true, force: true });
await cp(adminOut, rootOut, { recursive: true });
console.log(`Synced ${adminOut} -> ${rootOut} for Workers CI preview deploy`);
