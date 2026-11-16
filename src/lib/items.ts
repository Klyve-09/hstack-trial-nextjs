import { SAVE_EVENT, type SaveFailureReason, type SaveSignal } from "./save-signal";

export type Item = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export const STORAGE_KEY = "pocket-notes.items.v1";
const CHANGE_EVENT = "pocket-notes:change";

export function parseItems(raw: string | null): Item[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (
    !Array.isArray(value) ||
    !value.every(
      (item): item is Item =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.body === "string" &&
        typeof item.createdAt === "string" &&
        Number.isFinite(Date.parse(item.createdAt)),
    ) ||
    new Set(value.map((item) => item.id)).size !== value.length
  ) {
    throw new Error("Saved items could not be read.");
  }
  return value;
}

export function readItems(storage: Storage = window.localStorage): Item[] {
  return parseItems(storage.getItem(STORAGE_KEY));
}

export function createItem(
  title: string,
  body: string,
  storage?: Storage,
): Item {
  const operation_id = crypto.randomUUID();
  let reason: SaveFailureReason = "unknown";
  let item: Item;
  try {
    reason = "storage_unavailable";
    const target = storage === undefined ? window.localStorage : storage;
    reason = "unknown";
    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle.length > 120 || body.length > 10000) {
      reason = "invalid_input";
      throw new Error(
        "Use a title of 1–120 characters and a body of at most 10,000 characters.",
      );
    }
    reason = "storage_unavailable";
    const raw = target.getItem(STORAGE_KEY);
    reason = "corrupt_data";
    const items = parseItems(raw);
    reason = "unknown";
    item = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    const serialized = JSON.stringify([item, ...items]);
    reason = "storage_unavailable";
    target.setItem(STORAGE_KEY, serialized);
    reason = "unknown";
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (error) {
    if (
      reason === "storage_unavailable" &&
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      reason = "quota_exceeded";
    }
    const signal: SaveSignal = {
      event: SAVE_EVENT,
      outcome: "failure",
      reason,
      operation_id,
      time: new Date().toISOString(),
    };
    console.warn(JSON.stringify(signal));
    throw error;
  }
  const signal: SaveSignal = {
    event: SAVE_EVENT,
    outcome: "success",
    reason: null,
    operation_id,
    time: new Date().toISOString(),
  };
  console.info(JSON.stringify(signal));
  return item;
}

export function deleteItem(id: string, storage: Storage = window.localStorage) {
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify(readItems(storage).filter((item) => item.id !== id)),
  );
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return "unavailable";
  }
}

export function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
