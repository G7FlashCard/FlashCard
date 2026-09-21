import { useSyncExternalStore } from "react";

import type { IconName } from "./deckRepo";

export const CURRENT_USER = "April Lentejas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Audience = "public" | "friends" | "private";

export const AUDIENCES: { key: Audience; label: string; icon: IconName; hint: string }[] = [
  { key: "public", label: "Public", icon: "globe-outline", hint: "Anyone on FlashLearn" },
  { key: "friends", label: "Friends", icon: "people-outline", hint: "Only your friends" },
  { key: "private", label: "Only me", icon: "lock-closed-outline", hint: "Only you can see this" },
];

export type Mood = { emoji: string; label: string };

export const MOODS: Mood[] = [
  { emoji: "😊", label: "Happy" },
  { emoji: "🤓", label: "Focused" },
  { emoji: "💪", label: "Motivated" },
  { emoji: "🎉", label: "Excited" },
  { emoji: "😅", label: "Stressed" },
  { emoji: "😴", label: "Tired" },
];

export const ACHIEVEMENTS = ["7-Day Streak", "First Deck", "Quiz Whiz", "Perfect Score", "Bookworm"];

export type PostStats = { cards: number; quiz: number; streak: number };

export type PostDeck = {
  id: string;
  title: string;
  cardCount: number;
  icon: IconName;
  color: string;
  tint: string;
};

/** How the author relates to you. Drives the Following / Friends filters. */
export type Relation = "me" | "friend" | "following" | "other";

export type Post = {
  id: string;
  author: string;
  relation: Relation;
  createdAt: number;
  text: string;
  audience: Audience;
  mood?: Mood;
  location?: string;
  taggedFriends: string[];
  deck?: PostDeck;
  hashtags: string[];
  stats?: PostStats;
  achievement?: string;
  isQuestion?: boolean;
  images: number; // placeholder photo count (sample posts only)
  likes: number;
  liked: boolean;
  comments: number;
  reposts: number;
  reposted: boolean;
  saved: boolean;
};

export type NewPost = {
  text: string;
  audience: Audience;
  mood?: Mood;
  location?: string;
  taggedFriends: string[];
  deck?: PostDeck;
  hashtags: string[];
  stats?: PostStats;
  achievement?: string;
  isQuestion?: boolean;
};

// ---------------------------------------------------------------------------
// Sample data + in-memory store (resets when the app restarts). Swap the
// internals for a backend later; the screens won't need to change.
// ---------------------------------------------------------------------------

const H = 3_600_000;
const ago = (ms: number) => Date.now() - ms;

function makePost(
  base: Partial<Post> & Pick<Post, "id" | "author" | "relation" | "createdAt" | "text">
): Post {
  return {
    audience: "public",
    taggedFriends: [],
    hashtags: [],
    images: 0,
    likes: 0,
    liked: false,
    comments: 0,
    reposts: 0,
    reposted: false,
    saved: false,
    ...base,
  };
}

let posts: Post[] = [
  makePost({
    id: "p1",
    author: "Alex Cruz",
    relation: "friend",
    createdAt: ago(2 * H),
    text: "Finally finished my Biology notes! 🧬\nConsistency really pays off.",
    images: 2,
    hashtags: ["#Biology"],
    likes: 24,
    comments: 5,
    reposts: 2,
  }),
  makePost({
    id: "p2",
    author: "Sophie Tan",
    relation: "friend",
    createdAt: ago(5 * H),
    text: "Small progress today, but still progress! 💪\nReviewed 50 cards and got 85% on my quiz. Proud of myself! ✨",
    stats: { cards: 50, quiz: 85, streak: 7 },
    hashtags: ["#StudyGram", "#Progress", "#KeepGoing"],
    likes: 18,
    comments: 3,
  }),
  makePost({
    id: "p3",
    author: "Mia Santos",
    relation: "friend",
    createdAt: ago(26 * H),
    text: "Anyone here taking Math? I'm having a hard time with integration. Can someone explain this? 😅",
    isQuestion: true,
    hashtags: ["#Math"],
    likes: 9,
    comments: 6,
  }),
  makePost({
    id: "p4",
    author: "John Reyes",
    relation: "following",
    createdAt: ago(50 * H),
    text: "Just finished building my Biology deck. Feel free to use it for your review!",
    deck: {
      id: "1",
      title: "Biology",
      cardCount: 24,
      icon: "leaf-outline",
      color: "#22C55E",
      tint: "#E7FBEE",
    },
    hashtags: ["#Biology", "#Flashcards"],
    likes: 31,
    comments: 4,
    reposts: 7,
  }),
  makePost({
    id: "p5",
    author: "Priya Patel",
    relation: "other",
    createdAt: ago(74 * H),
    text: "Hit a 30-day streak today! Small steps really do add up. 🔥",
    achievement: "30-Day Streak",
    hashtags: ["#KeepGoing"],
    likes: 52,
    comments: 8,
    reposts: 3,
  }),
];

const listeners = new Set<() => void>();

function setPosts(next: Post[]) {
  posts = next;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getPosts = () => posts;

let idCounter = 0;

export function addPost(input: NewPost) {
  const post = makePost({
    id: `p${Date.now().toString(36)}${(idCounter++).toString(36)}`,
    author: CURRENT_USER,
    relation: "me",
    createdAt: Date.now(),
    ...input,
  });
  setPosts([post, ...posts]);
}

const patch = (id: string, change: (p: Post) => Post) =>
  setPosts(posts.map((p) => (p.id === id ? change(p) : p)));

export const toggleLike = (id: string) =>
  patch(id, (p) => ({ ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }));

export const toggleRepost = (id: string) =>
  patch(id, (p) => ({ ...p, reposted: !p.reposted, reposts: p.reposts + (p.reposted ? -1 : 1) }));

export const toggleSave = (id: string) => patch(id, (p) => ({ ...p, saved: !p.saved }));

export const removePost = (id: string) => setPosts(posts.filter((p) => p.id !== id));

export const usePosts = () => useSyncExternalStore(subscribe, getPosts, getPosts);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** "Just now", "12m ago", "2h ago", "3d ago", "Sep 14" */
export function timeAgo(ts: number) {
  const minutes = Math.floor((Date.now() - ts) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const d = new Date(ts);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/** Pulls "#hashtags" out of free text. */
export function extractHashtags(text: string): string[] {
  return text.match(/#[A-Za-z0-9_]+/g) ?? [];
}

/** Turns "Biology, #StudyGram  Math" into ["#Biology", "#StudyGram", "#Math"]. */
export function parseTags(input: string): string[] {
  const tags = input
    .split(/[\s,]+/)
    .map((word) => word.replace(/^#+/, "").replace(/[^A-Za-z0-9_]/g, ""))
    .filter(Boolean)
    .map((word) => `#${word}`);
  return Array.from(new Set(tags));
}