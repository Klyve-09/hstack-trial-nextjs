import { describe, expect, it } from "vitest";
import { evaluateSaveAlert } from "./save-alert";
import { SAVE_EVENT, type SaveFailureReason, type SaveSignal } from "./save-signal";

const now = new Date("2026-11-17T00:15:00.000Z");
function signal(reason: SaveFailureReason | null = null, time = now.toISOString()): SaveSignal {
  const common = { event: SAVE_EVENT, operation_id: crypto.randomUUID(), time } as const;
  return reason === null
    ? { ...common, outcome: "success", reason }
    : { ...common, outcome: "failure", reason };
}
const traffic = (failures: number, attempts: number) => [
  ...Array.from({ length: failures }, () => signal("storage_unavailable")),
  ...Array.from({ length: attempts - failures }, () => signal()),
];

describe("evaluateSaveAlert", () => {
  it("fires for a burst of storage failures", () => {
    expect(evaluateSaveAlert(traffic(3, 3), now)).toEqual({
      firing: true, failures: 3, attempts: 3, window_minutes: 15, now: now.toISOString(),
    });
  });

  it.each([[0, 0, false], [0, 40, false], [2, 2, false], [3, 40, false], [3, 30, true]])(
    "evaluates %i failures in %i attempts as %s",
    (failures, attempts, firing) => {
      expect(evaluateSaveAlert(traffic(failures, attempts), now)).toMatchObject({ firing, failures, attempts });
    },
  );

  it("includes both window edges, excluding older and future signals", () => {
    const signals = [
      signal("quota_exceeded", "2026-11-17T00:00:00.000Z"),
      signal("unknown", "2026-11-17T00:00:00.001Z"),
      signal("storage_unavailable"),
      signal("quota_exceeded", "2026-11-16T23:59:59.999Z"),
      signal("quota_exceeded", "2026-11-17T00:15:00.001Z"),
      signal(null, "2026-11-17T00:15:00.001Z"),
    ];
    expect(evaluateSaveAlert(signals, now)).toMatchObject({ firing: true, failures: 3, attempts: 3 });
  });

  it("excludes invalid input and corrupt data from failures and attempts", () => {
    const excluded = Array.from({ length: 40 }, () => [signal("invalid_input"), signal("corrupt_data")]).flat();
    expect(evaluateSaveAlert(excluded, now)).toMatchObject({ firing: false, failures: 0, attempts: 0 });
    expect(evaluateSaveAlert([...traffic(3, 30), ...excluded], now)).toMatchObject({ firing: true, failures: 3, attempts: 30 });
  });
});
