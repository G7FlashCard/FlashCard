import { useSyncExternalStore } from "react";

import { DECKS, Deck, IconName } from "./deckData";
import { colors } from "./theme";

// ---------------------------------------------------------------------------
// A tiny module-level store so every screen sees the same decks.
// No provider or _layout changes needed. Swap for real storage/backend later.
// ---------------------------------------------------------------------------

export type DeckInput = {
  title: string;
  description: string;
  subject: string;
  isPrivate: boolean;
};

type Cover = { icon: IconName; color: string; tint: string };

const LEAF: Cover = { icon: "leaf", color: "#22A559", tint: "#DDF5E7" };
const FLASK: Cover = { icon: "flask", color: colors.primary, tint: colors.primarySoft };
const CALCULATOR: Cover = { icon: "calculator", color: "#E5484D", tint: "#FDE7E7" };
const CODE: Cover = { icon: "code-slash", color: colors.primary, tint: colors.primarySoft };
const BOOK: Cover = { icon: "book", color: "#D97706", tint: "#FEF3C7" };
const LIBRARY: Cover = { icon: "library", color: "#E5484D", tint: "#FDE7E7" };
const EARTH: Cover = { icon: "earth", color: "#8B5CF6", tint: "#EDE9FE" };

const COVER_RULES: { match: RegExp; cover: Cover }[] = [
  { match: /bio|plant|nature|animal|ecolog/, cover: LEAF },
  { match: /sci|chem|physic|lab/, cover: FLASK },
  { match: /math|algebra|calcul|geometr|statist/, cover: CALCULATOR },
  { match: /code|coding|program|software|comput|tech/, cover: CODE },
  { match: /lang|english|spanish|french|japanese|tagalog|vocab|grammar/, cover: BOOK },
  { match: /histor|social|civic|politic/, cover: LIBRARY },
  { match: /geo|world|earth|map/, cover: EARTH },
];

const FALLBACK_COVERS: Cover[] = [
  { icon: "school", color: colors.primary, tint: colors.primarySoft },
  { icon: "bulb", color: "#D97706", tint: "#FEF3C7" },
  { icon: "bookmarks", color: "#8B5CF6", tint: "#EDE9FE" },
  { icon: "albums", color: "#0D9488", tint: "#CCFBF1" },
];

function matchCover(text: string): Cover | null {
  const t = text.toLowerCase();
  return COVER_RULES.find((r) => r.match.test(t))?.cover ?? null;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let decks: Deck[] = DECKS;
const listeners = new Set<() => void>();

function setDecks(next: Deck[]) {
  decks = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => decks;

export function useDecks(): Deck[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useDeck(id?: string): Deck | undefined {
  const all = useDecks();
  return all.find((d) => d.id === id);
}

export function addDeck(input: DeckInput): Deck {
  const cover =
    matchCover(`${input.subject} ${input.title}`) ??
    FALLBACK_COVERS[decks.length % FALLBACK_COVERS.length];

  const deck: Deck = {
    id: `deck-${Date.now()}`,
    cardCount: 0,
    ...cover,
    ...input,
  };
  setDecks([deck, ...decks]);
  return deck;
}

export function updateDeck(id: string, input: DeckInput) {
  setDecks(
    decks.map((d) => {
      if (d.id !== id) return d;
      // Only change the icon if the new title/subject clearly points to one.
      const cover = matchCover(`${input.subject} ${input.title}`);
      return { ...d, ...input, ...(cover ?? {}) };
    })
  );
}

export function deleteDeck(id: string) {
  setDecks(decks.filter((d) => d.id !== id));
}

export function duplicateDeck(id: string): Deck | null {
  const index = decks.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const copy: Deck = {
    ...decks[index],
    id: `deck-${Date.now()}`,
    title: `${decks[index].title} (Copy)`,
  };
  setDecks([...decks.slice(0, index + 1), copy, ...decks.slice(index + 1)]);
  return copy;
}

// ---------------------------------------------------------------------------
// NEW: bump/decrement a deck's cardCount without touching its other fields.
// Used by cardStore so adding/deleting a card keeps the deck row in sync.
// ---------------------------------------------------------------------------

export function adjustCardCount(id: string, delta: number) {
  setDecks(
    decks.map((d) => (d.id === id ? { ...d, cardCount: Math.max(0, d.cardCount + delta) } : d))
  );
}