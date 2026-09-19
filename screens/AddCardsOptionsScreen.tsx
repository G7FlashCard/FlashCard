import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "./theme";

type Props = {
  deckId: string;
};

type OptionKey = "manual" | "import";

const OPTIONS: {
  key: OptionKey;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconTint: string;
}[] = [
  {
    key: "manual",
    title: "Add Manually",
    subtitle: "Create cards one by one",
    icon: "create-outline",
    iconColor: colors.primary,
    iconTint: colors.primaryTint,
  },
  {
    key: "import",
    title: "Import from File",
    subtitle: "PDF, Word, or PowerPoint",
    icon: "document-attach-outline",
    iconColor: "#D97706",
    iconTint: "#FEF3C7",
  },
];

export default function AddCardsOptionsScreen({ deckId }: Props) {
  const choose = (key: OptionKey) => {
    if (key === "manual") {
      router.push(`/deck/${deckId}/add-card` as any);
    } else {
      router.push(`/deck/${deckId}/add-cards/import` as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Add Cards</Text>
        <Text style={styles.subtitle}>Choose how you want to add cards to your deck.</Text>
      </View>

      <View style={styles.list}>
        {OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => choose(option.key)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
          >
            <View style={[styles.iconTile, { backgroundColor: option.iconTint }]}>
              <Ionicons name={option.icon} size={22} color={option.iconColor} />
            </View>

            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{option.title}</Text>
              <Text style={styles.rowSubtitle}>{option.subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    marginTop: 6,
  },
  list: {
    paddingHorizontal: spacing.lg - 4,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowPressed: {
    backgroundColor: "#F8F9FC",
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
});