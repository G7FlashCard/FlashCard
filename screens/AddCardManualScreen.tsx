import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { addCard } from "./cardStore";
import { getDeck, updateDeck, useDeck } from "./deckRepo";
import { colors, radius, spacing } from "./theme";

type Props = {
  deckId: string;
};

type Step = "front" | "back" | "success";

export default function AddCardManualScreen({ deckId }: Props) {
  const deck = useDeck(deckId);

  const [step, setStep] = useState<Step>("front");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const resetForm = () => {
    setFront("");
    setBack("");
    setStep("front");
  };

  const handleBackPress = () => {
    if (step === "back") {
      setStep("front");
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    if (!front.trim()) return;
    setStep("back");
  };

  const handleAddCard = () => {
    if (!back.trim()) return;
    addCard(deckId, { front: front.trim(), back: back.trim() });

    // Keep the deck's "N cards" count in step with the cards actually added.
    const current = getDeck(deckId);
    if (current) updateDeck(deckId, { cardCount: current.cardCount + 1 });

    setStep("success");
  };

  const handleAddAnother = () => {
    resetForm();
  };

  // Go straight back to the deck (not just one screen back to "Add Cards").
  const handleDone = () => {
    router.dismissTo(`/deck/${deckId}` as any);
  };

  if (step === "success") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Card Added!</Text>
          <Text style={styles.successBody}>
            Your card has been added to {deck?.title ?? "your deck"}.
          </Text>
        </View>

        <View style={styles.successActions}>
          <Pressable
            onPress={handleAddAnother}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedFade]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Add Another Card</Text>
          </Pressable>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressedFade]}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isFront = step === "front";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBackPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.headerButton}
          >
            <Ionicons name="chevron-back" size={26} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Add Card</Text>
          <Text style={styles.headerStep}>{isFront ? "1 / 2" : "2 / 2"}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: isFront ? "50%" : "100%" }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>{isFront ? "Front" : "Back"}</Text>
          <TextInput
            style={styles.textArea}
            value={isFront ? front : back}
            onChangeText={isFront ? setFront : setBack}
            placeholder={
              isFront ? "Enter the question or term...\ne.g. What is a cell?" : "Enter the answer or definition...\ne.g. The basic unit of life."
            }
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            autoFocus
          />

          <Pressable
            style={({ pressed }) => [styles.imageButton, pressed && styles.pressedFade]}
            accessibilityRole="button"
          >
            <Ionicons name="image-outline" size={18} color={colors.primary} />
            <Text style={styles.imageButtonText}>Add Image (Optional)</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          {isFront ? (
            <Pressable
              onPress={handleNext}
              disabled={!front.trim()}
              style={({ pressed }) => [
                styles.primaryButton,
                (!front.trim() || pressed) && styles.disabledOrPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View style={styles.footerRow}>
              <Pressable
                onPress={() => setStep("front")}
                style={({ pressed }) => [styles.secondaryButton, styles.footerHalf, pressed && styles.pressedFade]}
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back" size={18} color={colors.ink} />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleAddCard}
                disabled={!back.trim()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.footerHalf,
                  (!back.trim() || pressed) && styles.disabledOrPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Add Card</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pressedFade: {
    opacity: 0.85,
  },
  disabledOrPressed: {
    opacity: 0.5,
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
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  headerStep: {
    width: 32,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: colors.body,
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

  // Body
  body: {
    padding: spacing.lg - 4,
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 160,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    padding: 14,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginTop: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  // Footer
  footer: {
    padding: spacing.lg - 4,
    paddingTop: 0,
  },
  footerRow: {
    flexDirection: "row",
    gap: 12,
  },
  footerHalf: {
    flex: 1,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
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
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },

  // Success state
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
  },
  successBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  successActions: {
    padding: spacing.lg - 4,
    gap: 12,
  },
});