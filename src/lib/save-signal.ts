export const SAVE_EVENT = "pocket_notes.save";
export const SAVE_FAILURE_REASONS = [
  "quota_exceeded",
  "storage_unavailable",
  "corrupt_data",
  "invalid_input",
  "unknown",
] as const;

export type SaveFailureReason = (typeof SAVE_FAILURE_REASONS)[number];
export type SaveSignal = {
  event: typeof SAVE_EVENT;
  operation_id: string;
  time: string;
} & (
  | { outcome: "success"; reason: null }
  | { outcome: "failure"; reason: SaveFailureReason }
);

export function parseSaveSignal(input: unknown): SaveSignal | null {
  let value: unknown = input;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null) return null;
  const signal = value as Record<string, unknown>;
  if (
    Object.keys(signal).length !== 5 ||
    signal.event !== SAVE_EVENT ||
    typeof signal.operation_id !== "string" ||
    !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(signal.operation_id) ||
    typeof signal.time !== "string" ||
    !Number.isFinite(Date.parse(signal.time)) ||
    new Date(signal.time).toISOString() !== signal.time ||
    !(
      (signal.outcome === "success" && signal.reason === null) ||
      (signal.outcome === "failure" &&
        SAVE_FAILURE_REASONS.some((reason) => reason === signal.reason))
    )
  ) {
    return null;
  }
  return signal as SaveSignal;
}
