import { useEffect, useSyncExternalStore } from "react";

/* Tiny hints that retire themselves: once a visitor uses a feature, its clue never shows again. */

const KEY = "clues.v1";
let seen = new Set<string>();
let loaded = false;
const subs = new Set<() => void>();

const notify = () => subs.forEach((f) => f());

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) seen = new Set(parsed.filter((x): x is string => typeof x === "string"));
    }
  } catch {
    /* storage unavailable: clues simply last for this visit */
  }
  notify();
}

export function dismissClue(id: string) {
  load();
  if (seen.has(id)) return;
  seen = new Set(seen).add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
  notify();
}

export function clueSeen(id: string) {
  load();
  return seen.has(id);
}

export function useClueSeen(id: string) {
  useEffect(load, []);
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => seen.has(id),
    () => false,
  );
}
