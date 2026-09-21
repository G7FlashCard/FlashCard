import { useEffect, useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Avatar } from "./Avatar";
import { CONTACTS } from "./chatStore";
import { useDecks } from "./deckRepo";
import type { StoredDeck } from "./deckRepo";
import PostCard from "./PostCard";
import {
  ACHIEVEMENTS,
  AUDIENCES,
  CURRENT_USER,
  MOODS,
  addPost,
  extractHashtags,
  parseTags,
} from "./postStore";
import type { Audience, Mood, Post, PostStats } from "./postStore";
import { colors, radius, spacing } from "./theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type InitialAttach = "progress" | "achievement" | null;

type Props = {
  /** Pre-attach something when opened from a quick action on the Timeline. */
  initialAttach?: InitialAttach;
  onClose: () => void;
};

type SheetKind = "audience" | "deck" | "mood" | "friends" | "achievement";
type DialogKind = "location" | "hashtags";

const MAX_LENGTH = 500;
const DEFAULT_STATS: PostStats = { cards: 50, quiz: 85, streak: 7 };

const comingSoon = (feature: string) => Alert.alert(feature, "This feature is coming soon.");

export default function CreatePostScreen({ initialAttach = null, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const decks = useDecks();

  const [text, setText] = useState("");
  const [audience, setAudience] = useState<Audience>("public");
  const [stats, setStats] = useState<PostStats | null>(initialAttach === "progress" ? DEFAULT_STATS : null);
  const [achievement, setAchievement] = useState<string | null>(null);
  const [isQuestion, setIsQuestion] = useState(false);
  const [deck, setDeck] = useState<StoredDeck | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [typedTags, setTypedTags] = useState<string[]>([]);

  const [sheet, setSheet] = useState<SheetKind | null>(initialAttach === "achievement" ? "achievement" : null);
  const [dialog, setDialog] = useState<DialogKind | null>(null);

  const hashtags = useMemo(
    () => Array.from(new Set([...typedTags, ...extractHashtags(text)])),
    [typedTags, text]
  );

  const hasContent =
    text.trim().length > 0 || stats !== null || achievement !== null || deck !== null;
  const dirty = hasContent || isQuestion || mood !== null || friends.length > 0 || location !== "";

  const audienceInfo = AUDIENCES.find((a) => a.key === audience)!;

  const requestClose = () => {
    if (!dirty) {
      onClose();
      return;
    }
    Alert.alert("Discard post?", "Your post won't be saved.", [
      { text: "Keep Editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: onClose },
    ]);
  };

  // Android back button: close a sheet/dialog first, then ask about the draft.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (dialog) setDialog(null);
      else if (sheet) setSheet(null);
      else requestClose();
      return true;
    });
    return () => sub.remove();
  });

  const submit = () => {
    if (!hasContent) return;
    addPost({
      text: text.trim(),
      audience,
      mood: mood ?? undefined,
      location: location.trim() || undefined,
      taggedFriends: friends,
      deck: deck
        ? {
            id: deck.id,
            title: deck.title,
            cardCount: deck.cardCount,
            icon: deck.icon,
            color: deck.color,
            tint: deck.tint,
          }
        : undefined,
      hashtags,
      stats: stats ?? undefined,
      achievement: achievement ?? undefined,
      isQuestion: isQuestion || undefined,
    });
    onClose();
  };

  const preview: Post = {
    id: "preview",
    author: CURRENT_USER,
    relation: "me",
    createdAt: Date.now(),
    text: text.trim(),
    audience,
    mood: mood ?? undefined,
    location: location.trim() || undefined,
    taggedFriends: friends,
    deck: deck
      ? {
          id: deck.id,
          title: deck.title,
          cardCount: deck.cardCount,
          icon: deck.icon,
          color: deck.color,
          tint: deck.tint,
        }
      : undefined,
    hashtags,
    stats: stats ?? undefined,
    achievement: achievement ?? undefined,
    isQuestion,
    images: 0,
    likes: 0,
    liked: false,
    comments: 0,
    reposts: 0,
    reposted: false,
    saved: false,
  };

  // --- attachment tiles -----------------------------------------------------

  const tiles: {
    key: string;
    label: string;
    icon: IconName;
    color: string;
    tint: string;
    active: boolean;
    onPress: () => void;
  }[] = [
    {
      key: "photo",
      label: "Photo/Video",
      icon: "image-outline",
      color: "#22A559",
      tint: "#E7FBEE",
      active: false,
      onPress: () => comingSoon("Photo/Video"),
    },
    {
      key: "progress",
      label: "Study Progress",
      icon: "stats-chart",
      color: colors.primary,
      tint: colors.primaryTint,
      active: stats !== null,
      onPress: () => setStats((s) => (s ? null : DEFAULT_STATS)),
    },
    {
      key: "achievement",
      label: "Achievement",
      icon: "trophy",
      color: "#F5A623",
      tint: "#FFF6E5",
      active: achievement !== null,
      onPress: () => (achievement ? setAchievement(null) : setSheet("achievement")),
    },
    {
      key: "question",
      label: "Question",
      icon: "help-circle",
      color: "#8B5CF6",
      tint: "#EDE9FE",
      active: isQuestion,
      onPress: () => setIsQuestion((q) => !q),
    },
    {
      key: "more",
      label: "More",
      icon: "ellipsis-horizontal",
      color: colors.body,
      tint: "#F1F2F6",
      active: false,
      onPress: () => comingSoon("More attachments"),
    },
  ];

  const updateStat = (key: keyof PostStats, raw: string, max: number) => {
    const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    const value = Number.isNaN(n) ? 0 : Math.min(n, max);
    setStats((s) => (s ? { ...s, [key]: value } : s));
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.root} edges={["top"]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={requestClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={30} color={colors.ink} />
          </Pressable>
          <Text style={styles.topTitle}>Create Post</Text>
          <Pressable
            onPress={submit}
            disabled={!hasContent}
            style={[styles.postButton, !hasContent && styles.postButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Post"
          >
            <Text style={styles.postButtonText}>Post</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {/* Author + audience */}
          <View style={styles.authorRow}>
            <Avatar name={CURRENT_USER} size={58} />
            <Pressable
              onPress={() => setSheet("audience")}
              style={styles.audienceButton}
              accessibilityRole="button"
              accessibilityLabel={`Audience: ${audienceInfo.label}`}
            >
              <Ionicons name={audienceInfo.icon} size={20} color={colors.ink} />
              <Text style={styles.audienceText}>{audienceInfo.label}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.ink} />
            </Pressable>
          </View>

          {/* Text */}
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            maxLength={MAX_LENGTH}
            multiline
            autoFocus
            textAlignVertical="top"
          />
          <Text style={styles.counter}>
            {text.length}/{MAX_LENGTH}
          </Text>

          {/* Attached things you can edit */}
          {stats && (
            <View style={styles.attachCard}>
              <View style={styles.attachHeader}>
                <Text style={styles.attachTitle}>Study progress</Text>
                <Pressable onPress={() => setStats(null)} hitSlop={10} accessibilityLabel="Remove study progress">
                  <Ionicons name="close-circle" size={22} color="#9CA3AF" />
                </Pressable>
              </View>
              <View style={styles.statInputs}>
                <StatInput
                  label="Cards studied"
                  value={String(stats.cards)}
                  onChange={(t) => updateStat("cards", t, 999)}
                />
                <StatInput
                  label="Quiz score %"
                  value={String(stats.quiz)}
                  onChange={(t) => updateStat("quiz", t, 100)}
                />
                <StatInput
                  label="Day streak"
                  value={String(stats.streak)}
                  onChange={(t) => updateStat("streak", t, 999)}
                />
              </View>
            </View>
          )}

          {(achievement || isQuestion) && (
            <View style={styles.chipRow}>
              {achievement && (
                <RemovableChip
                  icon="trophy"
                  color="#F5A623"
                  label={achievement}
                  onRemove={() => setAchievement(null)}
                />
              )}
              {isQuestion && (
                <RemovableChip
                  icon="help-circle"
                  color="#8B5CF6"
                  label="Question"
                  onRemove={() => setIsQuestion(false)}
                />
              )}
            </View>
          )}

          {/* Attachment tiles */}
          <View style={styles.tiles}>
            {tiles.map((tile) => (
              <Pressable
                key={tile.key}
                onPress={tile.onPress}
                style={[
                  styles.tile,
                  { backgroundColor: tile.tint },
                  tile.active && { borderColor: tile.color },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: tile.active }}
              >
                <Ionicons name={tile.icon} size={26} color={tile.color} />
                <Text style={styles.tileLabel}>{tile.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Add to your post */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add to your post (optional)</Text>

            <AddRow
              leading={<Ionicons name="book-outline" size={22} color="#8B5CF6" />}
              tint="#EDE9FE"
              title="Deck"
              subtitle={deck ? deck.title : "Share a deck you're studying"}
              active={deck !== null}
              onPress={() => setSheet("deck")}
              onClear={() => setDeck(null)}
            />
            <AddRow
              leading={<Ionicons name="happy-outline" size={22} color="#F5A623" />}
              tint="#FFF6E5"
              title="Mood"
              subtitle={mood ? `${mood.emoji} ${mood.label}` : "How are you feeling?"}
              active={mood !== null}
              onPress={() => setSheet("mood")}
              onClear={() => setMood(null)}
            />
            <AddRow
              leading={<Ionicons name="people-outline" size={22} color={colors.primary} />}
              tint={colors.primaryTint}
              title="Tag Friends"
              subtitle={
                friends.length > 0
                  ? friends.map((f) => f.split(" ")[0]).join(", ")
                  : "Mention your friends"
              }
              active={friends.length > 0}
              onPress={() => setSheet("friends")}
              onClear={() => setFriends([])}
            />
            <AddRow
              leading={<Ionicons name="location-outline" size={22} color={colors.primary} />}
              tint={colors.primaryTint}
              title="Add Location"
              subtitle={location || "Where are you studying?"}
              active={location !== ""}
              onPress={() => setDialog("location")}
              onClear={() => setLocation("")}
            />
            <AddRow
              leading={<Text style={styles.hashGlyph}>#</Text>}
              tint="#EDE9FE"
              title="Add Hashtags"
              subtitle={hashtags.length > 0 ? hashtags.join(" ") : "E.g. #Biology #StudyGram"}
              active={typedTags.length > 0}
              onPress={() => setDialog("hashtags")}
              onClear={() => setTypedTags([])}
              last
            />
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Post Preview</Text>
            <PostCard post={preview} preview />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom sheet (drawn inside this screen, not a second Modal) */}
      {sheet && (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheet(null)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.handle} />
            {sheet === "audience" && (
              <OptionList
                title="Who can see this?"
                options={AUDIENCES.map((a) => ({ key: a.key, label: a.label, hint: a.hint, icon: a.icon }))}
                selected={[audience]}
                onPick={(key) => {
                  setAudience(key as Audience);
                  setSheet(null);
                }}
              />
            )}
            {sheet === "deck" && (
              <OptionList
                title="Share a deck"
                emptyText="You don't have any decks yet. Create one in the Decks tab."
                options={decks.map((d) => ({
                  key: d.id,
                  label: d.title,
                  hint: `${d.cardCount} cards`,
                  icon: d.icon,
                }))}
                selected={deck ? [deck.id] : []}
                onPick={(key) => {
                  setDeck(decks.find((d) => d.id === key) ?? null);
                  setSheet(null);
                }}
              />
            )}
            {sheet === "mood" && (
              <OptionList
                title="How are you feeling?"
                options={MOODS.map((m) => ({ key: m.label, label: m.label, emoji: m.emoji }))}
                selected={mood ? [mood.label] : []}
                onPick={(key) => {
                  setMood(MOODS.find((m) => m.label === key) ?? null);
                  setSheet(null);
                }}
              />
            )}
            {sheet === "friends" && (
              <OptionList
                title="Tag friends"
                options={CONTACTS.map((name) => ({ key: name, label: name, avatar: name }))}
                selected={friends}
                multi
                onPick={(key) =>
                  setFriends((prev) =>
                    prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
                  )
                }
                onDone={() => setSheet(null)}
              />
            )}
            {sheet === "achievement" && (
              <OptionList
                title="Choose an achievement"
                options={ACHIEVEMENTS.map((a) => ({ key: a, label: a, icon: "trophy" as IconName }))}
                selected={achievement ? [achievement] : []}
                onPick={(key) => {
                  setAchievement(key);
                  setSheet(null);
                }}
              />
            )}
          </View>
        </View>
      )}

      {/* Small text dialogs */}
      {dialog === "location" && (
        <PromptDialog
          title="Add Location"
          placeholder="e.g. City Library"
          initial={location}
          onCancel={() => setDialog(null)}
          onSave={(value) => {
            setLocation(value.trim());
            setDialog(null);
          }}
        />
      )}
      {dialog === "hashtags" && (
        <PromptDialog
          title="Add Hashtags"
          placeholder="e.g. Biology StudyGram"
          initial={typedTags.join(" ")}
          onCancel={() => setDialog(null)}
          onSave={(value) => {
            setTypedTags(parseTags(value));
            setDialog(null);
          }}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function StatInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <View style={styles.statInputWrap}>
      <TextInput
        style={styles.statInput}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={3}
        selectTextOnFocus
      />
      <Text style={styles.statInputLabel}>{label}</Text>
    </View>
  );
}

function RemovableChip({
  icon,
  color,
  label,
  onRemove,
}: {
  icon: IconName;
  color: string;
  label: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.chipText}>{label}</Text>
      <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${label}`}>
        <Ionicons name="close" size={16} color={colors.body} />
      </Pressable>
    </View>
  );
}

function AddRow({
  leading,
  tint,
  title,
  subtitle,
  active,
  onPress,
  onClear,
  last,
}: {
  leading: ReactNode;
  tint: string;
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
  onClear: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.addRow, !last && styles.addRowGap, pressed && styles.addRowPressed]}
      accessibilityRole="button"
    >
      <View style={[styles.addIcon, { backgroundColor: tint }]}>{leading}</View>
      <View style={styles.flex}>
        <Text style={styles.addTitle}>{title}</Text>
        <Text style={[styles.addSubtitle, active && styles.addSubtitleActive]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {active ? (
        <Pressable onPress={onClear} hitSlop={10} accessibilityLabel={`Clear ${title}`}>
          <Ionicons name="close-circle" size={22} color="#9CA3AF" />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.ink} />
      )}
    </Pressable>
  );
}

type Option = {
  key: string;
  label: string;
  hint?: string;
  icon?: IconName;
  emoji?: string;
  avatar?: string;
};

function OptionList({
  title,
  options,
  selected,
  onPick,
  multi,
  onDone,
  emptyText,
}: {
  title: string;
  options: Option[];
  selected: string[];
  onPick: (key: string) => void;
  multi?: boolean;
  onDone?: () => void;
  emptyText?: string;
}) {
  return (
    <View>
      <Text style={styles.sheetTitle}>{title}</Text>
      <ScrollView style={styles.optionScroll} showsVerticalScrollIndicator={false}>
        {options.length === 0 && emptyText ? <Text style={styles.emptyText}>{emptyText}</Text> : null}
        {options.map((option) => {
          const isSelected = selected.includes(option.key);
          return (
            <Pressable
              key={option.key}
              onPress={() => onPick(option.key)}
              style={({ pressed }) => [styles.optionRow, pressed && styles.addRowPressed]}
              accessibilityRole={multi ? "checkbox" : "radio"}
              accessibilityState={{ selected: isSelected }}
            >
              {option.emoji ? (
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
              ) : option.avatar ? (
                <Avatar name={option.avatar} size={38} />
              ) : option.icon ? (
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={20} color={colors.primary} />
                </View>
              ) : null}
              <View style={styles.flex}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.hint ? <Text style={styles.optionHint}>{option.hint}</Text> : null}
              </View>
              {multi ? (
                <Ionicons
                  name={isSelected ? "checkbox" : "square-outline"}
                  size={24}
                  color={isSelected ? colors.primary : "#C7CBD9"}
                />
              ) : isSelected ? (
                <Ionicons name="checkmark" size={22} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
      {multi && onDone ? (
        <Pressable onPress={onDone} style={styles.doneButton} accessibilityRole="button">
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function PromptDialog({
  title,
  placeholder,
  initial,
  onCancel,
  onSave,
}: {
  title: string;
  placeholder: string;
  initial: string;
  onCancel: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <View style={[StyleSheet.absoluteFill, styles.dialogOverlay]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      <View style={styles.dialog}>
        <Text style={styles.dialogTitle}>{title}</Text>
        <TextInput
          style={styles.dialogInput}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => onSave(value)}
        />
        <View style={styles.dialogActions}>
          <Pressable onPress={onCancel} style={[styles.dialogButton, styles.dialogCancel]}>
            <Text style={styles.dialogCancelText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={() => onSave(value)} style={[styles.dialogButton, styles.dialogSave]}>
            <Text style={styles.dialogSaveText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  postButton: {
    minWidth: 76,
    height: 42,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  scroll: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
  },

  // Author
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  audienceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  audienceText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },

  // Text
  input: {
    minHeight: 130,
    marginTop: spacing.md,
    fontSize: 21,
    lineHeight: 29,
    color: colors.ink,
    paddingTop: 0,
  },
  counter: {
    alignSelf: "flex-end",
    fontSize: 14,
    color: colors.body,
    marginBottom: spacing.md,
  },

  // Attached items
  attachCard: {
    padding: 14,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
  },
  attachHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  attachTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  statInputs: {
    flexDirection: "row",
    gap: 10,
  },
  statInputWrap: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statInput: {
    width: "100%",
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  statInputLabel: {
    fontSize: 11,
    color: colors.body,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },

  // Tiles
  tiles: {
    flexDirection: "row",
    gap: 8,
  },
  tile: {
    flex: 1,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 2,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
  },

  // Sections
  section: {
    marginTop: spacing.lg,
    padding: 14,
    borderRadius: radius.lg + 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 12,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  addRowGap: {
    marginBottom: 8,
  },
  addRowPressed: {
    backgroundColor: "#F8F9FC",
  },
  addIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  hashGlyph: {
    fontSize: 24,
    fontWeight: "800",
    color: "#8B5CF6",
  },
  addTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  addSubtitle: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
  addSubtitleActive: {
    color: colors.primary,
    fontWeight: "600",
  },

  // Sheet
  overlay: {
    justifyContent: "flex-end",
    backgroundColor: "rgba(17, 25, 54, 0.4)",
  },
  sheet: {
    maxHeight: "75%",
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
  optionScroll: {
    maxHeight: 380,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: radius.md,
  },
  optionEmoji: {
    width: 38,
    fontSize: 26,
    textAlign: "center",
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
  },
  optionHint: {
    fontSize: 13,
    color: colors.body,
    marginTop: 1,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    paddingVertical: spacing.md,
  },
  doneButton: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  doneText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Dialog
  dialogOverlay: {
    alignItems: "center",
    paddingTop: 110,
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
    marginBottom: spacing.md,
  },
  dialogInput: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    fontSize: 16,
    color: colors.ink,
  },
  dialogActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.md,
  },
  dialogButton: {
    flex: 1,
    height: 46,
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
  dialogSave: {
    backgroundColor: colors.primary,
  },
  dialogSaveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});