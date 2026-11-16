export type Item = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  pinned?: boolean;
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
        (item.pinned === undefined || typeof item.pinned === "boolean") &&
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
  storage: Storage = window.localStorage,
): Item {
  const cleanTitle = title.trim();
  if (!cleanTitle || cleanTitle.length > 120 || body.length > 10000) {
    throw new Error(
      "Use a title of 1–120 characters and a body of at most 10,000 characters.",
    );
  }
  const items = readItems(storage);
  const item: Item = {
    id: crypto.randomUUID(),
    title: cleanTitle,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  storage.setItem(STORAGE_KEY, JSON.stringify([item, ...items]));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return item;
}

export function toggleItemPin(id: string, storage: Storage = window.localStorage) {
  const items = readItems(storage);
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error("Item not found.");
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      items.map((entry) =>
        entry.id === id ? { ...entry, pinned: !entry.pinned } : entry,
      ),
    ),
  );
  window.dispatchEvent(new Event(CHANGE_EVENT));
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
