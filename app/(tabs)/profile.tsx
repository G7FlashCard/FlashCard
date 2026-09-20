import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useDecks } from "../../screens/deckRepo";
import type { StoredDeck } from "../../screens/deckRepo";
import { colors, radius, spacing } from "../../screens/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

// ---------------------------------------------------------------------------
// Sample profile data. Nothing is saved yet, so edits reset when the app
// closes. Your deck count and favorites are real (from the shared deck store).
// ---------------------------------------------------------------------------

type Profile = {
  name: string;
  username: string;
  bio: string;
};

const INITIAL_PROFILE: Profile = {
  name: "April Lentejas",
  username: "april.lentejas",
  bio: "Keep learning, keep growing! ✨",
};

const FOLLOWERS = 248;
const FOLLOWING = 180;

const HIGHLIGHTS: { key: string; label: string; icon: IconName }[] = [
  { key: "study", label: "Study", icon: "book-outline" },
  { key: "notes", label: "Notes", icon: "document-text-outline" },
  { key: "goals", label: "Goals", icon: "flag-outline" },
  { key: "moments", label: "Moments", icon: "sparkles-outline" },
];

type GridTab = "decks" | "saved" | "badges";

const GRID_TABS: { key: GridTab; icon: IconName; iconActive: IconName; label: string }[] = [
  { key: "decks", icon: "grid-outline", iconActive: "grid", label: "My decks" },
  { key: "saved", icon: "bookmark-outline", iconActive: "bookmark", label: "Favorite decks" },
  { key: "badges", icon: "trophy-outline", iconActive: "trophy", label: "Badges" },
];

type Badge = { key: string; label: string; icon: IconName; earned: boolean };

const comingSoon = (feature: string) => Alert.alert(feature, "This feature is coming soon.");

export default function ProfileScreen() {
  const decks = useDecks();
  const { width } = useWindowDimensions();

  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [gridTab, setGridTab] = useState<GridTab>("decks");
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const favorites = decks.filter((deck) => deck.favorite);

  const badges: Badge[] = [
    { key: "first", label: "First Deck", icon: "albums-outline", earned: decks.length >= 1 },
    { key: "streak", label: "7-Day Streak", icon: "flame-outline", earned: true },
    { key: "quiz", label: "Quiz Whiz", icon: "trophy-outline", earned: true },
    { key: "book", label: "Bookworm", icon: "book-outline", earned: false },
    { key: "social", label: "Social Butterfly", icon: "people-outline", earned: false },
    { key: "perfect", label: "Perfect Score", icon: "star-outline", earned: false },
  ];

  // 3 columns filling the screen width.
  const sidePadding = spacing.lg - 4;
  const gap = 6;
  const tileSize = Math.floor((width - sidePadding * 2 - gap * 2) / 3);

  const confirmLogout = () =>
    Alert.alert("Log out?", "You'll need to log in again to continue.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => router.replace("/login") },
    ]);

  const settingsItems: SheetItem[] = [
    { key: "notifications", label: "Notifications", icon: "notifications-outline", onPress: () => comingSoon("Notifications") },
    { key: "privacy", label: "Privacy & Security", icon: "shield-checkmark-outline", onPress: () => comingSoon("Privacy & Security") },
    { key: "help", label: "Help & Support", icon: "help-circle-outline", onPress: () => comingSoon("Help & Support") },
    { key: "about", label: "About FlashLearn", icon: "information-circle-outline", onPress: () => comingSoon("About") },
    { key: "logout", label: "Log Out", icon: "log-out-outline", destructive: true, onPress: confirmLogout },
  ];

  const openDeck = (id: string) => router.push(`/deck/${id}` as any);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top bar: username + settings */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => comingSoon("Switch account")}
            style={styles.usernameButton}
            accessibilityRole="button"
            accessibilityLabel="Switch account"
          >
            <Text style={styles.username} numberOfLines={1}>
              {profile.username}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.ink} />
          </Pressable>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={24} color={colors.ink} />
          </Pressable>
        </View>

        {/* Avatar + stats */}
        <View style={styles.identityRow}>
          <Pressable
            onPress={() => comingSoon("Profile photo")}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(profile.name)}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </View>
          </Pressable>

          <View style={styles.stats}>
            <Stat value={decks.length} label="Decks" />
            <Stat value={FOLLOWERS} label="Followers" />
            <Stat value={FOLLOWING} label="Following" />
          </View>
        </View>

        {/* Name, bio, tags */}
        <Text style={styles.name}>{profile.name}</Text>
        {profile.bio.length > 0 && <Text style={styles.bio}>{profile.bio}</Text>}
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Ionicons name="school-outline" size={15} color={colors.body} />
            <Text style={styles.tagText}>Student</Text>
          </View>
          <View style={styles.tagDivider} />
          <View style={styles.tag}>
            <Ionicons name="library-outline" size={15} color={colors.body} />
            <Text style={styles.tagText}>Lifelong Learner</Text>
          </View>
        </View>

        {/* Edit profile */}
        <View style={styles.editRow}>
          <Pressable
            onPress={() => setEditOpen(true)}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </Pressable>
          <Pressable
            onPress={() => router.navigate("/friends")}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Find friends"
          >
            <Ionicons name="person-add-outline" size={20} color={colors.ink} />
          </Pressable>
        </View>

        {/* Highlights */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlights}
        >
          <Highlight label="New" icon="add" dashed onPress={() => comingSoon("New highlight")} />
          {HIGHLIGHTS.map((item) => (
            <Highlight
              key={item.key}
              label={item.label}
              icon={item.icon}
              onPress={() => comingSoon(item.label)}
            />
          ))}
        </ScrollView>

        {/* Grid tabs */}
        <View style={styles.gridTabs}>
          {GRID_TABS.map((t) => {
            const active = t.key === gridTab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setGridTab(t.key)}
                style={styles.gridTab}
                accessibilityRole="tab"
                accessibilityLabel={t.label}
                accessibilityState={{ selected: active }}
              >
                <Ionicons
                  name={active ? t.iconActive : t.icon}
                  size={24}
                  color={active ? colors.primary : "#9CA3AF"}
                />
                {active && <View style={styles.gridTabUnderline} />}
              </Pressable>
            );
          })}
        </View>

        {/* Grid content */}
        <View style={[styles.grid, { paddingHorizontal: sidePadding, gap }]}>
          {gridTab === "decks" &&
            (decks.length === 0 ? (
              <GridEmpty
                icon="albums-outline"
                title="No decks yet"
                body="Create a deck in the Decks tab and it will show up here."
              />
            ) : (
              decks.map((deck) => (
                <DeckTile key={deck.id} deck={deck} size={tileSize} onPress={() => openDeck(deck.id)} />
              ))
            ))}

          {gridTab === "saved" &&
            (favorites.length === 0 ? (
              <GridEmpty
                icon="bookmark-outline"
                title="No favorites yet"
                body="Open a deck, tap More, and choose Add to Favorites."
              />
            ) : (
              favorites.map((deck) => (
                <DeckTile key={deck.id} deck={deck} size={tileSize} onPress={() => openDeck(deck.id)} />
              ))
            ))}

          {gridTab === "badges" &&
            badges.map((badge) => <BadgeTile key={badge.key} badge={badge} size={tileSize} />)}
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={(next) => {
          setProfile(next);
          setEditOpen(false);
        }}
      />

      <ActionSheet
        visible={settingsOpen}
        title="Settings"
        items={settingsItems}
        onClose={() => setSettingsOpen(false)}
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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Highlight({
  label,
  icon,
  dashed,
  onPress,
}: {
  label: string;
  icon: IconName;
  dashed?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.highlight}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.highlightCircle, dashed && styles.highlightDashed]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.highlightLabel}>{label}</Text>
    </Pressable>
  );
}

function DeckTile({
  deck,
  size,
  onPress,
}: {
  deck: StoredDeck;
  size: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size, backgroundColor: deck.tint },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${deck.title}, ${deck.cardCount} cards`}
    >
      <Ionicons name={deck.icon} size={28} color={deck.color} />
      <Text style={styles.tileTitle} numberOfLines={2}>
        {deck.title}
      </Text>
      <Text style={styles.tileMeta}>{deck.cardCount} cards</Text>
    </Pressable>
  );
}

function BadgeTile({ badge, size }: { badge: Badge; size: number }) {
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size },
        badge.earned ? styles.badgeEarned : styles.badgeLocked,
      ]}
      accessibilityLabel={`${badge.label}, ${badge.earned ? "earned" : "locked"}`}
    >
      <Ionicons
        name={badge.earned ? badge.icon : "lock-closed-outline"}
        size={28}
        color={badge.earned ? colors.primary : "#9CA3AF"}
      />
      <Text style={[styles.tileTitle, !badge.earned && styles.tileTitleLocked]} numberOfLines={2}>
        {badge.label}
      </Text>
    </View>
  );
}

function GridEmpty({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={styles.gridEmpty}>
      <View style={styles.gridEmptyIcon}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.gridEmptyTitle}>{title}</Text>
      <Text style={styles.gridEmptyBody}>{body}</Text>
    </View>
  );
}

function EditProfileModal({
  visible,
  profile,
  onClose,
  onSave,
}: {
  visible: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);

  // Start from the current values every time the dialog opens.
  useEffect(() => {
    if (visible) {
      setName(profile.name);
      setUsername(profile.username);
      setBio(profile.bio);
    }
  }, [visible, profile]);

  const cleanName = name.trim();
  const cleanUsername = username.trim().replace(/^@/, "");
  const canSave = cleanName.length > 0 && cleanUsername.length > 0;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <Text style={styles.dialogTitle}>Edit Profile</Text>

          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(text) => setUsername(text.replace(/[^a-zA-Z0-9._]/g, ""))}
            placeholder="username"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself"
            placeholderTextColor="#9CA3AF"
            maxLength={80}
            multiline
          />
          <Text style={styles.counter}>{bio.length}/80</Text>

          <View style={styles.dialogActions}>
            <Pressable onPress={onClose} style={[styles.dialogButton, styles.dialogCancel]}>
              <Text style={styles.dialogCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave({ name: cleanName, username: cleanUsername, bio: bio.trim() })}
              disabled={!canSave}
              style={[styles.dialogButton, styles.dialogSave, !canSave && styles.dialogSaveDisabled]}
            >
              <Text style={styles.dialogSaveText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type SheetItem = {
  key: string;
  label: string;
  icon: IconName;
  destructive?: boolean;
  onPress: () => void;
};

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

  // Close first, then run the action. Showing an Alert while the sheet is
  // still closing can silently fail on iOS.
  const choose = (item: SheetItem) => {
    onClose();
    setTimeout(item.onPress, 350);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
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
              style={({ pressed }) => [styles.sheetItem, pressed && styles.sheetItemPressed]}
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
  scroll: {
    paddingBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.8,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  usernameButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
    marginRight: spacing.md,
  },
  username: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    flexShrink: 1,
  },

  // Identity
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg - 4,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.primary,
  },
  avatarBadge: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  stats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  statLabel: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },

  // Bio
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg - 4,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    marginTop: 4,
    paddingHorizontal: spacing.lg - 4,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    paddingHorizontal: spacing.lg - 4,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.body,
  },
  tagDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
  },

  // Edit row
  editRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg - 4,
  },
  editButton: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: "#F1F2F6",
    alignItems: "center",
    justifyContent: "center",
  },
  editText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  iconButton: {
    width: 46,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: "#F1F2F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Highlights
  highlights: {
    gap: 16,
    paddingHorizontal: spacing.lg - 4,
    paddingVertical: spacing.md,
  },
  highlight: {
    alignItems: "center",
    gap: 6,
    width: 64,
  },
  highlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightDashed: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },

  // Grid tabs
  gridTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gridTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  gridTabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
    backgroundColor: colors.primary,
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: spacing.md,
  },
  tile: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 8,
  },
  tileTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
  },
  tileTitleLocked: {
    color: "#9CA3AF",
  },
  tileMeta: {
    fontSize: 11,
    color: colors.body,
  },
  badgeEarned: {
    backgroundColor: colors.primaryTint,
  },
  badgeLocked: {
    backgroundColor: "#F3F4F6",
  },
  gridEmpty: {
    width: "100%",
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  gridEmptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  gridEmptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  gridEmptyBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.body,
    textAlign: "center",
    marginTop: 6,
  },

  // Edit profile dialog
  backdrop: {
    flex: 1,
    alignItems: "center",
    paddingTop: 90,
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
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: 6,
  },
  input: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    fontSize: 15,
    color: colors.ink,
  },
  bioInput: {
    height: undefined,
    minHeight: 64,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
  counter: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: colors.body,
    marginTop: 4,
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
  dialogSave: {
    backgroundColor: colors.primary,
  },
  dialogSaveDisabled: {
    opacity: 0.4,
  },
  dialogSaveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Settings sheet
  sheetBackdrop: {
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
  sheetItemPressed: {
    backgroundColor: "#F8F9FC",
  },
  sheetItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
  destructiveText: {
    color: "#E5484D",
  },
});