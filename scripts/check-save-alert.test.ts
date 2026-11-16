import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const now = "2026-11-17T00:15:00.000Z";
const success = { event: "pocket_notes.save", outcome: "success", reason: null, operation_id: "00000000-0000-4000-8000-000000000001", time: now };
const failure = { ...success, outcome: "failure", reason: "storage_unavailable" };
const dirs: string[] = [];
function file(content: string) {
  const dir = mkdtempSync(join(tmpdir(), "save-alert-test-"));
  dirs.push(dir);
  const path = join(dir, "signals.jsonl");
  writeFileSync(path, content);
  return path;
}
const run = (...args: string[]) => spawnSync(process.execPath, ["scripts/check-save-alert.ts", ...args], { encoding: "utf8" });
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true }); });

describe("check-save-alert command", () => {
  it.each([false, true])("returns the summary and exit code for firing=%s", (firing) => {
    const lines = firing ? Array.from({ length: 3 }, () => `warn ${JSON.stringify(failure)}`) : [JSON.stringify(success)];
    const result = run(file(`\n${lines.join("\n")}\n \n`), "--now", now);
    expect(result.status).toBe(firing ? 1 : 0);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(result.stdout)).toEqual({ firing, failures: firing ? 3 : 0, attempts: firing ? 3 : 1, window_minutes: 15, now });
  });

  it("uses the current time when --now is omitted", () => {
    const before = Date.now();
    const result = run(file(""));
    const after = Date.now();
    expect(result.status).toBe(0);
    const summary = JSON.parse(result.stdout);
    expect(summary).toMatchObject({ firing: false, failures: 0, attempts: 0, window_minutes: 15 });
    expect(Date.parse(summary.now)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(summary.now)).toBeLessThanOrEqual(after);
  });

  it.each(["not json", "warn {}", `${JSON.stringify(success)} trailing`, `${JSON.stringify(success)}\ninvalid`])(
    "rejects malformed non-blank input %s", (content) => {
      const result = run(file(content), "--now", now);
      expect(result.status).toBe(2);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain("line");
    },
  );

  it("rejects bad usage, unreadable files and invalid dates", () => {
    const path = file("");
    for (const args of [[], ["--now", now], [path, "--now"], [path, "--now", "yesterday"], [path, "--now", "2026-02-30T00:00:00.000Z"], [path, "--now", "2026-11-17"], [path, "--other"], [path, "extra"], [path, "--now", now, "--now", now], [`${path}.missing`]]) {
      const result = run(...args);
      expect(result.status, args.join(" ")).toBe(2);
      expect(result.stdout).toBe("");
      expect(result.stderr.length).toBeGreaterThan(0);
    }
  });
});
