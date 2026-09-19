import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../../screens/theme";

// ---------------------------------------------------------------------------
// UI-only mock of quiz taking. Question bank below is a stand-in — swap for
// the real, selected questions once there's a backend to pull them from.
// ---------------------------------------------------------------------------

type Question = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
};

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "What is a cell?",
    options: [
      { id: "a", text: "The basic unit of life" },
      { id: "b", text: "A type of tissue" },
      { id: "c", text: "A group of organs" },
      { id: "d", text: "A chemical compound" },
    ],
    correctId: "a",
  },
  {
    id: "q2",
    prompt: "What is the powerhouse of the cell?",
    options: [
      { id: "a", text: "Nucleus" },
      { id: "b", text: "Mitochondria" },
      { id: "c", text: "Ribosome" },
      { id: "d", text: "Cytoplasm" },
    ],
    correctId: "b",
  },
  {
    id: "q3",
    prompt: "Which structure controls what enters and exits the cell?",
    options: [
      { id: "a", text: "Cell wall" },
      { id: "b", text: "Golgi apparatus" },
      { id: "c", text: "Cell membrane" },
      { id: "d", text: "Vacuole" },
    ],
    correctId: "c",
  },
  {
    id: "q4",
    prompt: "What molecule carries genetic information?",
    options: [
      { id: "a", text: "RNA" },
      { id: "b", text: "ATP" },
      { id: "c", text: "Protein" },
      { id: "d", text: "DNA" },
    ],
    correctId: "d",
  },
];

export default function QuizTakingScreen() {
  const params = useLocalSearchParams<{ title?: string; total?: string }>();
  const total = Number(params.total) || MOCK_QUESTIONS.length;

  // Cycle the mock bank to fill however many questions were requested.
  const questions = useMemo(
    () => Array.from({ length: total }, (_, i) => MOCK_QUESTIONS[i % MOCK_QUESTIONS.length]),
    [total]
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = questions[index];
  const selectedOptionId = answers[index];
  const isLast = index === questions.length - 1;

  const selectOption = (optionId: string) => setAnswers((prev) => ({ ...prev, [index]: optionId }));

  const goPrevious = () => {
    if (index === 0) {
      router.back();
    } else {
      setIndex((i) => i - 1);
    }
  };

  const goNext = () => {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    const score = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctId ? 1 : 0),
      0
    );
    router.replace({
      pathname: "/quiz/result" as any,
      params: { score: String(score), total: String(questions.length) },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Close quiz">
          <Ionicons name="close" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.counter}>
          {index + 1}/{questions.length}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.prompt}</Text>
        </View>

        {question.options.map((option) => {
          const selected = option.id === selectedOptionId;
          return (
            <Pressable
              key={option.id}
              onPress={() => selectOption(option.id)}
              style={[styles.optionRow, selected && styles.optionRowSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Ionicons
                name={selected ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={selected ? colors.primary : "#C7CBD9"}
              />
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option.id.toUpperCase()}. {option.text}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={goPrevious} style={[styles.footerButton, styles.backButton]}>
          <Ionicons name="arrow-back" size={16} color={colors.ink} />
          <Text style={styles.backButtonText}>Previous</Text>
        </Pressable>
        <Pressable
          onPress={goNext}
          disabled={!selectedOptionId}
          style={[styles.footerButton, styles.nextButton, !selectedOptionId && styles.nextButtonDisabled]}
        >
          <Text style={styles.nextButtonText}>{isLast ? "Finish" : "Next"}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.background} />
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  counter: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.body,
  },
  progressTrack: {
    height: 4,
    marginHorizontal: spacing.lg - 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  scroll: {
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.lg,
  },
  questionCard: {
    minHeight: 160,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  optionText: {
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: "700",
    color: colors.primary,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: spacing.lg - 4,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  backButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.background,
  },
});