import { useSyncExternalStore } from "react";

import type { IconName } from "./deckRepo";

export const CURRENT_USER = "Yasmien Mingo";

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
  images: number; 
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
// Sample Data Post Online
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
    author: "April Lentejas",
    relation: "friend",
    createdAt: ago(2 * H),
    text: "kapoy so much, karuyag ko nala ma baby:(",
    images: 0,
    hashtags: ["#KAPOY", "#STRESSED"],
    likes: 24,
    comments: 5,
    reposts: 2,
  }),
  makePost({
    id: "p2",
    author: "Marc Cabili",
    relation: "friend",
    createdAt: ago(5 * H),
    text: "miss you bb:(",
    hashtags: ["#imysm"],
    likes: 18,
    comments: 3,
  }),
  makePost({
    id: "p3",
    author: "Kent Ferrer",
    relation: "friend",
    createdAt: ago(26 * H),
    text: "Pakupya la assignment, please:(",
    isQuestion: true,
    hashtags: ["#KaySirVentures:("],
    likes: 9,
    comments: 6,
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