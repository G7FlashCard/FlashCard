import { useSyncExternalStore } from "react";

export const ME = "me";

export type ChatMessage = {
  id: string;
  from: string; // ME, or the sender's display name
  text: string;
  sentAt: number; // epoch ms
};

export type Conversation = {
  id: string;
  kind: "direct" | "group";
  name: string;
  members: string[]; // everyone except you
  online: boolean;
  muted: boolean;
  unread: number;
  updatedAt: number;
  messages: ChatMessage[];
};

function at(daysAgo: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

let idCounter = 0;
const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(idCounter++).toString(36)}`;

const msg = (from: string, text: string, sentAt: number): ChatMessage => ({
  id: newId("m"),
  from,
  text,
  sentAt,
});

function makeConversation(
  base: Omit<Conversation, "updatedAt" | "members"> & { members?: string[] }
): Conversation {
  const last = base.messages[base.messages.length - 1];
  return {
    ...base,
    members: base.members ?? [base.name],
    updatedAt: last ? last.sentAt : Date.now(),
  };
}

let conversations: Conversation[] = [
  makeConversation({
    id: "c1",
    kind: "direct",
    name: "Marc Cabili",
    online: true,
    muted: false,
    unread: 2,
    messages: [
      msg("Marc Cabili", "Hi Yas! 👋", at(0, 9, 12)),
      msg("Marc Cabili", "May assignment ka na yas?", at(0, 9, 12)),
      msg(ME, "waray pa boss, ikaw? pa kupya man", at(0, 9, 15)),
      msg("Marc Cabili", "yay waray pa ngani liwat ak", at(0, 9, 16)),
      msg(ME, "edi nga nga nala kit", at(0, 9, 16)),
      msg("Marc Cabili", ":(((((((", at(0, 9, 17)),
    ],
  }),
  makeConversation({
    id: "c4",
    kind: "group",
    name: "Biology Study Group",
    members: ["Marc Cabili", "Kent Hatdog", "John Ashley", "April Lentejas"],
    online: false,
    muted: true,
    unread: 0,
    messages: [msg("kent Hatdog", "Pa kupya mga bossing sa assignment :(", at(1, 17, 2)),
      msg("April Lentejas", "dire gad ak", at (5, 0, 5)),
      msg("Marc Cabili", "adi kupyaha", at (5, 0, 7)),
    ],
  }),
  makeConversation({
    id: "c8",
    kind: "direct",
    name: "April Lentejas",
    online: false,
    muted: false,
    unread: 0,
    messages: [msg("April Lentejas", "pa kupya hehehe", at(4, 8, 45))],
  }),
];

export const CONTACTS = [
  "Marc Cabili",
  "April Lentejas",
];

const listeners = new Set<() => void>();

function setConversations(next: Conversation[]) {
  conversations = next;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getConversations = () => conversations;
export const getConversation = (id: string) => conversations.find((c) => c.id === id);

const getTotalUnread = () =>
  conversations.filter((c) => !c.muted).reduce((sum, c) => sum + c.unread, 0);

export function sendMessage(id: string, text: string) {
  const clean = text.trim();
  if (!clean) return;
  const now = Date.now();
  setConversations(
    conversations.map((c) =>
      c.id === id
        ? { ...c, updatedAt: now, messages: [...c.messages, msg(ME, clean, now)] }
        : c
    )
  );
}

export function markRead(id: string) {
  const c = getConversation(id);
  if (!c || c.unread === 0) return;
  setConversations(conversations.map((x) => (x.id === id ? { ...x, unread: 0 } : x)));
}

export function toggleMute(id: string) {
  setConversations(conversations.map((c) => (c.id === id ? { ...c, muted: !c.muted } : c)));
}

export function removeConversation(id: string) {
  setConversations(conversations.filter((c) => c.id !== id));
}

/** Finds your chat with this person, or starts a new empty one. Returns its id. */
export function getOrCreateDirect(name: string): string {
  const existing = conversations.find((c) => c.kind === "direct" && c.name === name);
  if (existing) return existing.id;

  const id = newId("c");
  setConversations([
    ...conversations,
    {
      id,
      kind: "direct",
      name,
      members: [name],
      online: false,
      muted: false,
      unread: 0,
      updatedAt: Date.now(),
      messages: [],
    },
  ]);
  return id;
}

export const useConversations = () => useSyncExternalStore(subscribe, getConversations, getConversations);

export function useConversation(id?: string) {
  const all = useConversations();
  return id ? all.find((c) => c.id === id) : undefined;
}

/** Unread messages across chats that aren't muted (for the tab badge). */
export const useTotalUnread = () => useSyncExternalStore(subscribe, getTotalUnread, getTotalUnread);

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const daysAgoOf = (ts: number) => Math.round((startOfDay(Date.now()) - startOfDay(ts)) / 86_400_000);

export const sameDay = (a: number, b: number) => startOfDay(a) === startOfDay(b);

/** "9:12 AM" */
export function formatTime(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h < 12 ? "AM" : "PM"}`;
}

/** Time for the chat list: "10:24 AM", "Yesterday", "Fri", "Sep 14" */
export function formatListTime(ts: number) {
  const diff = daysAgoOf(ts);
  if (diff <= 0) return formatTime(ts);
  if (diff === 1) return "Yesterday";
  const d = new Date(ts);
  if (diff < 7) return WEEKDAYS[d.getDay()];
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Day divider label inside a chat: "Today", "Yesterday", "Fri, Sep 18" */
export function formatDayLabel(ts: number) {
  const diff = daysAgoOf(ts);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  const d = new Date(ts);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** One-line preview shown in the chat list. */
export function previewOf(c: Conversation) {
  const last = c.messages[c.messages.length - 1];
  if (!last) return "Say hi 👋";
  if (last.from === ME) return `You: ${last.text}`;
  if (c.kind === "group") return `${last.from.split(" ")[0]}: ${last.text}`;
  return last.text;
}