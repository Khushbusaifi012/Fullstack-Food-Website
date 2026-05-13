/**
 * Must stay the first local import in `index.ts` so `.env` is loaded before routes listen.
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const candidates = [
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server", ".env"),
];

for (const filePath of candidates) {
  if (!fs.existsSync(filePath)) continue;
  const result = dotenv.config({ path: filePath });
  if (!result.error) break;
}
