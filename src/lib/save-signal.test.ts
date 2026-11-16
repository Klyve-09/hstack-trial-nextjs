import { describe, expect, it } from "vitest";
import { parseSaveSignal, SAVE_EVENT, SAVE_FAILURE_REASONS } from "./save-signal";

const success = {
  event: "pocket_notes.save",
  outcome: "success",
  reason: null,
  operation_id: "00000000-0000-4000-8000-000000000001",
  time: "2026-11-17T00:00:00.000Z",
};

describe("parseSaveSignal", () => {
  it("accepts the documented success object and JSON line", () => {
    expect(SAVE_EVENT).toBe(success.event);
    expect(parseSaveSignal(success)).toEqual(success);
    expect(parseSaveSignal(JSON.stringify(success))).toEqual(success);
  });

  it.each(["quota_exceeded", "storage_unavailable", "corrupt_data", "invalid_input", "unknown"])(
    "accepts the fixed failure reason %s",
    (reason) => {
      expect(SAVE_FAILURE_REASONS).toContain(reason);
      const failure = { ...success, outcome: "failure", reason };
      expect(parseSaveSignal(failure)).toEqual(failure);
    },
  );

  it.each([
    null, [], "not json", {},
    { ...success, event: "other" },
    { ...success, outcome: "other" },
    { ...success, reason: "unknown" },
    { ...success, outcome: "failure", reason: null },
    { ...success, outcome: "failure", reason: "private error message" },
    { ...success, operation_id: "item-id" },
    { ...success, time: "yesterday" },
    { ...success, time: "2026-02-30T00:00:00.000Z" },
    { ...success, title: "private text" },
  ])("rejects malformed or extra data: %j", (value) => {
    expect(parseSaveSignal(value)).toBeNull();
  });
});
