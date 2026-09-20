import { useSyncExternalStore } from "react";
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export type StoredDeck = {
  id: string;
  title: string;
  cardCount: number;
  subject?: string;
  description?: string;
  icon: IconName;
  tint: string; // icon tile background
  color: string; // icon color
  favorite: boolean;
};

// ---------------------------------------------------------------------------
// One shared list of decks for the whole app (Home, Decks tab, Deck Options,
// Create Quiz). It lives in memory, so it resets when the app restarts.
// Swap the internals for AsyncStorage / a backend later; screens won't change.
// ---------------------------------------------------------------------------

let decks: StoredDeck[] = [
  {
    id: "1",
    title: "Biology",
    cardCount: 24,
    subject: "Science",
    description: "Overview of basic biology concepts.",
    icon: "leaf-outline",
    tint: "#E7FBEE",
    color: "#22C55E",
    favorite: false,
  },
];

const listeners = new Set<() => void>();

function setDecks(next: StoredDeck[]) {
  decks = next;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getDecks = () => decks;
export const getDeck = (id: string) => decks.find((deck) => deck.id === id);

export const addDeck = (deck: StoredDeck) => setDecks([...decks, deck]);

export const updateDeck = (id: string, patch: Partial<StoredDeck>) =>
  setDecks(decks.map((deck) => (deck.id === id ? { ...deck, ...patch } : deck)));

export const removeDeck = (id: string) => setDecks(decks.filter((deck) => deck.id !== id));

export function duplicateDeck(id: string): StoredDeck | undefined {
  const original = getDeck(id);
  if (!original) return undefined;
  const copy: StoredDeck = {
    ...original,
    id: String(Date.now()),
    title: `${original.title} (Copy)`,
    favorite: false,
  };
  setDecks([...decks, copy]);
  return copy;
}

/** All decks. Re-renders the screen whenever a deck is added, changed or removed. */
export const useDecks = () => useSyncExternalStore(subscribe, getDecks, getDecks);

/** One deck by id, or undefined if it doesn't exist (e.g. it was deleted). */
export function useDeck(id?: string) {
  const all = useDecks();
  return id ? all.find((deck) => deck.id === id) : undefined;
}