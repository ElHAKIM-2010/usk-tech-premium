"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "usk-cart-v1";
const MAX_QUANTITY = 99;
const EMPTY_LINES: CartLine[] = [];

export interface CartLine {
  slug: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  ready: boolean;
  addItem: (slug: string, quantity?: number, maxStock?: number) => void;
  setQuantity: (slug: string, quantity: number, maxStock?: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY_LINES;
let hasCache = false;
let persistEnabled = true;

function clampQuantity(quantity: number, maxStock?: number) {
  if (!Number.isFinite(quantity)) return 0;

  const max = Math.max(1, Math.min(MAX_QUANTITY, maxStock ?? MAX_QUANTITY));
  return Math.min(max, Math.max(1, Math.floor(quantity)));
}

function sanitizeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];

  const merged = new Map<string, number>();

  for (const line of value) {
    if (!line || typeof line !== "object") continue;

    const { slug, quantity } = line as { slug?: unknown; quantity?: unknown };
    if (typeof slug !== "string" || slug.length === 0) continue;
    if (typeof quantity !== "number" || !Number.isFinite(quantity)) continue;

    const safeQuantity = clampQuantity(quantity);
    if (safeQuantity <= 0) continue;

    merged.set(
      slug,
      Math.min(MAX_QUANTITY, (merged.get(slug) ?? 0) + safeQuantity),
    );
  }

  return Array.from(merged, ([slug, quantity]) => ({ slug, quantity }));
}

function parseStored(raw: string) {
  try {
    return sanitizeLines(JSON.parse(raw));
  } catch {
    return EMPTY_LINES;
  }
}

function getLines() {
  if (typeof window === "undefined") return EMPTY_LINES;
  if (!persistEnabled) return cachedLines;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    persistEnabled = false;
    return cachedLines;
  }

  if (hasCache && raw === cachedRaw) return cachedLines;

  cachedRaw = raw;
  cachedLines = raw ? parseStored(raw) : EMPTY_LINES;
  hasCache = true;
  return cachedLines;
}

function getServerLines() {
  return EMPTY_LINES;
}

function getReady() {
  return true;
}

function getNotReady() {
  return false;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeLines(next: CartLine[]) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(next);
  let persisted = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    persistEnabled = false;
    persisted = false;
  }

  cachedRaw = persisted ? raw : null;
  cachedLines = next;
  hasCache = true;

  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;

    hasCache = false;
    for (const listener of listeners) listener();
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getLines, getServerLines);
  const ready = useSyncExternalStore(subscribe, getReady, getNotReady);

  const addItem = useCallback((slug: string, quantity = 1, maxStock?: number) => {
    const safeQuantity = clampQuantity(quantity, maxStock);
    if (safeQuantity <= 0) return;

    const previous = getLines();
    const existing = previous.find((line) => line.slug === slug);

    if (existing) {
      writeLines(
        previous.map((line) =>
          line.slug === slug
            ? {
                ...line,
                quantity: Math.min(
                  Math.min(MAX_QUANTITY, maxStock ?? MAX_QUANTITY),
                  line.quantity + safeQuantity,
                ),
              }
            : line,
        ),
      );
      return;
    }

    writeLines([...previous, { slug, quantity: safeQuantity }]);
  }, []);

  const setQuantity = useCallback(
    (slug: string, quantity: number, maxStock?: number) => {
      const previous = getLines();

      if (quantity <= 0) {
        writeLines(previous.filter((line) => line.slug !== slug));
        return;
      }

      writeLines(
        previous.map((line) =>
          line.slug === slug
            ? { ...line, quantity: clampQuantity(quantity, maxStock) }
            : line,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback((slug: string) => {
    writeLines(getLines().filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => writeLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((total, line) => total + line.quantity, 0),
      ready,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [lines, ready, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus dipakai di dalam CartProvider");

  return context;
}
