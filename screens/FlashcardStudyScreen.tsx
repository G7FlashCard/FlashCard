import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

import { toggleFavorite, useCards } from "./cardStore";
import { useDeck } from "./deckRepo";
import { colors, radius, spacing } from "./theme";

type Props = {
  deckId: string;
  /**
   * Called when the person closes the screen or finishes the last card.
   * Leave it out if this screen is opened as its own route (it then goes back).
   */
  onClose?: () => void;
};

export default function FlashcardStudyScreen({ deckId, onClose }: Props) {
  const deck = useDeck(deckId);
  const cards = useCards(deckId);

  const close = onClose ?? (() => router.back());

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const flip = useRef(new Animated.Value(0)).current;

  const card = cards[index];
  const total = cards.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // Reset the flip whenever we land on a new card.
  useEffect(() => {
    flip.setValue(0);
    setRevealed(false);
  }, [index, flip]);

  useEffect(() => {
    // Stop any speech in progress when leaving the card or unmounting.
    return () => {
      Speech.stop();
    };
  }, []);

  const flipCard = () => {
    Animated.spring(flip, {
      toValue: revealed ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setRevealed((r) => !r);
  };

  const goPrev = () => {
    if (isFirst) return;
    Speech.stop();
    setIndex((i) => i - 1);
  };

  const goNext = () => {
    if (isLast) {
      close();
      return;
    }
    Speech.stop();
    setIndex((i) => i + 1);
  };

  const speak = () => {
    if (!card) return;
    Speech.stop();
    Speech.speak(revealed ? card.back : card.front);
  };

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const progressLabel = useMemo(() => `${Math.min(index + 1, total)} / ${total}`, [index, total]);

  if (total === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={close}
            hitSlop={10}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={26} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No cards to study</Text>
          <Text style={styles.emptyBody}>Add some cards to this deck first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={close}
          hitSlop={10}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={26} color={colors.ink} />
        </Pressable>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {deck?.title ?? "Study"}
          </Text>
          <Text style={styles.headerProgress}>{progressLabel}</Text>
        </View>

        <Pressable
          onPress={speak}
          hitSlop={10}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Read card aloud"
        >
          <Ionicons name="volume-medium-outline" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((index + 1) / total) * 100}%` }]} />
      </View>

      <View style={styles.cardArea}>
        <Pressable onPress={flipCard} style={styles.cardTouchable} accessibilityRole="button">
          <Animated.View
            style={[styles.card, styles.cardFace, { opacity: frontOpacity, transform: [{ rotateY: frontRotate }] }]}
          >
            <Pressable
              onPress={() => toggleFavorite(card.id)}
              hitSlop={10}
              style={styles.starButton}
              accessibilityRole="button"
              accessibilityLabel="Toggle favorite"
            >
              <Ionicons
                name={card.favorite ? "star" : "star-outline"}
                size={22}
                color={card.favorite ? "#F5A623" : "#C4C9D4"}
              />
            </Pressable>
            <Text style={styles.cardText}>{card.front}</Text>
            <Text style={styles.cardHint}>Tap to reveal answer</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardFace,
              styles.cardBack,
              { opacity: backOpacity, transform: [{ rotateY: backRotate }] },
            ]}
          >
            <Pressable
              onPress={() => toggleFavorite(card.id)}
              hitSlop={10}
              style={styles.starButton}
              accessibilityRole="button"
              accessibilityLabel="Toggle favorite"
            >
              <Ionicons
                name={card.favorite ? "star" : "star-outline"}
                size={22}
                color={card.favorite ? "#F5A623" : "#C4C9D4"}
              />
            </Pressable>
            <Text style={styles.cardText}>{card.back}</Text>
            <Text style={styles.cardHint}>Tap to flip back</Text>
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={goPrev}
          disabled={isFirst}
          style={({ pressed }) => [
            styles.navButton,
            (isFirst || pressed) && styles.disabledOrPressed,
          ]}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={18} color={colors.ink} />
          <Text style={styles.navButtonText}>Previous</Text>
        </Pressable>

        <Pressable
          onPress={goNext}
          style={({ pressed }) => [styles.navButton, styles.navButtonPrimary, pressed && styles.pressedFade]}
          accessibilityRole="button"
        >
          <Text style={styles.navButtonTextPrimary}>{isLast ? "Finish" : "Next"}</Text>
          {!isLast && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
        </Pressable>
      </View>
    </SafeAreaView>
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
  disabledOrPressed: {
    opacity: 0.4,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
  },
  headerButton: {
    marginTop: 2,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  headerProgress: {
    fontSize: 12,
    color: colors.body,
    marginTop: 2,
  },

  // Progress bar
  progressTrack: {
    height: 4,
    backgroundColor: colors.primaryTint,
    marginHorizontal: spacing.lg - 4,
    marginTop: spacing.sm,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Card
  cardArea: {
    flex: 1,
    padding: spacing.lg - 4,
    paddingTop: spacing.lg,
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  cardFace: {
    backfaceVisibility: "hidden",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  starButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  cardText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 30,
  },
  cardHint: {
    position: "absolute",
    bottom: 20,
    fontSize: 12,
    color: colors.body,
  },

  // Footer
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: spacing.lg - 4,
    paddingTop: 0,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  navButtonPrimary: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  navButtonTextPrimary: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.body,
    marginTop: spacing.sm,
  },
});