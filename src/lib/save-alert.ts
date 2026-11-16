import type { SaveSignal } from "./save-signal.ts";

export const SAVE_ALERT_WINDOW_MINUTES = 15;
export const SAVE_ALERT_MIN_FAILURES = 3;
export const SAVE_ALERT_MIN_FAILURE_RATIO = 0.1;

export function evaluateSaveAlert(signals: readonly SaveSignal[], now: Date) {
  const end = now.getTime();
  const start = end - SAVE_ALERT_WINDOW_MINUTES * 60_000;
  let failures = 0;
  let attempts = 0;

  for (const signal of signals) {
    const time = Date.parse(signal.time);
    if (time < start || time > end) continue;
    if (signal.outcome === "success") {
      attempts++;
    } else if (
      signal.reason === "quota_exceeded" ||
      signal.reason === "storage_unavailable" ||
      signal.reason === "unknown"
    ) {
      failures++;
      attempts++;
    }
  }

  return {
    firing: failures >= SAVE_ALERT_MIN_FAILURES &&
      failures / attempts >= SAVE_ALERT_MIN_FAILURE_RATIO,
    failures,
    attempts,
    window_minutes: SAVE_ALERT_WINDOW_MINUTES,
    now: now.toISOString(),
  };
}
