import { useState } from "react";
import type { ComponentProps } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { colors, radius, spacing } from "../../screens/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

// ---------------------------------------------------------------------------
// Sample data. Replace with real events (quiz results, cards studied, friend
// activity) once those are stored somewhere.
// ---------------------------------------------------------------------------

type ActivityKind = "quiz" | "study" | "friend_deck" | "streak" | "friend_joined";

type Activity = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
  when: string;
};

const ACTIVITY: Activity[] = [
  { id: "a1", kind: "quiz", title: "You completed Biology Quiz 1", detail: "Score: 8/10", when: "2 hours ago" },
  { id: "a2", kind: "study", title: "You studied Math Formulas", detail: "15 cards", when: "4 hours ago" },
  { id: "a3", kind: "friend_deck", title: "Mia created a new deck English Vocabulary", when: "1 day ago" },
  { id: "a4", kind: "streak", title: "You reached a 7-day streak!", detail: "Keep it up!", when: "2 days ago" },
  { id: "a5", kind: "friend_joined", title: "John joined FlashLearn!", when: "2 days ago" },
];

const KIND_STYLE: Record<ActivityKind, { icon: IconName; color: string; tint: string }> = {
  quiz: { icon: "book-outline", color: colors.primary, tint: colors.primaryTint },
  study: { icon: "albums-outline", color: colors.primary, tint: colors.primaryTint },
  friend_deck: { icon: "person-outline", color: colors.primary, tint: colors.primaryTint },
  streak: { icon: "flame", color: colors.flame, tint: colors.flameSoft },
  friend_joined: { icon: "person-add-outline", color: colors.primary, tint: colors.primaryTint },
};

const TODAY_GOAL = { done: 3, target: 5 };

const STREAK = {
  days: 9,
  week: [
    { label: "M", done: true },
    { label: "T", done: true },
    { label: "W", done: true },
    { label: "T", done: true },
    { label: "F", done: true },
    { label: "S", done: true },
    { label: "S", done: false }, // today
  ],
};

const WEEKLY_GOALS: { id: string; icon: IconName; title: string; done: number; target: number }[] = [
  { id: "w1", icon: "albums-outline", title: "Study 5 decks", done: 3, target: 5 },
  { id: "w2", icon: "help-circle-outline", title: "Take 3 quizzes", done: 3, target: 3 },
  { id: "w3", icon: "layers-outline", title: "Review 100 cards", done: 64, target: 100 },
];

type TabKey = "activity" | "goals";

const TABS: { key: TabKey; label: string }[] = [
  { key: "activity", label: "Activity" },
  { key: "goals", label: "Goals" },
];

export default function TimelineScreen() {
  const [tab, setTab] = useState<TabKey>("activity");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>

        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={styles.tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                {active && <View style={styles.tabUnderline} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {tab === "activity" ? <ActivityFeed /> : <GoalsView />}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Activity tab
// ---------------------------------------------------------------------------

function ActivityFeed() {
  return (
    <FlatList
      data={ACTIVITY}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ActivityRow item={item} />}
      contentContainerStyle={styles.feed}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="time-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptyBody}>Study a deck or take a quiz and it will show up here.</Text>
        </View>
      }
    />
  );
}

function ActivityRow({ item }: { item: Activity }) {
  const style = KIND_STYLE[item.kind];
  const meta = item.detail ? `${item.detail} • ${item.when}` : item.when;

  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: style.tint }]}>
        <Ionicons name={style.icon} size={22} color={style.color} />
      </View>
      <View style={styles.activityText}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityMeta}>{meta}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Goals tab
// ---------------------------------------------------------------------------

function GoalsView() {
  const remaining = Math.max(TODAY_GOAL.target - TODAY_GOAL.done, 0);

  return (
    <ScrollView contentContainerStyle={styles.goals} showsVerticalScrollIndicator={false}>
      {/* Streak */}
      <View style={styles.card}>
        <View style={styles.streakHeader}>
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={26} color={colors.flame} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.streakTitle}>{STREAK.days}-day streak</Text>
            <Text style={styles.cardMeta}>Study today to keep it going.</Text>
          </View>
        </View>

        <View style={styles.weekRow}>
          {STREAK.week.map((day, i) => (
            <View key={i} style={styles.weekDay}>
              <View style={[styles.weekDot, day.done && styles.weekDotDone]}>
                {day.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.weekLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Today's goal */}
      <View style={[styles.card, styles.todayCard]}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>Today's Goal</Text>
          <View style={styles.goalLine}>
            <Ionicons name="flame" size={20} color={colors.flame} />
            <Text style={styles.goalLineText}>
              {TODAY_GOAL.done}/{TODAY_GOAL.target} decks
            </Text>
          </View>
          <Text style={styles.cardMeta}>
            {remaining === 0
              ? "You hit today's goal. Nice work!"
              : `${remaining} more ${remaining === 1 ? "deck" : "decks"} to reach your goal.`}
          </Text>
        </View>
        <ProgressRing progress={TODAY_GOAL.done / TODAY_GOAL.target} />
      </View>

      {/* Weekly goals */}
      <Text style={styles.sectionTitle}>This Week</Text>
      {WEEKLY_GOALS.map((goal) => {
        const complete = goal.done >= goal.target;
        const ratio = Math.min(goal.done / goal.target, 1);
        return (
          <View key={goal.id} style={styles.card}>
            <View style={styles.weeklyHeader}>
              <View style={[styles.weeklyIcon, complete && styles.weeklyIconDone]}>
                <Ionicons
                  name={complete ? "checkmark" : goal.icon}
                  size={20}
                  color={complete ? colors.success : colors.primary}
                />
              </View>
              <Text style={styles.weeklyTitle}>{goal.title}</Text>
              <Text style={styles.weeklyCount}>
                {goal.done}/{goal.target}
              </Text>
            </View>
            <View
              style={styles.track}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: goal.target, now: Math.min(goal.done, goal.target) }}
            >
              <View
                style={[
                  styles.fill,
                  { width: `${ratio * 100}%` },
                  complete && { backgroundColor: colors.success },
                ]}
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function ProgressRing({
  progress,
  size = 64,
  stroke = 8,
}: {
  progress: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityLabel={`${Math.round(clamped * 100)} percent of today's goal`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primarySoft}
          strokeWidth={stroke}
          fill="none"
        />
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
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header + tabs
  header: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.body,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },

  // Activity
  feed: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
  },
  activityIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: colors.ink,
  },
  activityMeta: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  // Goals
  goals: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  cardMeta: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.body,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: 12,
  },

  // Streak
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.flameSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  weekDay: {
    alignItems: "center",
    gap: 6,
  },
  weekDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F2F6",
  },
  weekDotDone: {
    backgroundColor: colors.primary,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.body,
  },

  // Today's goal
  todayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  goalLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  goalLineText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  ringText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },

  // Weekly goals
  weeklyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  weeklyIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  weeklyIconDone: {
    backgroundColor: "#DDF5E7",
  },
  weeklyTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  weeklyCount: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.body,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});