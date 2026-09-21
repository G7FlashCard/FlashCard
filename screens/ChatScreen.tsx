import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Avatar, GroupAvatar } from "./Avatar";
import {
  ME,
  formatDayLabel,
  formatTime,
  markRead,
  removeConversation,
  sameDay,
  sendMessage,
  toggleMute,
  useConversation,
} from "./chatStore";
import type { ChatMessage, Conversation } from "./chatStore";
import { colors, radius, spacing } from "./theme";

type ListItem =
  | { type: "day"; id: string; label: string }
  | { type: "message"; id: string; message: ChatMessage; firstOfRun: boolean };

const comingSoon = (feature: string) => Alert.alert(feature, "This feature is coming soon.");

type Props = {
  /** Which conversation to show. */
  id: string;
  /** Called when the person taps back (or deletes the chat). */
  onClose: () => void;
};

export default function ChatScreen({ id, onClose }: Props) {
  const convo = useConversation(id);
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState("");
  const [keyboardUp, setKeyboardUp] = useState(false);

  // Opening a chat marks it as read.
  useEffect(() => {
    if (id) markRead(id);
  }, [id, convo?.unread]);

  // Track the keyboard so the input bar can sit above the home indicator only
  // when the keyboard is closed.
  useEffect(() => {
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(ios ? "keyboardWillShow" : "keyboardDidShow", () =>
      setKeyboardUp(true)
    );
    const hide = Keyboard.addListener(ios ? "keyboardWillHide" : "keyboardDidHide", () =>
      setKeyboardUp(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Messages plus a "Today" style divider whenever the day changes.
  const items = useMemo<ListItem[]>(() => {
    if (!convo) return [];
    const result: ListItem[] = [];
    convo.messages.forEach((message, i) => {
      const prev = convo.messages[i - 1];
      const newDay = !prev || !sameDay(prev.sentAt, message.sentAt);
      if (newDay) {
        result.push({ type: "day", id: `day-${message.id}`, label: formatDayLabel(message.sentAt) });
      }
      result.push({
        type: "message",
        id: message.id,
        message,
        firstOfRun: newDay || prev.from !== message.from,
      });
    });
    // Newest first: the list below is inverted, so it always opens at the
    // latest message without any scrolling.
    return result.reverse();
  }, [convo]);

  const goBack = onClose;

  if (!convo) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.missingTop}>
          <Pressable onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.missing}>
          <View style={styles.missingIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.missingTitle}>Chat not found</Text>
          <Text style={styles.missingBody}>This conversation may have been deleted.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(convo.id, text);
    setDraft("");
  };

  const openMenu = () =>
    Alert.alert(convo.name, undefined, [
      { text: convo.muted ? "Unmute" : "Mute", onPress: () => toggleMute(convo.id) },
      {
        text: "Delete Chat",
        style: "destructive",
        onPress: () =>
          Alert.alert("Delete chat?", `Your conversation with ${convo.name} will be deleted.`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                removeConversation(convo.id);
                goBack();
              },
            },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);

  const subtitle =
    convo.kind === "group"
      ? `${convo.members.length + 1} members`
      : convo.online
        ? "Online"
        : "Offline";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={28} color={colors.ink} />
          </Pressable>

          {convo.kind === "group" ? (
            <GroupAvatar names={convo.members} size={52} />
          ) : (
            <Avatar name={convo.name} size={52} online={convo.online} />
          )}

          <View style={styles.headerText}>
            <Text style={styles.headerName} numberOfLines={1}>
              {convo.name}
            </Text>
            <View style={styles.statusRow}>
              {convo.kind === "direct" && convo.online && <View style={styles.statusDot} />}
              <Text style={styles.status}>{subtitle}</Text>
            </View>
          </View>

          {convo.kind === "direct" && (
            <Pressable
              onPress={() => comingSoon("Voice calls")}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Call"
            >
              <Ionicons name="call-outline" size={26} color={colors.ink} />
            </Pressable>
          )}
          <Pressable
            onPress={openMenu}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-vertical" size={22} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.headerDivider} />

        {/* Messages */}
        <FlatList
          data={items}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.type === "day" ? (
              <View style={styles.dayWrap}>
                <View style={styles.dayPill}>
                  <Text style={styles.dayText}>{item.label}</Text>
                </View>
              </View>
            ) : (
              <MessageRow message={item.message} convo={convo} firstOfRun={item.firstOfRun} />
            )
          }
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            // An inverted list flips its empty state too, so flip it back.
            <View style={[styles.startWrap, styles.flipped]}>
              <Text style={styles.startText}>No messages yet. Say hi to {convo.name.split(" ")[0]}! 👋</Text>
            </View>
          }
        />

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: keyboardUp ? spacing.sm : Math.max(insets.bottom, spacing.sm) },
          ]}
        >
          <Pressable
            onPress={() => comingSoon("Attachments")}
            style={styles.roundButton}
            accessibilityRole="button"
            accessibilityLabel="Add attachment"
          >
            <Ionicons name="add" size={26} color={colors.primary} />
          </Pressable>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={draft}
              onChangeText={setDraft}
              multiline
            />
            <Pressable
              onPress={() => Alert.alert("Emoji", "Tap the emoji key on your keyboard to add emoji.")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Emoji"
            >
              <Ionicons name="happy-outline" size={26} color={colors.body} />
            </Pressable>
          </View>

          {draft.trim().length > 0 ? (
            <Pressable
              onPress={send}
              style={[styles.roundButton, styles.sendButton]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => comingSoon("Voice messages")}
              style={styles.roundButton}
              accessibilityRole="button"
              accessibilityLabel="Record voice message"
            >
              <Ionicons name="mic-outline" size={24} color={colors.body} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function MessageRow({
  message,
  convo,
  firstOfRun,
}: {
  message: ChatMessage;
  convo: Conversation;
  firstOfRun: boolean;
}) {
  const mine = message.from === ME;
  // The list is inverted, so the space *below* a row (in layout) is the space
  // above it on screen.
  const gap = { marginBottom: firstOfRun ? 14 : 4 };
  // Short messages show the time on the same line, like the mockup.
  const inline = message.text.length <= 22 && !message.text.includes("\n");
  const time = formatTime(message.sentAt);

  if (mine) {
    return (
      <View style={[styles.mineRow, gap]}>
        <View style={[styles.bubble, styles.bubbleMine, inline && styles.bubbleInline]}>
          <Text style={styles.textMine}>{message.text}</Text>
          <View style={[styles.metaMine, inline && styles.metaInline]}>
            <Text style={styles.timeMine}>{time}</Text>
            <Ionicons name="checkmark-done" size={15} color="rgba(255,255,255,0.85)" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.theirsRow, gap]}>
      <View style={styles.avatarSlot}>
        {firstOfRun ? <Avatar name={message.from} size={32} /> : null}
      </View>
      <View style={styles.theirsColumn}>
        {firstOfRun && convo.kind === "group" ? (
          <Text style={styles.senderName}>{message.from}</Text>
        ) : null}
        <View style={[styles.bubble, styles.bubbleTheirs, inline && styles.bubbleInline]}>
          <Text style={styles.textTheirs}>{message.text}</Text>
          <Text style={[styles.timeTheirs, inline && styles.timeInline]}>{time}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 2,
  },
  headerDivider: {
    height: 1,
    marginHorizontal: spacing.lg - 4,
    backgroundColor: "#EEF0F6",
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  status: {
    fontSize: 14,
    color: colors.body,
  },

  // Messages
  messages: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    // Inverted list: "top" padding is the gap above the input bar.
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  flipped: {
    transform: [{ scaleY: -1 }],
  },
  dayWrap: {
    alignItems: "center",
    marginVertical: 12,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "#F1F2F6",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.body,
  },
  startWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  startText: {
    fontSize: 14,
    color: colors.body,
    textAlign: "center",
  },
  bubble: {
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 9,
    borderRadius: 22,
  },
  // Short message: text and time side by side.
  bubbleInline: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingBottom: 10,
  },
  metaInline: {
    marginTop: 0,
  },
  timeInline: {
    marginTop: 0,
  },
  mineRow: {
    alignItems: "flex-end",
  },
  bubbleMine: {
    maxWidth: "80%",
    backgroundColor: colors.primary,
  },
  textMine: {
    fontSize: 16,
    lineHeight: 22,
    color: "#FFFFFF",
  },
  metaMine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 3,
  },
  timeMine: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  theirsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  avatarSlot: {
    width: 32,
    alignSelf: "flex-start",
  },
  theirsColumn: {
    maxWidth: "78%",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.body,
    marginBottom: 3,
    marginLeft: 4,
  },
  bubbleTheirs: {
    backgroundColor: "#F1F2F8",
  },
  textTheirs: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
  timeTheirs: {
    fontSize: 12,
    color: colors.body,
    marginTop: 3,
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F4FE",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    backgroundColor: colors.primary,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    paddingLeft: 18,
    paddingRight: 12,
    borderRadius: 22,
    backgroundColor: "#F1F4FE",
  },
  input: {
    flex: 1,
    maxHeight: 110,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.ink,
  },

  // Chat not found
  missingTop: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
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
});