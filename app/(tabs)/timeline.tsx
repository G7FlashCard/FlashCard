import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Avatar } from "../../screens/Avatar";
import CreatePostScreen from "../../screens/CreatePostScreen";
import type { InitialAttach } from "../../screens/CreatePostScreen";
import PostCard from "../../screens/PostCard";
import {
  CURRENT_USER,
  removePost,
  toggleLike,
  toggleRepost,
  toggleSave,
  usePosts,
} from "../../screens/postStore";
import type { Post } from "../../screens/postStore";
import { colors, radius, spacing } from "../../screens/theme";

type FilterKey = "foryou" | "following" | "friends" | "mine";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "foryou", label: "For You" },
  { key: "following", label: "Following" },
  { key: "friends", label: "Friends" },
  { key: "mine", label: "My Posts" },
];

const EMPTY_TEXT: Record<FilterKey, { title: string; body: string }> = {
  foryou: { title: "Nothing here yet", body: "Be the first to share your progress!" },
  following: { title: "No posts from people you follow", body: "Follow more people to see their posts here." },
  friends: { title: "No posts from friends", body: "When your friends post, you'll see it here." },
  mine: { title: "You haven't posted yet", body: "Tap “What's on your mind?” to share your progress." },
};

const UNREAD_NOTIFICATIONS = 3;

const comingSoon = (feature: string) => Alert.alert(feature, "This feature is coming soon.");

export default function TimelineScreen() {
  const posts = usePosts();

  const [filter, setFilter] = useState<FilterKey>("foryou");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Create Post opens as a full-screen panel over this tab (no extra route).
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeKey, setComposeKey] = useState(0);
  const [composeInitial, setComposeInitial] = useState<InitialAttach>(null);

  const openCompose = (initial: InitialAttach = null) => {
    setComposeInitial(initial);
    setComposeKey((k) => k + 1); // fresh, empty draft every time
    setComposeOpen(true);
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...posts]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((post) => {
        if (filter === "mine") return post.relation === "me";
        if (filter === "friends") return post.relation === "friend";
        if (filter === "following") return post.relation === "friend" || post.relation === "following";
        return true;
      })
      .filter(
        (post) =>
          !q ||
          post.text.toLowerCase().includes(q) ||
          post.author.toLowerCase().includes(q) ||
          post.hashtags.some((tag) => tag.toLowerCase().includes(q))
      );
  }, [posts, filter, query]);

  const openMenu = (post: Post) => {
    if (post.relation === "me") {
      Alert.alert("Your post", undefined, [
        {
          text: "Delete Post",
          style: "destructive",
          onPress: () =>
            Alert.alert("Delete post?", "This can't be undone.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => removePost(post.id) },
            ]),
        },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    Alert.alert(post.author, undefined, [
      { text: "Hide Post", onPress: () => removePost(post.id) },
      { text: "Report Post", onPress: () => comingSoon("Report Post") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const hasSearch = query.trim().length > 0;
  const empty = hasSearch
    ? { title: "No results", body: `No posts match "${query.trim()}".` }
    : EMPTY_TEXT[filter];

  const feedHeader = (
    <View>
      {/* Composer */}
      <View style={styles.composer}>
        <View style={styles.composerTop}>
          <Avatar name={CURRENT_USER} size={52} />
          <Pressable
            onPress={() => openCompose()}
            style={styles.composerInput}
            accessibilityRole="button"
            accessibilityLabel="Create a post"
          >
            <Text style={styles.composerPlaceholder}>What's on your mind?</Text>
          </Pressable>
        </View>
        <View style={styles.quickRow}>
          <QuickAction
            icon="image-outline"
            color="#22A559"
            label="Photo"
            onPress={() => comingSoon("Photo/Video")}
          />
          <QuickAction
            icon="book-outline"
            color={colors.primary}
            label="Study"
            onPress={() => openCompose("progress")}
          />
          <QuickAction
            icon="trophy"
            color="#F5A623"
            label="Achievement"
            onPress={() => openCompose("achievement")}
          />
          <QuickAction
            icon="ellipsis-horizontal"
            color={colors.primary}
            label="More"
            onPress={() => openCompose()}
          />
        </View>
      </View>

      {/* Filters */}
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
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Timeline</Text>
          <Text style={styles.subtitle}>Share your progress. Inspire others. 📚</Text>
        </View>
        <Pressable
          onPress={() => {
            setSearchOpen((open) => !open);
            if (searchOpen) setQuery("");
          }}
          hitSlop={10}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Search posts"
        >
          <Ionicons name={searchOpen ? "close" : "search-outline"} size={26} color={colors.ink} />
        </Pressable>
        <Pressable
          onPress={() => comingSoon("Notifications")}
          hitSlop={10}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={`Notifications, ${UNREAD_NOTIFICATIONS} new`}
        >
          <Ionicons name="notifications-outline" size={26} color={colors.ink} />
          {UNREAD_NOTIFICATIONS > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{UNREAD_NOTIFICATIONS}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {searchOpen && (
        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={colors.body} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, people, #tags"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoFocus
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
      )}

      <FlatList
        data={list}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => toggleLike(item.id)}
            onRepost={() => toggleRepost(item.id)}
            onSave={() => toggleSave(item.id)}
            onComment={() => comingSoon("Comments")}
            onMenu={() => openMenu(item)}
          />
        )}
        ListHeaderComponent={feedHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptyBody}>{empty.body}</Text>
          </View>
        }
        contentContainerStyle={styles.feed}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={composeOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => setComposeOpen(false)}
      >
        <CreatePostScreen
          key={composeKey}
          initialAttach={composeInitial}
          onClose={() => setComposeOpen(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  color,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quick} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.body,
    marginTop: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    marginHorizontal: spacing.lg - 4,
    marginBottom: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: "#F1F4FE",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
  },

  // Feed
  feed: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.lg,
  },

  // Composer
  composer: {
    padding: 14,
    marginBottom: spacing.md,
    borderRadius: radius.lg + 4,
    backgroundColor: "#EEF2FF",
  },
  composerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  composerInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  composerPlaceholder: {
    fontSize: 16,
    color: "#8A94B0",
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  quick: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.ink,
  },

  // Filter chips
  chips: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    flex: 1,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: "#F1F4FE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.body,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },

  // Empty state
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
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
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});