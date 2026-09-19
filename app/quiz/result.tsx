import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../../screens/theme";

const USER_NAME = "April";

const CONFETTI = [
  { top: 10, left: 20, color: "#F5A623", size: 10 },
  { top: 30, left: "78%" as const, color: "#3B82F6", size: 8 },
  { top: 60, left: 40, color: "#22C55E", size: 7 },
  { top: 15, left: "55%" as const, color: "#DB2777", size: 6 },
  { top: 75, left: "82%" as const, color: "#7C5CFC", size: 9 },
  { top: 90, left: 30, color: "#F5A623", size: 6 },
];

export default function QuizResultScreen() {
  const params = useLocalSearchParams<{ score?: string; total?: string }>();
  const score = Number(params.score) || 0;
  const total = Number(params.total) || 10;
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Pressable
        onPress={() => router.back()}
        style={styles.closeButton}
        hitSlop={10}
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={24} color={colors.ink} />
      </Pressable>

      <View style={styles.body}>
        <View style={styles.trophyWrap}>
          {CONFETTI.map((dot, i) => (
            <View
              key={i}
              style={[
                styles.confettiDot,
                {
                  top: dot.top,
                  left: dot.left,
                  width: dot.size,
                  height: dot.size,
                  borderRadius: dot.size / 2,
                  backgroundColor: dot.color,
                },
              ]}
            />
          ))}
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={40} color="#F5A623" />
          </View>
        </View>

        <Text style={styles.title}>Quiz Completed!</Text>
        <Text style={styles.subtitle}>Great job, {USER_NAME}! 🎉</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {score}/{total}
            </Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Review Answers</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace({ pathname: "/quiz/take" as any, params: { total: String(total) } })}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Try Again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="link">
          <Text style={styles.linkText}>Back to Deck</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    alignSelf: "flex-end",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  trophyWrap: {
    width: 140,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  confettiDot: {
    position: "absolute",
  },
  trophyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFF6E5",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.body,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
  },
  statLabel: {
    fontSize: 12,
    color: colors.body,
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.lg,
    gap: 12,
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.background,
  },
  secondaryButton: {
    width: "100%",
    height: 50,
    borderRadius: radius.md,
    backgroundColor: "#F1F2F6",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
});