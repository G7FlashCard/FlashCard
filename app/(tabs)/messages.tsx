import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Avatar, GroupAvatar } from "../../screens/Avatar";
import {
  CONTACTS,
  formatListTime,
  getOrCreateDirect,
  previewOf,
  removeConversation,
  toggleMute,
  useConversations,
} from "../../screens/chatStore";
import type { Conversation } from "../../screens/chatStore";
import { colors, radius, spacing } from "../../screens/theme";

type FilterKey = "all" | "friends" | "groups" | "unread";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "friends", label: "Friends" },
  { key: "groups", label: "Groups" },
  { key: "unread", label: "Unread" },
];

const EMPTY_TEXT: Record<FilterKey, { title: string; body: string }> = {
  all: { title: "No messages yet", body: "Tap the compose button to start a conversation." },
  friends: { title: "No friend chats", body: "Message a friend and your chat will show up here." },
  groups: { title: "No group chats", body: "Group chats you're part of will show up here." },
  unread: { title: "You're all caught up", body: "No unread messages right now." },
};

export default function MessagesScreen() {
  const conversations = useConversations();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [composeOpen, setComposeOpen] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...conversations]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((c) => {
        if (filter === "friends") return c.kind === "direct";
        if (filter === "groups") return c.kind === "group";
        if (filter === "unread") return c.unread > 0;
        return true;
      })
      .filter((c) => !q || c.name.toLowerCase().includes(q) || previewOf(c).toLowerCase().includes(q));
  }, [conversations, query, filter]);

  const openChat = (id: string) => router.push(`/chat?id=${id}` as any);

  const confirmDelete = (convo: Conversation) =>
    Alert.alert("Delete chat?", `Your conversation with ${convo.name} will be deleted.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeConversation(convo.id) },
    ]);

  const openMenu = (convo: Conversation) =>
    Alert.alert(convo.name, undefined, [
      { text: convo.muted ? "Unmute" : "Mute", onPress: () => toggleMute(convo.id) },
      { text: "Delete Chat", style: "destructive", onPress: () => confirmDelete(convo) },
      { text: "Cancel", style: "cancel" },
    ]);

  const startChatWith = (name: string) => {
    setComposeOpen(false);
    // Let the sheet finish closing before navigating.
    setTimeout(() => openChat(getOrCreateDirect(name)), 250);
  };

  const hasSearch = query.trim().length > 0;
  const empty = hasSearch
    ? { title: "No results", body: `No messages match "${query.trim()}".` }
    : EMPTY_TEXT[filter];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.title}>Messages</Text>
            <Text style={styles.subtitle}>Stay connected. Learn together.</Text>
          </View>
          <Pressable
            onPress={() => setComposeOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="New message"
          >
            <Ionicons name="create-outline" size={28} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={colors.body} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        <View style={styles.chips}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(convo) => convo.id}
        renderItem={({ item }) => (
          <ConversationRow
            convo={item}
            onPress={() => openChat(item.id)}
            onLongPress={() => openMenu(item)}
          />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptyBody}>{empty.body}</Text>
          </View>
        }
      />

      <ComposeSheet
        visible={composeOpen}
        onClose={() => setComposeOpen(false)}
        onPick={startChatWith}
      />
    </SafeAreaView>
  );
}

function ConversationRow({
  convo,
  onPress,
  onLongPress,
}: {
  convo: Conversation;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const last = convo.messages[convo.messages.length - 1];
  const unread = convo.unread > 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityHint="Long press for more options"
    >
      {convo.kind === "group" ? (
        <GroupAvatar names={convo.members} size={58} />
      ) : (
        <Avatar name={convo.name} size={58} online={convo.online} />
      )}

      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>
            {convo.name}
          </Text>
          {last ? (
            <Text style={[styles.rowTime, unread && styles.rowTimeUnread]}>
              {formatListTime(last.sentAt)}
            </Text>
          ) : null}
        </View>

        <View style={styles.rowBottom}>
          <Text style={[styles.rowPreview, unread && styles.rowPreviewUnread]} numberOfLines={1}>
            {previewOf(convo)}
          </Text>
          {convo.muted ? (
            <Ionicons name="notifications-off-outline" size={20} color="#9CA3AF" />
          ) : unread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{convo.unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function ComposeSheet({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (name: string) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>New Message</Text>
          <FlatList
            data={CONTACTS}
            keyExtractor={(name) => name}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onPick(item)}
                style={({ pressed }) => [styles.contactRow, pressed && styles.rowPressed]}
                accessibilityRole="button"
              >
                <Avatar name={item} size={44} />
                <Text style={styles.contactName}>{item}</Text>
              </Pressable>
            )}
          />
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

  // Header
  header: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 15,
    color: colors.body,
    marginTop: 2,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: "#F1F4FE",
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
  },
  chips: {
    flexDirection: "row",
    gap: 10,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: "#F1F4FE",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.body,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },

  // List
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingLeft: 0,
  },
  rowPressed: {
    backgroundColor: "#F8F9FC",
  },
  rowBody: {
    flex: 1,
    paddingVertical: 14,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  rowTime: {
    fontSize: 13,
    color: colors.body,
  },
  rowTimeUnread: {
    color: colors.primary,
    fontWeight: "700",
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    minHeight: 24,
  },
  rowPreview: {
    flex: 1,
    fontSize: 14,
    color: colors.body,
  },
  rowPreviewUnread: {
    color: colors.ink,
    fontWeight: "600",
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
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

  // Compose sheet
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17, 25, 54, 0.4)",
  },
  sheet: {
    maxHeight: "70%",
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
    marginBottom: spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
  },
});