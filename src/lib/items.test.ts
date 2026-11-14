import { describe, expect, it, vi, afterEach } from "vitest";
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
