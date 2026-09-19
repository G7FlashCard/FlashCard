import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { DECKS } from "../../screens/deckData";
import { colors, radius, spacing } from "../../screens/theme";
const USER_NAME = "April";
const NOTIFICATION_COUNT = 3;

const palette = {
  purple: "#7C5CFC",
  purpleTint: "#F1ECFF",
  blue: "#3B82F6",
  blueTint: "#EAF2FE",
  green: "#22C55E",
  greenTint: "#E7FBEE",
  red: "#EF4444",
  redTint: "#FDECEC",
  gold: "#F5A623",
  pink: "#FDEEF1",
  pinkText: "#DB2777",
};

const QUICK_ACTIONS = [
  { key: "decks", label: "Decks", icon: "layers-outline", tint: palette.blueTint, color: palette.blue, route: "/decks" },
  { key: "quizzes", label: "Quizzes", icon: "help-circle-outline", tint: palette.purpleTint, color: palette.purple, route: "/quizzes" },
  { key: "progress", label: "Progress", icon: "stats-chart-outline", tint: palette.greenTint, color: palette.green, route: "/progress" },
  { key: "friends", label: "Friends", icon: "people-outline", tint: "#FFF1E6", color: "#F08A3C", route: "/friends" },
] as const;

const CONTINUE_DECKS = [
  { id: "1", title: "Biology", cardCount: 24, learnedPct: 0.6, icon: "leaf-outline", tint: palette.greenTint, color: palette.green },
  { id: "2", title: "Math Formulas", cardCount: 28, learnedPct: 0.3, icon: "calculator-outline", tint: palette.redTint, color: palette.red },
] as const;

const RECENT_ACTIVITY = [
  {
    id: "a1",
    icon: "book-outline",
    iconTint: palette.blueTint,
    iconColor: palette.blue,
    title: "You studied English Vocabulary",
    subtitle: "20 cards · 80% correct",
    time: "2h ago",
  },
  {
    id: "a2",
    icon: "flame",
    iconTint: "#FFF1E0",
    iconColor: palette.gold,
    title: "You reached a 7-day streak!",
    subtitle: "Keep it up!",
    time: "5h ago",
  },
] as const;

const GOAL = { done: 3, target: 5 };

const STATS = [
  { key: "streak", icon: "flame", color: palette.gold, value: "7", label: "Day Streak" },
  { key: "cards", icon: "bar-chart", color: colors.primary, value: "48", label: "Cards Studied" },
  { key: "score", icon: "trophy", color: palette.gold, value: "80%", label: "Avg. Score" },
  { key: "quizzes", icon: "locate", color: colors.primary, value: "3", label: "Quizzes Taken" },
] as const;

const FRIENDS_ACTIVITY = [
  { id: "f1", name: "Mia Santos", action: "completed a quiz in Biology", time: "1h ago", tint: palette.pink, initials: "MS" },
  { id: "f2", name: "Alex Cruz", action: "studied Math Formulas", time: "3h ago", tint: palette.blueTint, initials: "AC" },
  { id: "f3", name: "Sophie Tan", action: "reached a 5-day streak!", time: "5h ago", tint: palette.greenTint, initials: "ST" },
] as const;

const RECOMMENDED = [
  { id: "r1", title: "Psychology Basics", cardCount: 36, icon: "flower-outline", tint: palette.purpleTint, color: palette.purple },
  { id: "r2", title: "World History", cardCount: 42, icon: "earth-outline", tint: palette.blueTint, color: palette.blue },
] as const;

const QUOTE = "A little progress each day adds up to big results.";

// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const [goalDone] = useState(GOAL.done);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const openDeck = (id: string) => router.push(`/deck/${id}` as any);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              {greeting}, {USER_NAME}!
            </Text>
          </View>

          <Pressable
            style={styles.iconButton}
            onPress={() => router.navigate("/notifications" as any)}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={30} color={colors.ink} />
            {NOTIFICATION_COUNT > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{NOTIFICATION_COUNT}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Small cards. Big progress.</Text>
            <Text style={styles.bannerSubtitle}>
              Turn what you learn today into a brighter tomorrow.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.bannerButton, pressed && styles.bannerButtonPressed]}
              onPress={() => router.navigate("/decks")}
              accessibilityRole="button"
            >
              <Text style={styles.bannerButtonText}>Let's Learn</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.background} />
            </Pressable>
          </View>
        </View>

        {/* Continue Studying */}
        <SectionHeader title="Continue Studying" action="View All" onAction={() => router.navigate("/decks")} />
        {CONTINUE_DECKS.map((deck) => (
          <Pressable
            key={deck.id}
            onPress={() => openDeck(deck.id)}
            style={({ pressed }) => [styles.card, styles.continueRow, pressed && styles.cardPressed]}
            accessibilityRole="button"
          >
            <View style={[styles.iconTile, { backgroundColor: deck.tint }]}>
              <Ionicons name={deck.icon as any} size={22} color={deck.color} />
            </View>
            <View style={styles.continueBody}>
              <Text style={styles.deckTitle}>{deck.title}</Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressCaption}>{deck.cardCount} cards</Text>
                <Text style={styles.progressCaption}>· {Math.round(deck.learnedPct * 100)}% learned</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${deck.learnedPct * 100}%`, backgroundColor: deck.color },
                  ]}
                />
              </View>
            </View>
            <View style={[styles.playButton, { backgroundColor: deck.color }]}>
              <Ionicons name="play" size={16} color={colors.background} />
            </View>
          </Pressable>
        ))}

        {/* Recent Activity */}
        <SectionHeader title="Recent Activity" action="See All" onAction={() => router.navigate("/activity" as any)} />
        {RECENT_ACTIVITY.map((item) => (
          <View key={item.id} style={[styles.card, styles.activityRow]}>
            <View style={[styles.activityIcon, { backgroundColor: item.iconTint }]}>
              <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
            </View>
            <View style={styles.activityBody}>
              <Text style={styles.deckTitle}>{item.title}</Text>
              <Text style={styles.deckMeta}>{item.subtitle}</Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        ))}
        
        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.key} style={[styles.card, styles.statCard]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Friends Activity */}
        <SectionHeader title="Friends Activity" action="See All" onAction={() => router.navigate("/friends")} />
        {FRIENDS_ACTIVITY.map((friend) => (
          <View key={friend.id} style={[styles.card, styles.activityRow]}>
            <View style={[styles.friendAvatar, { backgroundColor: friend.tint }]}>
              <Text style={styles.friendInitials}>{friend.initials}</Text>
              <View style={styles.onlineDotSmall} />
            </View>
            <View style={styles.activityBody}>
              <Text style={styles.deckTitle}>{friend.name}</Text>
              <Text style={styles.deckMeta}>{friend.action}</Text>
            </View>
            <Text style={styles.timeText}>{friend.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="link">
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProgressRing({ progress, size = 60, stroke = 7 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityLabel={`${Math.round(clamped * 100)} percent of today's goal`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.primarySoft} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.ringText}>{Math.round(clamped * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.lg - 4,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.background,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: colors.background,
  },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg - 4,
    overflow: "hidden",
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: colors.body,
    marginBottom: 14,
  },
  bannerButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  bannerButtonPressed: {
    opacity: 0.85,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.background,
  },
  bannerArt: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },

  // Quick actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg - 4,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },

  // Sections
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  // Shared card
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardPressed: {
    backgroundColor: "#F8F9FC",
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deckTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  deckMeta: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },

  // Continue studying
  continueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
  },
  continueBody: {
    flex: 1,
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
    marginBottom: 8,
  },
  progressCaption: {
    fontSize: 12,
    color: colors.body,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  // Activity rows (recent + friends)
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  activityBody: {
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  friendAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  friendInitials: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  onlineDotSmall: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: colors.background,
  },

  // Goal
  goalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: 12,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  goalStats: {
    justifyContent: "center",
  },
  goalCount: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  goalUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.body,
  },
  goalMessage: {
    flex: 1,
  },
  goalMessageTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  goalMessageSubtitle: {
    fontSize: 12,
    color: colors.body,
    marginTop: 2,
  },
  ringText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  statCard: {
    width: "48%",
    alignItems: "flex-start",
    gap: 6,
    padding: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  statLabel: {
    fontSize: 12,
    color: colors.body,
  },

  // Recommended
  recommendedRow: {
    flexDirection: "row",
    gap: 12,
  },
  recommendedCard: {
    flex: 1,
    padding: 14,
  },
  recommendedTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  studyButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  studyButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // Quote
  quoteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FDEEF1",
    borderRadius: radius.lg,
    padding: 14,
    marginTop: spacing.sm,
  },
  quoteIcon: {
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    lineHeight: 18,
  },
});