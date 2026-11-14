"use client";
import { useMemo, useSyncExternalStore } from "react";
import { getSnapshot, parseItems, subscribe } from "./items";
const getServerSnapshot = () => undefined;

export function useItems() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return useMemo(() => {
    if (snapshot === undefined)
      return { items: [], loading: true, error: false };
    try {
      return { items: parseItems(snapshot), loading: false, error: false };
    } catch {
      return { items: [], loading: false, error: true };
    }
  }, [snapshot]);
}
