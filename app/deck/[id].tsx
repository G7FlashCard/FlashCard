import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import type { IconName } from "../../screens/deckData";
import { DeckFormModal } from "../../screens/DeckFormModal";
import { DeckInput, deleteDeck, duplicateDeck, updateDeck, useDeck } from "../../screens/deckStore";
import { colors, radius, spacing } from "../../screens/theme";

const DANGER = "#E5484D";

type SheetKey = "edit" | "more" | null;

type SheetItem = {
  icon: IconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = useDeck(id);

  const [sheet, setSheet] = useState<SheetKey>(null);
  const [editOpen, setEditOpen] = useState(false);

  if (!deck) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.topBar}>
          <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Deck not found</Text>
          <Text style={styles.missingBody}>It may have been deleted.</Text>
        </View>
      </SafeAreaView>
    );
  }


  const comingSoon = (feature: string) =>
    Alert.alert(feature, "This part isn't built yet.");

  // Gate any card-dependent feature behind having at least one card, then
  // run the real action instead of always falling back to "coming soon".
  const needsCards = (feature: string, onReady: () => void) =>
    deck.cardCount === 0
      ? Alert.alert("No cards yet", "Add cards to this deck before you start.")
      : onReady();

  const goToAddCards = () => router.push(`/deck/${deck.id}/add-cards` as any);
  const goToStudy = () => router.push(`/deck/${deck.id}/study` as any);
  const goToQuiz = () =>
    router.push({ pathname: "/quiz/create" as any, params: { deckId: deck.id } });

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
            deleteDeck(deck.id);
            router.back();
          },
        },
      ]
    );

  const copyDeck = () => {
    const copy = duplicateDeck(deck.id);
    if (!copy) return;
    Alert.alert("Deck copied", `"${copy.title}" was added to your decks.`, [
      { text: "Done", style: "cancel" },
      { text: "Open copy", onPress: () => router.replace(`/deck/${copy.id}` as any) },
    ]);
  };

  const saveEdits = (input: DeckInput) => {
    updateDeck(deck.id, input);
    setEditOpen(false);
  };

  const afterSheet = (action: () => void) => {
    setSheet(null);
    setTimeout(action, 350);
  };

  const editItems: SheetItem[] = [
    { icon: "create-outline", label: "Edit Deck Details", onPress: () => setEditOpen(true) },
    { icon: "add", label: "Add Cards", onPress: goToAddCards },
    { icon: "reorder-three-outline", label: "Reorder Cards", onPress: () => needsCards("Reorder Cards", () => comingSoon("Reorder Cards")) },
    { icon: "copy-outline", label: "Duplicate Deck", onPress: copyDeck },
    { icon: "people-outline", label: "Share Deck", onPress: () => comingSoon("Share Deck") },
    { icon: "trash-outline", label: "Delete Deck", onPress: confirmDelete, destructive: true },
  ];

  const moreItems: SheetItem[] = [
    { icon: "download-outline", label: "Export Deck", onPress: () => comingSoon("Export Deck") },
    { icon: "print-outline", label: "Print Deck", onPress: () => comingSoon("Print Deck") },
    { icon: "copy-outline", label: "Make a Copy", onPress: copyDeck },
    { icon: "folder-outline", label: "Move to Folder", onPress: () => comingSoon("Move to Folder") },
    { icon: "trash-outline", label: "Delete Deck", onPress: confirmDelete, destructive: true },
  ];

  const cardLabel = `${deck.cardCount} ${deck.cardCount === 1 ? "card" : "cards"}`;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <IconButton icon="ellipsis-horizontal" label="More options" onPress={() => setSheet("more")} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.coverTile, { backgroundColor: deck.tint }]}>
            <Ionicons name={deck.icon} size={40} color={deck.color} />
          </View>

          <View style={styles.titleLine}>
            <Text style={styles.deckTitle} numberOfLines={2}>
              {deck.title}
            </Text>
            {deck.isPrivate && (
              <Ionicons name="lock-closed" size={16} color={colors.body} accessibilityLabel="Private deck" />
            )}
          </View>

          {!!deck.description && <Text style={styles.deckDescription}>{deck.description}</Text>}

          {!!deck.subject && (
            <View style={[styles.subjectPill, { backgroundColor: deck.tint }]}>
              <Text style={[styles.subjectText, { color: deck.color }]}>{deck.subject}</Text>
            </View>
          )}
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <ActionButton
            icon="play"
            label="Study"
            primary
            onPress={() => needsCards("Study", goToStudy)}
          />
          <ActionButton
            icon="help"
            label="Quiz"
            onPress={() => needsCards("Quiz", goToQuiz)}
          />
          <ActionButton icon="pencil" label="Edit" onPress={() => setSheet("edit")} />
          <ActionButton icon="ellipsis-horizontal" label="More" onPress={() => setSheet("more")} />
        </View>

        {/* Rows */}
        <View style={styles.rows}>
          <InfoRow
            icon="layers-outline"
            label="Flashcards"
            sub={cardLabel}
            onPress={() => (deck.cardCount === 0 ? goToAddCards() : goToStudy())}
          />
          <InfoRow icon="bar-chart-outline" label="Quiz Results" onPress={() => comingSoon("Quiz Results")} />
          <InfoRow icon="stats-chart-outline" label="Statistics" onPress={() => comingSoon("Statistics")} />
          <InfoRow icon="people-outline" label="Share Deck" onPress={() => comingSoon("Share Deck")} />
          <InfoRow icon="trash-outline" label="Delete Deck" destructive onPress={confirmDelete} />
        </View>
      </ScrollView>

      <OptionsSheet
        visible={sheet === "edit"}
        title="Deck Options"
        items={editItems}
        onClose={() => setSheet(null)}
        onSelect={(item) => afterSheet(item.onPress)}
      />
      <OptionsSheet
        visible={sheet === "more"}
        title="More Options"
        items={moreItems}
        onClose={() => setSheet(null)}
        onSelect={(item) => afterSheet(item.onPress)}
      />

      <DeckFormModal
        visible={editOpen}
        mode="edit"
        initial={{
          title: deck.title,
          description: deck.description ?? "",
          subject: deck.subject ?? "",
          isPrivate: deck.isPrivate ?? false,
        }}
        onClose={() => setEditOpen(false)}
        onSave={saveEdits}
      />
    </SafeAreaView>
  );
}


function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={24} color={colors.ink} />
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  primary,
  onPress,
}: {
  icon: IconName;
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.action}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.actionCircle,
              primary && styles.actionCirclePrimary,
              pressed && styles.pressedFade,
            ]}
          >
            <Ionicons name={icon} size={22} color={primary ? "#FFFFFF" : colors.ink} />
          </View>
          <Text style={[styles.actionLabel, primary && styles.actionLabelPrimary]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
  sub,
  destructive,
  onPress,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const tint = destructive ? DANGER : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.infoRow, pressed && styles.rowPressed]}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={22} color={tint} />
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, destructive && { color: tint }]}>{label}</Text>
        {!!sub && <Text style={styles.infoSub}>{sub}</Text>}
      </View>
      {!destructive && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </Pressable>
  );
}

function OptionsSheet({
  visible,
  title,
  items,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  items: SheetItem[];
  onClose: () => void;
  onSelect: (item: SheetItem) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close menu"
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{title}</Text>

          {items.map((item) => {
            const tint = item.destructive ? DANGER : colors.ink;
            return (
              <Pressable
                key={item.label}
                onPress={() => onSelect(item)}
                style={({ pressed }) => [styles.sheetRow, pressed && styles.rowPressed]}
                accessibilityRole="button"
              >
                <Ionicons name={item.icon} size={22} color={tint} />
                <Text style={[styles.sheetRowText, item.destructive && { color: tint }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pressedFade: {
    opacity: 0.8,
  },
  rowPressed: {
    backgroundColor: "#F8F9FC",
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.xl,
  },

  // Hero
  hero: {
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  coverTile: {
    width: 84,
    height: 84,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deckTitle: {
    flexShrink: 1,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
  },
  deckDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  subjectPill: {
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Quick actions
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  action: {
    alignItems: "center",
    gap: 6,
    minWidth: 64,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  actionCirclePrimary: {
    backgroundColor: colors.primary,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.body,
  },
  actionLabelPrimary: {
    color: colors.primary,
  },

  // Rows
  rows: {
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
  infoSub: {
    fontSize: 12,
    color: colors.body,
    marginTop: 2,
  },

  // Not found
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xl * 2,
  },
  missingTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  missingBody: {
    fontSize: 14,
    color: colors.body,
    marginTop: spacing.sm,
  },

  // Bottom sheet
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17, 25, 54, 0.35)",
  },
  sheet: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  sheetRow: {
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
  sheetRowText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
});