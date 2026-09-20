import { useMemo, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../../screens/theme";
import { createBlankQuestion, isAnswerCorrect } from "../../screens/quizTypes";
import type { QuizQuestion } from "../../screens/quizTypes";
import { getActiveQuiz } from "../../screens/quizSession";

// ---------------------------------------------------------------------------
// Quiz taking. Uses the quiz built in the Create Quiz wizard (see
// quizSession.ts). If this screen is opened directly, it falls back to the
// sample questions below.
//
// Answers are stored as strings per question index:
//   multiple choice -> option index, true/false -> "true" | "false",
//   short answer    -> the typed text
// ---------------------------------------------------------------------------

const LETTERS = ["A", "B", "C", "D"];

function sampleQuestion(prompt: string, options: string[], correctIndex: number): QuizQuestion {
  return { ...createBlankQuestion("multiple_choice"), prompt, options, correctIndex };
}

const FALLBACK_QUESTIONS: QuizQuestion[] = [
  sampleQuestion("What is a cell?", ["The basic unit of life", "A type of tissue", "A group of organs", "A chemical compound"], 0),
  sampleQuestion("What is the powerhouse of the cell?", ["Nucleus", "Mitochondria", "Ribosome", "Cytoplasm"], 1),
  sampleQuestion("Which structure controls what enters and exits the cell?", ["Cell wall", "Golgi apparatus", "Cell membrane", "Vacuole"], 2),
  sampleQuestion("What molecule carries genetic information?", ["RNA", "ATP", "Protein", "DNA"], 3),
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizTakingScreen() {
  const params = useLocalSearchParams<{ title?: string; total?: string }>();

  const questions = useMemo<QuizQuestion[]>(() => {
    const active = getActiveQuiz();
    if (active && active.questions.length > 0) {
      return active.randomize ? shuffle(active.questions) : active.questions;
    }
    const total = Number(params.total) || FALLBACK_QUESTIONS.length;
    return Array.from({ length: total }, (_, i) => FALLBACK_QUESTIONS[i % FALLBACK_QUESTIONS.length]);
  }, [params.total]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = questions[index];
  const answer = answers[index];
  const answered = answer !== undefined && answer.trim().length > 0;
  const isLast = index === questions.length - 1;

  const setAnswer = (value: string) => setAnswers((prev) => ({ ...prev, [index]: value }));

  const leave = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  const goPrevious = () => {
    if (index === 0) leave();
    else setIndex((i) => i - 1);
  };

  const goNext = () => {
    if (!answered) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    const score = questions.reduce((acc, q, i) => acc + (isAnswerCorrect(q, answers[i]) ? 1 : 0), 0);
    router.replace({
      pathname: "/quiz/result" as any,
      params: { score: String(score), total: String(questions.length) },
    });
  };

  const renderChoice = (value: string, label: string) => {
    const selected = answer === value;
    return (
      <Pressable
        key={value}
        onPress={() => setAnswer(value)}
        style={[styles.optionRow, selected && styles.optionRowSelected]}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        <Ionicons
          name={selected ? "radio-button-on" : "radio-button-off"}
          size={22}
          color={selected ? colors.primary : "#C7CBD9"}
        />
        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <Pressable onPress={leave} hitSlop={10} accessibilityLabel="Close quiz">
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.counter}>
            {index + 1}/{questions.length}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{question.prompt}</Text>
          </View>

          {question.type === "multiple_choice" &&
            question.options.map((option, i) =>
              renderChoice(String(i), `${LETTERS[i]}. ${option}`)
            )}

          {question.type === "true_false" && (
            <>
              {renderChoice("true", "True")}
              {renderChoice("false", "False")}
            </>
          )}

          {question.type === "short_answer" && (
            <TextInput
              style={styles.answerInput}
              placeholder="Type your answer"
              placeholderTextColor="#9CA3AF"
              value={answer ?? ""}
              onChangeText={setAnswer}
              autoCorrect={false}
              returnKeyType="done"
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={goPrevious} style={[styles.footerButton, styles.backButton]}>
            <Ionicons name="arrow-back" size={16} color={colors.ink} />
            <Text style={styles.backButtonText}>Previous</Text>
          </Pressable>
          <Pressable
            onPress={goNext}
            disabled={!answered}
            style={[styles.footerButton, styles.nextButton, !answered && styles.nextButtonDisabled]}
          >
            <Text style={styles.nextButtonText}>{isLast ? "Finish" : "Next"}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.background} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  answerInput: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
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