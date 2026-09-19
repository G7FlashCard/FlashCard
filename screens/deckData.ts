import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

import { colors } from "./theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export type Deck = {
  id: string;
  title: string;
  cardCount: number;
  icon: IconName;
  color: string;
  tint: string;
  description?: string;
  subject?: string;
  isPrivate?: boolean;
};

export const DECKS: Deck[] = [
  { id: "1", title: "Biology", cardCount: 24, icon: "leaf", color: "#22A559", tint: "#DDF5E7" },
  { id: "2", title: "Programming", cardCount: 36, icon: "code-slash", color: colors.primary, tint: colors.primarySoft },
  { id: "3", title: "Math Formulas", cardCount: 28, icon: "calculator", color: "#E5484D", tint: "#FDE7E7" },
  { id: "4", title: "English Vocabulary", cardCount: 50, icon: "book", color: colors.primary, tint: colors.primarySoft },
  { id: "5", title: "History", cardCount: 40, icon: "library", color: "#E5484D", tint: "#FDE7E7" },
  { id: "6", title: "Science", cardCount: 32, icon: "flask", color: colors.primary, tint: colors.primarySoft },
];