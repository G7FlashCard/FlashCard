import { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import type { Deck } from "../../screens/deckData";
import { DeckFormModal } from "../../screens/DeckFormModal";
import type { DeckInput } from "../../screens/deckStore";
import { colors, radius, spacing } from "../../screens/theme";

type SortKey = "default" | "name" | "cards";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "Default order" },
  { key: "name", label: "Name (A–Z)" },
  { key: "cards", label: "Most cards" },
];

const INITIAL_DECKS: Deck[] = [
  {
    id: "1",
    title: "Biology",
    cardCount: 24,
    icon: "leaf-outline",
    tint: "#E7FBEE",
    color: "#22C55E",
  },
];

export default function DecksScreen() {
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const visibleDecks = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = q ? decks.filter((deck) => deck.title.toLowerCase().includes(q)) : decks;

    if (sort === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "cards") {
      list = [...list].sort((a, b) => b.cardCount - a.cardCount);
    }
    return list;
  }, [decks, query, sort]);

  const openDeck = (id: string) => router.push(`/deck/${id}` as any);

  const createDeck = (input: DeckInput) => {
    const deck: Deck = {
      id: String(Date.now()),
      title: input.title,
      cardCount: 0,
      subject: input.subject,
      icon: input.icon ?? "albums-outline",
      tint: input.tint ?? colors.primaryTint,
      color: input.color ?? colors.primary,
    } as Deck;

    setDecks((prev) => [...prev, deck]);
    setQuery("");
    setSort("default");
    setCreateOpen(false);
    // Take the person straight to the new deck's options.
    openDeck(deck.id);
  };

  const deleteDeckLocal = (id: string) => setDecks((prev) => prev.filter((deck) => deck.id !== id));

  const confirmDelete = (deck: Deck) =>
    Alert.alert(
      "Delete deck?",
      `"${deck.title}" and its ${deck.cardCount} cards will be permanently deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteDeckLocal(deck.id) },
      ]
    );

  const openMenu = (deck: Deck) =>
    Alert.alert(deck.title, undefined, [
      { text: "Delete Deck", style: "destructive", onPress: () => confirmDelete(deck) },
      { text: "Cancel", style: "cancel" },
    ]);

  const hasQuery = query.trim().length > 0;
  const emptyMessage = hasQuery
    ? { title: "No results", body: `No decks match "${query.trim()}".` }
    : { title: "No decks yet", body: "Create your first deck to start adding cards." };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Decks</Text>
          <Pressable
            onPress={() => setCreateOpen(true)}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressedFade]}
            accessibilityRole="button"
            accessibilityLabel="Create new deck"
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Search + sort */}
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={20} color={colors.body} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search decks..."
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

          <Pressable
            onPress={() => setSortOpen(true)}
            style={[styles.filterButton, sort !== "default" && styles.filterButtonActive]}
            accessibilityRole="button"
            accessibilityLabel="Sort decks"
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={sort !== "default" ? colors.primary : colors.ink}
            />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visibleDecks}
        keyExtractor={(deck) => deck.id}
        renderItem={({ item }) => (
          <DeckRow deck={item} onOpen={() => openDeck(item.id)} onMenu={() => openMenu(item)} />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="albums-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{emptyMessage.title}</Text>
            <Text style={styles.emptyBody}>{emptyMessage.body}</Text>
            {!hasQuery && (
              <Pressable
                onPress={() => setCreateOpen(true)}
                style={({ pressed }) => [styles.emptyButton, pressed && styles.pressedFade]}
                accessibilityRole="button"
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Create deck</Text>
              </Pressable>
            )}
          </View>
        }
      />

      <SortMenu
        visible={sortOpen}
        value={sort}
        onSelect={setSort}
        onClose={() => setSortOpen(false)}
      />

      <DeckFormModal
        visible={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSave={createDeck}
      />
    </SafeAreaView>
  );
}

function DeckRow({
  deck,
  onOpen,
  onMenu,
}: {
  deck: Deck;
  onOpen: () => void;
  onMenu: () => void;
}) {
  const meta = deck.subject ? `${deck.cardCount} cards • ${deck.subject}` : `${deck.cardCount} cards`;

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
    >
      <View style={[styles.iconTile, { backgroundColor: deck.tint }]}>
        <Ionicons name={deck.icon} size={22} color={deck.color} />
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {deck.title}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      <Pressable
        onPress={onMenu}
        hitSlop={10}
        style={styles.menuButton}
        accessibilityRole="button"
        accessibilityLabel={`More options for ${deck.title}`}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.body} />
      </Pressable>
    </Pressable>
  );
}

function SortMenu({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: SortKey;
  onSelect: (key: SortKey) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>Sort by</Text>
          {SORTS.map((option) => {
            const selected = option.key === value;
            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  onSelect(option.key);
                  onClose();
                }}
                style={styles.menuItem}
                accessibilityRole="button"
              >
                <Text style={[styles.menuText, selected && styles.menuTextActive]}>
                  {option.label}
                </Text>
                {selected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pressedFade: {
    opacity: 0.85,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.ink,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: spacing.md,
  },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },

  // List
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginBottom: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowPressed: {
    backgroundColor: "#F8F9FC",
  },
  iconTile: {
    width: 48,
    height: 48,
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
  rowMeta: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
  menuButton: {
    paddingLeft: 4,
  },

  // Empty state
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
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: 20,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Sort menu
  backdrop: {
    flex: 1,
    alignItems: "flex-end",
    paddingTop: 150,
    paddingRight: spacing.lg - 4,
    backgroundColor: "rgba(17, 25, 54, 0.25)",
  },
  menu: {
    width: 220,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.body,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 15,
    color: colors.ink,
  },
  menuTextActive: {
    fontWeight: "700",
    color: colors.primary,
  },
});