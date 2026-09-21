import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../../screens/theme";
import { duplicateDeck, removeDeck, updateDeck, useDeck } from "../../screens/deckRepo";
import FlashcardStudyScreen from "../../screens/FlashcardStudyScreen";
import type { IconName } from "../../screens/deckRepo";

type SheetItem = {
  key: string;
  label: string;
  icon: IconName;
  destructive?: boolean;
  onPress: () => void;
};

const comingSoon = (feature: string) =>
  Alert.alert(feature, "This feature is coming soon.");

export default function DeckOptionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = useDeck(id);
  const [sheet, setSheet] = useState<"edit" | "more" | null>(null);
  const [studyOpen, setStudyOpen] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/decks");
  };

  // The deck doesn't exist (bad link, or it was deleted).
  if (!deck) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.missing}>
          <View style={styles.missingIcon}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.missingTitle}>Deck not found</Text>
          <Text style={styles.missingBody}>This deck may have been deleted.</Text>
          <Pressable onPress={goBack} style={styles.missingButton} accessibilityRole="button">
            <Text style={styles.missingButtonText}>Back to Decks</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const confirmDelete = () =>
    Alert.alert(
      "Delete deck?",
      `"${deck.title}" and its ${deck.cardCount} cards will be permanently deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeDeck(deck.id);
            goBack();
          },
        },
      ]
    );

  const duplicate = () => {
    const copy = duplicateDeck(deck.id);
    if (copy) Alert.alert("Deck duplicated", `"${copy.title}" was added to your decks.`);
  };

  const startQuiz = () =>
    router.push({ pathname: "/quiz/create" as any, params: { deckId: deck.id } });

  const deleteItem: SheetItem = {
    key: "delete",
    label: "Delete Deck",
    icon: "trash-outline",
    destructive: true,
    onPress: confirmDelete,
  };

  const editItems: SheetItem[] = [
    { key: "details", label: "Edit Deck Details", icon: "create-outline", onPress: () => comingSoon("Edit Deck Details") },
    { key: "add", label: "Add Cards", icon: "add", onPress: () => router.push(`/deck/${deck.id}/add-cards` as any) },
    { key: "share", label: "Share Deck", icon: "people-outline", onPress: () => comingSoon("Share Deck") },
    deleteItem,
  ];

  const moreItems: SheetItem[] = [
    {
      key: "favorite",
      label: deck.favorite ? "Remove from Favorites" : "Add to Favorites",
      icon: deck.favorite ? "heart" : "heart-outline",
      onPress: () => updateDeck(deck.id, { favorite: !deck.favorite }),
    },
    { key: "export", label: "Export Deck", icon: "download-outline", onPress: () => comingSoon("Export Deck") },
    { key: "print", label: "Print Deck", icon: "print-outline", onPress: () => comingSoon("Print Deck") },
    { key: "copy", label: "Make a Copy", icon: "copy-outline", onPress: duplicate },
    { key: "folder", label: "Move to Folder", icon: "folder-outline", onPress: () => comingSoon("Move to Folder") },
    deleteItem,
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Pressable
          onPress={() => setSheet("more")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Deck header */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: deck.tint }]}>
            <Ionicons name={deck.icon} size={40} color={deck.color} />
          </View>
          <Text style={styles.title}>{deck.title}</Text>
          <Text style={styles.description}>
            {deck.description?.trim() || `${deck.cardCount} cards`}
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <ActionButton label="Study" icon="play" variant="primary" onPress={() => setStudyOpen(true)} />
          <ActionButton label="Quiz" icon="help" variant="dark" onPress={startQuiz} />
          <ActionButton label="Edit" icon="pencil-outline" variant="light" onPress={() => setSheet("edit")} />
        </View>

        {/* List */}
        <NavRow
          icon="albums-outline"
          label="Flashcards"
          meta={`${deck.cardCount} cards`}
          onPress={() => setStudyOpen(true)}
        />
        <NavRow icon="stats-chart-outline" label="Quiz Results" onPress={() => comingSoon("Quiz Results")} />
        <NavRow icon="people-outline" label="Share Deck" onPress={() => comingSoon("Share Deck")} />
        <NavRow icon="trash-outline" label="Delete Deck" destructive onPress={confirmDelete} />
      </ScrollView>

      <ActionSheet
        visible={sheet === "edit"}
        title="Deck Options"
        items={editItems}
        onClose={() => setSheet(null)}
      />
      <ActionSheet
        visible={sheet === "more"}
        title="More Options"
        items={moreItems}
        onClose={() => setSheet(null)}
      />

      {/* Study opens as a full-screen panel over this page (no extra route). */}
      <Modal
        visible={studyOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => setStudyOpen(false)}
      >
        <FlashcardStudyScreen deckId={deck.id} onClose={() => setStudyOpen(false)} />
      </Modal>
    </SafeAreaView>
  );
}

function ActionButton({
  label,
  icon,
  variant,
  onPress,
}: {
  label: string;
  icon: IconName;
  variant: "primary" | "dark" | "light";
  onPress: () => void;
}) {
  const background =
    variant === "primary" ? colors.primary : variant === "dark" ? colors.navy : "#F1F2F6";
  const iconColor = variant === "light" ? colors.ink : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.actionCircle, { backgroundColor: background }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function NavRow({
  icon,
  label,
  meta,
  destructive,
  onPress,
}: {
  icon: IconName;
  label: string;
  meta?: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const tint = destructive ? "#E5484D" : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={22} color={tint} />
      <View style={styles.navText}>
        <Text style={[styles.navLabel, destructive && styles.destructiveText]}>{label}</Text>
        {meta ? <Text style={styles.navMeta}>{meta}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={destructive ? "#E5484D" : "#9CA3AF"} />
    </Pressable>
  );
}

function ActionSheet({
  visible,
  title,
  items,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: SheetItem[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  // Close the sheet first, then run the action. Showing an Alert while the
  // sheet is still closing can silently fail on iOS.
  const choose = (item: SheetItem) => {
    onClose();
    setTimeout(item.onPress, 350);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          {items.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => choose(item)}
              style={({ pressed }) => [styles.sheetItem, pressed && styles.navRowPressed]}
              accessibilityRole="button"
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.destructive ? "#E5484D" : colors.ink}
              />
              <Text style={[styles.sheetItemText, item.destructive && styles.destructiveText]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.xl,
  },

  // Header
  hero: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: spacing.md,
  },

  // Quick actions
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
    minWidth: 64,
  },
  actionCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.body,
  },

  // List rows
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  navRowPressed: {
    backgroundColor: "#F8F9FC",
  },
  navText: {
    flex: 1,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  navMeta: {
    fontSize: 12,
    color: colors.body,
    marginTop: 2,
  },
  destructiveText: {
    color: "#E5484D",
  },

  // Bottom sheet
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17, 25, 54, 0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.md,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },

  // Deck not found
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  missingIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  missingBody: {
    fontSize: 14,
    color: colors.body,
    marginTop: spacing.sm,
  },
  missingButton: {
    marginTop: spacing.lg,
    paddingHorizontal: 24,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  missingButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});