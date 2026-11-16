import { readFileSync } from "node:fs";
import { evaluateSaveAlert } from "../src/lib/save-alert.ts";
import { parseSaveSignal, type SaveSignal } from "../src/lib/save-signal.ts";

function parseNow(value: string): Date {
  const match = /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  const date = new Date(value);
  if (
    !match ||
    !Number.isFinite(date.getTime()) ||
    new Date(`${match[1]}T00:00:00.000Z`).toISOString().slice(0, 10) !== match[1]
  ) {
    throw new Error("Invalid --now: expected an ISO timestamp with a timezone");
  }
  return date;
}

try {
  const args = process.argv.slice(2);
  if (
    (args.length !== 1 && args.length !== 3) ||
    !args[0] || args[0].startsWith("--") ||
    (args.length === 3 && args[1] !== "--now")
  ) {
    throw new Error("Usage: npm run alert:save -- <signals.jsonl> [--now <ISO>]");
  }
  const now = args.length === 3 ? parseNow(args[2]) : new Date();
  const lines = readFileSync(args[0], "utf8").split(/\r?\n/);
  const signals: SaveSignal[] = [];
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;
    const start = line.indexOf("{");
    const signal = start === -1 ? null : parseSaveSignal(line.slice(start));
    if (!signal) throw new Error(`Invalid save signal on line ${index + 1}`);
    signals.push(signal);
  }
  const summary = evaluateSaveAlert(signals, now);
  console.log(JSON.stringify(summary));
  process.exitCode = summary.firing ? 1 : 0;
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unable to check save alert");
  process.exitCode = 2;
}
