import { describe, expect, it, vi, afterEach } from "vitest";
import { parseSaveSignal } from "./save-signal";
import {
  createItem,
  deleteItem,
  parseItems,
  readItems,
  STORAGE_KEY,
  subscribe,
} from "./items";

afterEach(() => vi.restoreAllMocks());

describe("items storage", () => {
  it("starts empty and persists new items newest first", () => {
    expect(readItems()).toEqual([]);
    const first = createItem("  A thought  ", "  Keep this.  ");
    const second = createItem("Another", "");
    expect(readItems()).toEqual([second, first]);
    expect(first.title).toBe("A thought");
    expect(first.body).toBe("Keep this.");
    expect(first.id).not.toBe(second.id);
    expect(Number.isFinite(Date.parse(first.createdAt))).toBe(true);
  });
  it("deletes only the selected item and tolerates a missing id", () => {
    const first = createItem("One", "");
    const second = createItem("Two", "");
    deleteItem(first.id);
    deleteItem("missing");
    expect(readItems()).toEqual([second]);
  });
  it("rejects blank or oversized input without changing storage", () => {
    expect(() => createItem("   ", "")).toThrow();
    expect(() => createItem("a".repeat(121), "")).toThrow();
    expect(() => createItem("Title", "a".repeat(10001))).toThrow();
    expect(readItems()).toEqual([]);
  });
  it.each([
    "not json",
    "{}",
    '[{"id":"one"}]',
    '[{"id":"one","title":"A","body":"","createdAt":"invalid"}]',
  ])("rejects corrupt data: %s", (raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(() => readItems()).toThrow();
    expect(() => createItem("New", "")).toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });
  it("rejects duplicate ids", () => {
    const item = createItem("Title", "");
    expect(() => parseItems(JSON.stringify([item, item]))).toThrow();
  });
  it("surfaces write failures without changing existing items", () => {
    const item = createItem("Keep", "");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    expect(() => createItem("New", "")).toThrow();
    expect(() => deleteItem(item.id)).toThrow();
    expect(readItems()).toEqual([item]);
  });
  it("notifies subscribers for local writes and changes from other tabs", () => {
    const listener = vi.fn();
    const stop = subscribe(listener);
    createItem("New", "");
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
    deleteItem(readItems()[0].id);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("save signals", () => {
  const title = "private title";
  const body = "private body";
  const secret = "private stored text or error message";

  function capture() {
    return {
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    };
  }

  function expectSignal(
    logs: ReturnType<typeof capture>,
    reason: string | null,
  ) {
    const calls = [...logs.info.mock.calls, ...logs.warn.mock.calls];
    expect(calls).toHaveLength(1);
    expect(calls[0]).toHaveLength(1);
    expect(typeof calls[0][0]).toBe("string");
    const signal = JSON.parse(calls[0][0]);
    expect(signal).toEqual({
      event: "pocket_notes.save",
      outcome: reason === null ? "success" : "failure",
      reason,
      operation_id: expect.any(String),
      time: expect.any(String),
    });
    expect(parseSaveSignal(calls[0][0])).toEqual(signal);
    expect(new Date(signal.time).toISOString()).toBe(signal.time);
    expect(logs.info).toHaveBeenCalledTimes(reason === null ? 1 : 0);
    expect(logs.warn).toHaveBeenCalledTimes(reason === null ? 0 : 1);
    for (const sensitive of [title, body, secret]) {
      expect(calls[0][0]).not.toContain(sensitive);
    }
    return signal;
  }

  it("emits one success with a fresh operation id for each attempt", () => {
    const logs = capture();
    const item = createItem(title, body);
    const first = expectSignal(logs, null);
    expect(first.operation_id).not.toBe(item.id);
    logs.info.mockClear();
    createItem(title, body);
    const second = expectSignal(logs, null);
    expect(second.operation_id).not.toBe(first.operation_id);
  });

  it("also gives failed attempts their own operation id", () => {
    const logs = capture();
    expect(() => createItem(" ", body)).toThrow();
    const failure = expectSignal(logs, "invalid_input");
    logs.warn.mockClear();
    createItem(title, body);
    const success = expectSignal(logs, null);
    expect(failure.operation_id).not.toBe(success.operation_id);
  });

  it("classifies QuotaExceededError without disclosing the error message", () => {
    const logs = capture();
    const error = new DOMException(secret, "QuotaExceededError");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw error;
    });
    expect(() => createItem(title, body)).toThrow(error);
    expectSignal(logs, "quota_exceeded");
    expect(readItems()).toEqual([]);
  });

  it.each(["getItem", "setItem"] as const)("signals unavailable storage on %s", (method) => {
    const logs = capture();
    const error = new Error("quota_exceeded " + secret);
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw error;
    });
    expect(() => createItem(title, body)).toThrow(error);
    expectSignal(logs, "storage_unavailable");
  });

  it("catches failure to access the default localStorage argument", () => {
    const logs = capture();
    const error = new DOMException(secret, "SecurityError");
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw error;
    });
    expect(() => createItem(title, body)).toThrow(error);
    expectSignal(logs, "storage_unavailable");
  });

  it("signals missing storage", () => {
    const logs = capture();
    vi.spyOn(window, "localStorage", "get").mockReturnValue(undefined as unknown as Storage);
    expect(() => createItem(title, body)).toThrow();
    expectSignal(logs, "storage_unavailable");
  });

  it.each([secret, JSON.stringify({ text: secret })])("signals corrupt data without exposing it", (raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    const logs = capture();
    expect(() => createItem(title, body)).toThrow();
    expectSignal(logs, "corrupt_data");
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it.each([[" ", body], [title.repeat(20), body], [title, body.repeat(2000)]])(
    "signals invalid input without storing or disclosing it",
    (inputTitle, inputBody) => {
      const logs = capture();
      expect(() => createItem(inputTitle, inputBody)).toThrow();
      expectSignal(logs, "invalid_input");
      expect(readItems()).toEqual([]);
    },
  );

  it("signals unexpected failures without using error.message as a reason", () => {
    const logs = capture();
    const error = new Error("quota_exceeded " + secret);
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000001")
      .mockImplementationOnce(() => {
        throw error;
      });
    expect(() => createItem(title, body)).toThrow(error);
    expectSignal(logs, "unknown");
    expect(readItems()).toEqual([]);
  });
});
