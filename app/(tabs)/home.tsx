import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { useDecks } from "../../screens/deckRepo";
import { colors, radius, spacing } from "../../screens/theme";

// Mock data. Replace with real data later.
const USER_NAME = "April";

const CONTINUE = { deckId: "1", title: "Cell Membrane", studied: 12, total: 24 };
const GOAL = { done: 3, target: 5 };

export default function HomeScreen() {
  const [query, setQuery] = useState("");

  // Shared with the Decks tab. "Recent" = the 3 most recently added decks.
  const decks = useDecks();
  const recentDecks = useMemo(() => [...decks].reverse().slice(0, 3), [decks]);

  const visibleDecks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? recentDecks.filter((deck) => deck.title.toLowerCase().includes(q)) : recentDecks;
  }, [recentDecks, query]);

  const openDeck = (id: string) => router.push(`/deck/${id}` as any);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hi, {USER_NAME}!</Text>
            <Text style={styles.subtitle}>Keep learning, keep growing! ✨</Text>
          </View>

          <Pressable
            style={styles.bell}
            onPress={() => Alert.alert("Notifications", "Notifications aren't available yet.")}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.ink} />
            <View style={styles.bellDot} />
          </Pressable>

          <Pressable
            style={styles.avatar}
            onPress={() => router.navigate("/profile")}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Text style={styles.avatarText}>{USER_NAME.charAt(0)}</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={colors.body} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search decks, quizzes, or friends..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Recent Decks */}
        <SectionHeader
          title="Recent Decks"
          action="View All"
          onAction={() => router.navigate("/decks")}
        />
        {visibleDecks.length === 0 ? (
          <Text style={styles.empty}>
            {query.trim()
              ? `No decks match "${query.trim()}".`
              : "No decks yet. Create one in the Decks tab."}
          </Text>
        ) : (
          visibleDecks.map((deck) => (
            <Pressable
              key={deck.id}
              onPress={() => openDeck(deck.id)}
              style={({ pressed }) => [styles.card, styles.deckRow, pressed && styles.cardPressed]}
              accessibilityRole="button"
            >
              <View style={[styles.iconTile, { backgroundColor: deck.tint }]}>
                <Ionicons name={deck.icon} size={22} color={deck.color} />
              </View>
              <View style={styles.deckText}>
                <Text style={styles.deckTitle}>{deck.title}</Text>
                <Text style={styles.deckMeta}>{deck.cardCount} cards</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          ))
        )}

        {/* Continue Studying */}
        <SectionHeader title="Continue Studying" />
        <Pressable
          onPress={() => openDeck(CONTINUE.deckId)}
          style={({ pressed }) => [styles.card, styles.continueCard, pressed && styles.cardPressed]}
          accessibilityRole="button"
        >
          <View style={[styles.iconTile, { backgroundColor: colors.primaryTint }]}>
            <Ionicons name="albums-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.continueBody}>
            <Text style={styles.deckTitle}>{CONTINUE.title}</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(CONTINUE.studied / CONTINUE.total) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressCount}>
                {CONTINUE.studied}/{CONTINUE.total}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Today's Goal */}
        <View style={[styles.card, styles.goalCard]}>
          <View>
            <Text style={styles.goalTitle}>Today's Goal</Text>
            <View style={styles.goalRow}>
              <Ionicons name="flame" size={20} color={colors.flame} />
              <Text style={styles.goalText}>
                {GOAL.done}/{GOAL.target} decks
              </Text>
            </View>
          </View>
          <ProgressRing progress={GOAL.done / GOAL.target} />
        </View>
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
    gap: 12,
    marginBottom: spacing.lg - 4,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.body,
    marginTop: 2,
  },
  bell: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 7,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },

  // Search
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    marginBottom: spacing.lg - 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
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
  empty: {
    fontSize: 14,
    color: colors.body,
    paddingVertical: spacing.md,
  },

  // Cards
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
  deckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deckText: {
    flex: 1,
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
  continueCard: {
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
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.body,
  },

  // Goal
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: spacing.sm,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  goalText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.body,
  },
  ringText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
});