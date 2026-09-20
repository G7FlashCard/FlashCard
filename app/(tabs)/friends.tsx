import { useMemo, useState } from "react";
import type { ReactNode } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../../screens/theme";

// ---------------------------------------------------------------------------
// Sample data + local state. Nothing is saved or sent anywhere yet; swap the
// starting lists and the handlers below for a real backend later.
// ---------------------------------------------------------------------------

type Presence = "online" | "studying" | "offline";

type Person = {
  id: string;
  name: string;
  username: string;
  presence: Presence;
  mutual: number;
};

const INITIAL_FRIENDS: Person[] = [
  { id: "f1", name: "Mia Santos", username: "mia.santos", presence: "online", mutual: 4 },
  { id: "f2", name: "Alex Cruz", username: "alexcruz", presence: "online", mutual: 2 },
  { id: "f3", name: "John Reyes", username: "johnreyes", presence: "studying", mutual: 6 },
  { id: "f4", name: "Sophie Tan", username: "sophietan", presence: "offline", mutual: 1 },
  { id: "f5", name: "Daniel Kim", username: "danielkim", presence: "offline", mutual: 3 },
];

const INITIAL_REQUESTS: Person[] = [
  { id: "r1", name: "Chloe Nguyen", username: "chloen", presence: "offline", mutual: 2 },
  { id: "r2", name: "Marcus Lee", username: "marcuslee", presence: "offline", mutual: 5 },
];

const SUGGESTIONS: Person[] = [
  { id: "s1", name: "Priya Patel", username: "priyap", presence: "offline", mutual: 3 },
  { id: "s2", name: "Lucas Silva", username: "lucas.silva", presence: "offline", mutual: 2 },
  { id: "s3", name: "Emma Wilson", username: "emmaw", presence: "offline", mutual: 1 },
];

const PRESENCE_LABEL: Record<Presence, string> = {
  online: "Online",
  studying: "In a study session",
  offline: "Offline",
};

const AVATAR_COLORS = [
  { bg: colors.primarySoft, fg: colors.primary },
  { bg: "#DDF5E7", fg: "#22A559" },
  { bg: "#FDE7E7", fg: "#E5484D" },
  { bg: "#FEF3C7", fg: "#D97706" },
  { bg: "#EDE9FE", fg: "#8B5CF6" },
];

type TabKey = "all" | "requests" | "suggestions";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "requests", label: "Requests" },
  { key: "suggestions", label: "Suggestions" },
];

const EMPTY_TEXT: Record<TabKey, { title: string; body: string }> = {
  all: {
    title: "No friends yet",
    body: "Check Suggestions, or tap the + button to add someone by username.",
  },
  requests: {
    title: "No pending requests",
    body: "When someone wants to be your friend, it will show up here.",
  },
  suggestions: {
    title: "No suggestions right now",
    body: "Check back later for people you may know.",
  },
};

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Person[]>(INITIAL_FRIENDS);
  const [requests, setRequests] = useState<Person[]>(INITIAL_REQUESTS);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const list = useMemo(() => {
    const source = tab === "all" ? friends : tab === "requests" ? requests : SUGGESTIONS;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
    );
  }, [tab, friends, requests, query]);

  // --- actions --------------------------------------------------------------

  const message = (person: Person) =>
    Alert.alert("Messages", `Messaging ${person.name} isn't available yet.`);

  const acceptRequest = (person: Person) => {
    setRequests((prev) => prev.filter((p) => p.id !== person.id));
    setFriends((prev) => [...prev, person]);
  };

  const declineRequest = (person: Person) =>
    setRequests((prev) => prev.filter((p) => p.id !== person.id));

  const toggleSuggestion = (person: Person) =>
    setRequestedIds((prev) => {
      const next = new Set(prev);
      if (next.has(person.id)) next.delete(person.id);
      else next.add(person.id);
      return next;
    });

  const confirmRemove = (person: Person) =>
    Alert.alert("Remove friend?", `${person.name} will be removed from your friends.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setFriends((prev) => prev.filter((p) => p.id !== person.id)),
      },
    ]);

  const sendFriendRequest = (username: string) => {
    setAddOpen(false);
    // Wait for the modal to finish closing, or iOS may not show the alert.
    setTimeout(
      () => Alert.alert("Request sent", `Friend request sent to @${username}.`),
      350
    );
  };

  // --- rendering ------------------------------------------------------------

  const renderItem = ({ item }: { item: Person }) => {
    if (tab === "requests") {
      return (
        <PersonRow person={item} subtitle={`@${item.username} • ${item.mutual} mutual`}>
          <SmallButton label="Accept" variant="primary" onPress={() => acceptRequest(item)} />
          <SmallButton label="Decline" variant="ghost" onPress={() => declineRequest(item)} />
        </PersonRow>
      );
    }

    if (tab === "suggestions") {
      const requested = requestedIds.has(item.id);
      return (
        <PersonRow person={item} subtitle={`${item.mutual} mutual friends`}>
          <SmallButton
            label={requested ? "Requested" : "Add"}
            variant={requested ? "muted" : "primary"}
            onPress={() => toggleSuggestion(item)}
          />
        </PersonRow>
      );
    }

    return (
      <PersonRow
        person={item}
        subtitle={PRESENCE_LABEL[item.presence]}
        showPresence
        onLongPress={() => confirmRemove(item)}
      >
        <SmallButton label="Message" variant="outline" onPress={() => message(item)} />
      </PersonRow>
    );
  };

  const hasQuery = query.trim().length > 0;
  const empty = hasQuery
    ? { title: "No results", body: `No one matches "${query.trim()}".` }
    : EMPTY_TEXT[tab];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Friends</Text>
          <Pressable
            onPress={() => setAddOpen(true)}
            hitSlop={10}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel="Add a friend"
          >
            <Ionicons name="person-add-outline" size={24} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={colors.body} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = t.key === tab;
            const badge = t.key === "requests" ? requests.length : 0;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={styles.tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <View style={styles.tabLabelRow}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                  {badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  )}
                </View>
                {active && <View style={styles.tabUnderline} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(person) => person.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        extraData={requestedIds}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptyBody}>{empty.body}</Text>
          </View>
        }
      />

      <AddFriendModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSend={sendFriendRequest}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function Avatar({ name, presence }: { name: string; presence?: Presence }) {
  const index = name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLORS.length;
  const palette = AVATAR_COLORS[index];
  const active = presence === "online" || presence === "studying";

  return (
    <View style={[styles.avatar, { backgroundColor: palette.bg }]}>
      <Text style={[styles.avatarText, { color: palette.fg }]}>{initialsOf(name)}</Text>
      {active && <View style={styles.presenceDot} />}
    </View>
  );
}

function PersonRow({
  person,
  subtitle,
  showPresence,
  onLongPress,
  children,
}: {
  person: Person;
  subtitle: string;
  showPresence?: boolean;
  onLongPress?: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={400}
      style={styles.row}
      accessibilityHint={onLongPress ? "Long press to remove this friend" : undefined}
    >
      <Avatar name={person.name} presence={showPresence ? person.presence : undefined} />
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>
          {person.name}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.rowActions}>{children}</View>
    </Pressable>
  );
}

function SmallButton({
  label,
  variant,
  onPress,
}: {
  label: string;
  variant: "primary" | "outline" | "ghost" | "muted";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallButton,
        variant === "primary" && styles.smallPrimary,
        variant === "outline" && styles.smallOutline,
        variant === "ghost" && styles.smallGhost,
        variant === "muted" && styles.smallMuted,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.smallText,
          variant === "primary" && styles.smallTextOnPrimary,
          variant === "outline" && styles.smallTextPrimary,
          (variant === "ghost" || variant === "muted") && styles.smallTextGrey,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function AddFriendModal({
  visible,
  onClose,
  onSend,
}: {
  visible: boolean;
  onClose: () => void;
  onSend: (username: string) => void;
}) {
  const [username, setUsername] = useState("");
  const clean = username.trim().replace(/^@/, "");

  const close = () => {
    setUsername("");
    onClose();
  };

  const send = () => {
    if (!clean) return;
    setUsername("");
    onSend(clean);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <Text style={styles.dialogTitle}>Add a Friend</Text>
          <Text style={styles.dialogBody}>Enter their username to send a friend request.</Text>

          <View style={styles.dialogInputRow}>
            <Ionicons name="at-outline" size={20} color={colors.body} />
            <TextInput
              style={styles.dialogInput}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="send"
              onSubmitEditing={send}
            />
          </View>

          <View style={styles.dialogActions}>
            <Pressable onPress={close} style={[styles.dialogButton, styles.dialogCancel]}>
              <Text style={styles.dialogCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={send}
              disabled={!clean}
              style={[styles.dialogButton, styles.dialogSend, !clean && styles.dialogSendDisabled]}
            >
              <Text style={styles.dialogSendText}>Send Request</Text>
            </Pressable>
          </View>
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
    alignItems: "center",
    justifyContent: "center",
  },
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
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
  },

  // Tabs
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
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
  },
  presenceDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },

  // Small buttons
  smallButton: {
    minWidth: 78,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  smallPrimary: {
    backgroundColor: colors.primary,
  },
  smallOutline: {
    backgroundColor: colors.primaryTint,
  },
  smallGhost: {
    minWidth: 0,
    paddingHorizontal: 6,
  },
  smallMuted: {
    backgroundColor: "#F1F2F6",
  },
  smallText: {
    fontSize: 13,
    fontWeight: "700",
  },
  smallTextOnPrimary: {
    color: "#FFFFFF",
  },
  smallTextPrimary: {
    color: colors.primary,
  },
  smallTextGrey: {
    color: colors.body,
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

  // Add friend dialog
  backdrop: {
    flex: 1,
    alignItems: "center",
    paddingTop: 140,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(17, 25, 54, 0.4)",
  },
  dialog: {
    width: "100%",
    padding: spacing.lg - 4,
    borderRadius: radius.lg + 4,
    backgroundColor: colors.background,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  dialogBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    marginTop: 6,
    marginBottom: spacing.md,
  },
  dialogInputRow: {
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
  dialogInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
  },
  dialogActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.md,
  },
  dialogButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogCancel: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  dialogSend: {
    backgroundColor: colors.primary,
  },
  dialogSendDisabled: {
    opacity: 0.4,
  },
  dialogSendText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});