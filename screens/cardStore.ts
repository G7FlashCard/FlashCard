import { useSyncExternalStore } from "react";

import { adjustCardCount } from "./deckStore";

export type Card = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  imageUri?: string;
  favorite?: boolean;
  createdAt: number;
};

export type CardInput = {
  front: string;
  back: string;
  imageUri?: string;
};

let cards: Card[] = [];
const listeners = new Set<() => void>();

function setCards(next: Card[]) {
  cards = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => cards;

export function useCards(deckId?: string): Card[] {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return deckId ? all.filter((c) => c.deckId === deckId) : all;
}

export function addCard(deckId: string, input: CardInput): Card {
  const card: Card = {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    deckId,
    createdAt: Date.now(),
    ...input,
  };
  setCards([...cards, card]);
  adjustCardCount(deckId, 1); 
  return card;
}

export function addCards(deckId: string, inputs: CardInput[]): Card[] {
  if (inputs.length === 0) return [];
  const now = Date.now();
  const newCards: Card[] = inputs.map((input, i) => ({
    id: `card-${now}-${i}-${Math.random().toString(36).slice(2, 7)}`,
    deckId,
    createdAt: now,
    ...input,
  }));
  setCards([...cards, ...newCards]);
  adjustCardCount(deckId, newCards.length);
  return newCards;
}

export function toggleFavorite(id: string) {
  setCards(cards.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));
}

export function deleteCard(id: string) {
  const card = cards.find((c) => c.id === id);
  if (!card) return;
  setCards(cards.filter((c) => c.id !== id));
  adjustCardCount(card.deckId, -1);
}