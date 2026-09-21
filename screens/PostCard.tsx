import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Avatar } from "./Avatar";
import { AUDIENCES, timeAgo } from "./postStore";
import type { Post } from "./postStore";
import { colors, radius } from "./theme";

type Props = {
  post: Post;
  /** Preview mode (Create Post): no like / comment / save row. */
  preview?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
  onSave?: () => void;
  onMenu?: () => void;
};

const PHOTO_TINTS = ["#E7FBEE", "#EAF2FE"];
const PHOTO_ICONS = ["book-outline", "laptop-outline"] as const;

export default function PostCard({ post, preview, onLike, onComment, onRepost, onSave, onMenu }: Props) {
  const audience = AUDIENCES.find((a) => a.key === post.audience);

  // "feeling 🤓 Focused  with Mia, Alex" after the author's name.
  const context = [
    post.mood ? `is feeling ${post.mood.emoji} ${post.mood.label}` : "",
    post.taggedFriends.length > 0
      ? `with ${post.taggedFriends.map((name) => name.split(" ")[0]).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const meta = [
    timeAgo(post.createdAt),
    post.location ? `📍 ${post.location}` : "",
    preview && audience ? audience.label : "",
  ]
    .filter(Boolean)
    .join(" • ");

  const hasBody = post.text.trim().length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar name={post.author} size={46} />
        <View style={styles.headerText}>
          <Text style={styles.author} numberOfLines={2}>
            {post.author}
            {context ? <Text style={styles.context}> {context}</Text> : null}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        </View>
        <Pressable
          onPress={onMenu}
          disabled={preview}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Post options"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.ink} />
        </Pressable>
      </View>

      {post.isQuestion && (
        <View style={styles.questionPill}>
          <Ionicons name="help-circle" size={15} color="#8B5CF6" />
          <Text style={styles.questionText}>Question</Text>
        </View>
      )}

      {hasBody ? (
        <Text style={styles.body}>{post.text}</Text>
      ) : preview ? (
        <Text style={styles.bodyPlaceholder}>This is how your post will look like.</Text>
      ) : null}

      {post.images > 0 && (
        <View style={styles.photos}>
          {Array.from({ length: Math.min(post.images, 2) }).map((_, i) => (
            <View key={i} style={[styles.photo, { backgroundColor: PHOTO_TINTS[i % 2] }]}>
              <Ionicons name={PHOTO_ICONS[i % 2]} size={34} color={colors.primary} />
              <Text style={styles.photoLabel}>Photo</Text>
            </View>
          ))}
        </View>
      )}

      {post.deck && (
        <Pressable
          onPress={() => router.push(`/deck/${post.deck!.id}` as any)}
          disabled={preview}
          style={styles.deckCard}
          accessibilityRole="button"
        >
          <View style={[styles.deckIcon, { backgroundColor: post.deck.tint }]}>
            <Ionicons name={post.deck.icon} size={22} color={post.deck.color} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.deckTitle}>{post.deck.title}</Text>
            <Text style={styles.deckMeta}>{post.deck.cardCount} cards</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      )}

      {post.achievement && (
        <View style={styles.achievement}>
          <View style={styles.achievementIcon}>
            <Ionicons name="trophy" size={22} color="#F5A623" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.achievementLabel}>Achievement unlocked</Text>
            <Text style={styles.achievementName}>{post.achievement}</Text>
          </View>
        </View>
      )}

      {post.stats && (
        <View style={styles.stats}>
          <Stat icon="book-outline" color={colors.primary} value={String(post.stats.cards)} label="Cards Studied" />
          <View style={styles.statDivider} />
          <Stat icon="trophy" color="#F5A623" value={`${post.stats.quiz}%`} label="Quiz Score" />
          <View style={styles.statDivider} />
          <Stat icon="flame" color={colors.flame} value={String(post.stats.streak)} label="Day Streak" />
        </View>
      )}

      {post.hashtags.length > 0 && (
        <View style={styles.tags}>
          {post.hashtags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {!preview && (
        <View style={styles.actions}>
          <ActionButton
            icon={post.liked ? "heart" : "heart-outline"}
            color={post.liked ? "#EF4444" : colors.ink}
            count={post.likes}
            label="Like"
            onPress={onLike}
          />
          <ActionButton icon="chatbubble-outline" count={post.comments} label="Comment" onPress={onComment} />
          <ActionButton
            icon="repeat"
            color={post.reposted ? colors.success : colors.ink}
            count={post.reposts}
            label="Repost"
            onPress={onRepost}
          />
          <View style={styles.flex} />
          <Pressable
            onPress={onSave}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={post.saved ? "Remove bookmark" : "Bookmark"}
          >
            <Ionicons
              name={post.saved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={post.saved ? colors.primary : colors.ink}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statTop}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  color = colors.ink,
  count,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  color?: string;
  count: number;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={styles.action}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${count}`}
    >
      <Ionicons name={icon} size={23} color={color} />
      <Text style={styles.actionCount}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    padding: 14,
    marginBottom: 14,
    borderRadius: radius.lg + 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  author: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  context: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.body,
  },
  meta: {
    fontSize: 13,
    color: colors.body,
    marginTop: 2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  bodyPlaceholder: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.body,
  },
  questionPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "#EDE9FE",
  },
  questionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B5CF6",
  },

  // Photos (placeholders)
  photos: {
    flexDirection: "row",
    gap: 8,
  },
  photo: {
    flex: 1,
    height: 150,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.body,
  },

  // Deck
  deckCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
  },
  deckIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deckTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  deckMeta: {
    fontSize: 12,
    color: colors.body,
    marginTop: 1,
  },

  // Achievement
  achievement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: "#FFF6E5",
  },
  achievementIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  achievementLabel: {
    fontSize: 12,
    color: colors.body,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 1,
  },

  // Stats
  stats: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  statLabel: {
    fontSize: 12,
    color: colors.body,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },

  // Hashtags
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  // Actions
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    paddingTop: 2,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
});