import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { colors, radius, spacing } from "../../screens/theme";
import { QUESTION_TYPES, createBlankQuestion, isQuestionComplete } from "../../screens/quizTypes";
import type { QuestionType, QuizQuestion } from "../../screens/quizTypes";
import { generateQuestionsFromFile } from "../../screens/quizGenerator";
import type { FileKind, PickedFile } from "../../screens/quizGenerator";
import { setActiveQuiz } from "../../screens/quizSession";
import { useDecks } from "../../screens/deckRepo";

// ---------------------------------------------------------------------------
// Create Quiz wizard (UI only, nothing is saved to a backend yet).
//   1. Choose a deck   2. Quiz Settings   3. Add Questions   4. Review & Create
//
// Step 3: questions are typed by hand, and/or generated from a PDF, Word
// document or PowerPoint file. Generated questions land in the same list so
// they can be edited. Generation is a placeholder (see quizGenerator.ts).
// ---------------------------------------------------------------------------

type IconName = keyof typeof Ionicons.glyphMap;

const FILE_KINDS: { kind: FileKind; label: string; hint: string; icon: IconName; mime: string[] }[] = [
  {
    kind: "document",
    label: "Document",
    hint: ".doc, .docx",
    icon: "document-text-outline",
    mime: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  { kind: "pdf", label: "PDF", hint: ".pdf", icon: "document-outline", mime: ["application/pdf"] },
  {
    kind: "presentation",
    label: "PowerPoint",
    hint: ".ppt, .pptx",
    icon: "easel-outline",
    mime: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
];

const DEFAULT_QUESTION_COUNT = 10;
const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 100;

const TOTAL_STEPS = 4;
const LETTERS = ["A", "B", "C", "D"];

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CreateQuizScreen() {
  // Arriving from a deck's "Quiz" button passes ?deckId=... — preselect that
  // deck and skip straight to the settings step.
  const decks = useDecks();
  const params = useLocalSearchParams<{ deckId?: string }>();
  const preselectedDeckId =
    params.deckId && decks.some((d) => d.id === params.deckId) ? params.deckId : null;

  const [step, setStep] = useState(preselectedDeckId ? 1 : 0); // 0-3

  // Step 1 — deck
  const [deckQuery, setDeckQuery] = useState("");
  const [deckId, setDeckId] = useState<string | null>(preselectedDeckId);

  // Step 2 — settings
  const [title, setTitle] = useState("");
  const [numQuestionsInput, setNumQuestionsInput] = useState<string>(String(DEFAULT_QUESTION_COUNT));
  const [types, setTypes] = useState<Set<QuestionType>>(new Set<QuestionType>(["multiple_choice"]));
  const [randomize, setRandomize] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);

  // Step 3 — questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [generating, setGenerating] = useState(false);

  const deck = useMemo(() => decks.find((d) => d.id === deckId) ?? null, [decks, deckId]);
  const filteredDecks = useMemo(() => {
    const q = deckQuery.trim().toLowerCase();
    return q ? decks.filter((d) => d.title.toLowerCase().includes(q)) : decks;
  }, [decks, deckQuery]);

  const enabledTypes = useMemo(
    () => QUESTION_TYPES.filter((t) => types.has(t.key)).map((t) => t.key),
    [types]
  );

  // Parsed, clamped number from the raw text field (falls back to the default
  // while the field is empty or mid-edit). Used when generating from a file.
  const numQuestions = useMemo(() => {
    const parsed = parseInt(numQuestionsInput, 10);
    if (Number.isNaN(parsed)) return DEFAULT_QUESTION_COUNT;
    return Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, parsed));
  }, [numQuestionsInput]);

  const isNumQuestionsValid =
    numQuestionsInput.trim().length > 0 && !Number.isNaN(parseInt(numQuestionsInput, 10));

  const handleNumQuestionsChange = (text: string) => setNumQuestionsInput(text.replace(/[^0-9]/g, ""));
  const handleNumQuestionsBlur = () => setNumQuestionsInput(String(numQuestions));

  const toggleType = (key: QuestionType) =>
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // --- Step 3 actions -------------------------------------------------------

  const addQuestion = () =>
    setQuestions((prev) => [...prev, createBlankQuestion(enabledTypes[0] ?? "multiple_choice")]);

  const updateQuestion = (updated: QuizQuestion) =>
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));

  const removeQuestion = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const pickFile = async (kind: FileKind) => {
    const config = FILE_KINDS.find((k) => k.kind === kind);
    if (!config) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: config.mime,
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      setPickedFile({
        kind,
        name: asset.name,
        uri: asset.uri,
        size: asset.size,
        mimeType: asset.mimeType,
      });
    } catch {
      Alert.alert("Couldn't open the file", "Please try a different file.");
    }
  };

  const handleGenerate = async () => {
    if (!pickedFile || generating) return;
    setGenerating(true);
    try {
      const generated = await generateQuestionsFromFile(pickedFile, {
        count: numQuestions,
        types: enabledTypes,
      });
      setQuestions((prev) => [...prev, ...generated]);
      setPickedFile(null);
    } catch {
      Alert.alert("Couldn't generate questions", "Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // --- Navigation -----------------------------------------------------------

  const allComplete = questions.length > 0 && questions.every(isQuestionComplete);

  const canGoNext =
    (step === 0 && deckId !== null) ||
    (step === 1 && title.trim().length > 0 && types.size > 0 && isNumQuestionsValid) ||
    (step === 2 && allComplete && !generating) ||
    step === 3;

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const goNext = () => {
    if (!canGoNext) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }

    // "Create Quiz" — hand the questions to the quiz-taking screen.
    const quizTitle = title.trim() || `${deck?.title ?? "Quiz"} Quiz`;
    setActiveQuiz({
      title: quizTitle,
      deckTitle: deck?.title ?? "",
      questions,
      randomize,
      showAnswers,
    });
    router.push({
      pathname: "/quiz/take" as any,
      params: { title: quizTitle, total: String(questions.length) },
    });
  };

  const usedTypeLabel = QUESTION_TYPES.filter((t) => questions.some((q) => q.type === t.key))
    .map((t) => t.label)
    .join(", ");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top bar: back + progress + step count */}
      <View style={styles.topBar}>
        <Pressable onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
        </View>
        <Text style={styles.stepCount}>
          {step + 1}/{TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------- Step 1: choose a deck ---------------- */}
        {step === 0 && (
          <>
            <Text style={styles.title}>Create a Quiz</Text>
            <Text style={styles.subtitle}>Choose a deck for your quiz.</Text>

            <View style={styles.search}>
              <Ionicons name="search-outline" size={18} color={colors.body} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search your decks..."
                placeholderTextColor="#9CA3AF"
                value={deckQuery}
                onChangeText={setDeckQuery}
              />
            </View>

            {filteredDecks.length === 0 && (
              <Text style={styles.emptyHint}>
                {deckQuery.trim()
                  ? "No decks match your search."
                  : "You don't have any decks yet. Create one in the Decks tab first."}
              </Text>
            )}

            {filteredDecks.map((d) => {
              const selected = d.id === deckId;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => setDeckId(d.id)}
                  style={({ pressed }) => [
                    styles.row,
                    selected && styles.rowSelected,
                    pressed && styles.rowPressed,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <View style={[styles.iconTile, { backgroundColor: d.tint }]}>
                    <Ionicons name={d.icon} size={22} color={d.color} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{d.title}</Text>
                    <Text style={styles.rowMeta}>{d.cardCount} cards</Text>
                  </View>
                  <Ionicons
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={selected ? colors.primary : "#C7CBD9"}
                  />
                </Pressable>
              );
            })}
          </>
        )}

        {/* ---------------- Step 2: settings ---------------- */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Quiz Settings</Text>

            <Text style={styles.label}>Quiz Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Biology Quiz 1"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Number of Questions</Text>
            <View style={styles.numberInputRow}>
              <TextInput
                style={[styles.input, styles.numberInput, !isNumQuestionsValid && styles.inputError]}
                placeholder={String(DEFAULT_QUESTION_COUNT)}
                placeholderTextColor="#9CA3AF"
                value={numQuestionsInput}
                onChangeText={handleNumQuestionsChange}
                onBlur={handleNumQuestionsBlur}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <Text style={styles.label}>Question Type</Text>
            {QUESTION_TYPES.map((t) => {
              const checked = types.has(t.key);
              return (
                <Pressable key={t.key} onPress={() => toggleType(t.key)} style={styles.checkRow}>
                  <Ionicons
                    name={checked ? "checkbox" : "square-outline"}
                    size={22}
                    color={checked ? colors.primary : "#C7CBD9"}
                  />
                  <Text style={styles.checkLabel}>{t.label}</Text>
                </Pressable>
              );
            })}

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Randomize Questions</Text>
              <Switch
                value={randomize}
                onValueChange={setRandomize}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show Answers After Quiz</Text>
              <Switch
                value={showAnswers}
                onValueChange={setShowAnswers}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
          </>
        )}

        {/* ---------------- Step 3: add questions ---------------- */}
        {step === 2 && (
          <>
            <Text style={styles.title}>Add Questions</Text>
            <Text style={styles.subtitle}>Generate questions from a file, or write your own.</Text>

            <Text style={styles.sectionLabel}>Generate from a file</Text>
            <View style={styles.kindRow}>
              {FILE_KINDS.map((k) => {
                const active = pickedFile?.kind === k.kind;
                return (
                  <Pressable
                    key={k.kind}
                    onPress={() => pickFile(k.kind)}
                    disabled={generating}
                    style={({ pressed }) => [
                      styles.kindTile,
                      active && styles.kindTileActive,
                      pressed && styles.rowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose a ${k.label} file`}
                  >
                    <Ionicons name={k.icon} size={26} color={colors.primary} />
                    <Text style={styles.kindLabel}>{k.label}</Text>
                    <Text style={styles.kindHint}>{k.hint}</Text>
                  </Pressable>
                );
              })}
            </View>

            {pickedFile && (
              <View style={styles.fileCard}>
                <View style={styles.fileInfo}>
                  <Ionicons name="attach-outline" size={20} color={colors.primary} />
                  <View style={styles.rowText}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {pickedFile.name}
                    </Text>
                    {pickedFile.size ? <Text style={styles.rowMeta}>{formatSize(pickedFile.size)}</Text> : null}
                  </View>
                  {!generating && (
                    <Pressable
                      onPress={() => setPickedFile(null)}
                      hitSlop={10}
                      accessibilityLabel="Remove file"
                    >
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </Pressable>
                  )}
                </View>
                <Pressable
                  onPress={handleGenerate}
                  disabled={generating}
                  style={({ pressed }) => [
                    styles.generateButton,
                    (pressed || generating) && styles.generateButtonBusy,
                  ]}
                  accessibilityRole="button"
                >
                  {generating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
                  )}
                  <Text style={styles.generateText}>
                    {generating ? "Generating..." : `Generate ${numQuestions} questions`}
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or write your own</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.sectionLabel}>Your questions</Text>
              <Text style={styles.selectCount}>{questions.length} added</Text>
            </View>

            {questions.length === 0 && (
              <Text style={styles.emptyHint}>
                No questions yet. Generate some from a file or add one below.
              </Text>
            )}

            {questions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                index={i}
                question={q}
                allowedTypes={enabledTypes}
                onChange={updateQuestion}
                onRemove={() => removeQuestion(q.id)}
              />
            ))}

            <Pressable
              onPress={addQuestion}
              style={({ pressed }) => [styles.addQuestion, pressed && styles.rowPressed]}
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              <Text style={styles.addQuestionText}>Add question</Text>
            </Pressable>

            {questions.length > 0 && !allComplete && (
              <Text style={styles.incompleteHint}>Fill in every question to continue.</Text>
            )}
          </>
        )}

        {/* ---------------- Step 4: review ---------------- */}
        {step === 3 && deck && (
          <>
            <Text style={styles.title}>Review & Create</Text>
            <Text style={styles.subtitle}>Check your quiz settings.</Text>

            <View style={styles.summaryCard}>
              <View style={[styles.iconTile, { backgroundColor: deck.tint }]}>
                <Ionicons name={deck.icon} size={22} color={deck.color} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{title.trim() || `${deck.title} Quiz`}</Text>
                <Text style={styles.rowMeta}>
                  {questions.length} Questions · {usedTypeLabel || "No type selected"}
                </Text>
              </View>
            </View>

            <SummaryRow label="Deck" value={deck.title} />
            <SummaryRow label="Questions" value={String(questions.length)} />
            <SummaryRow label="Type" value={usedTypeLabel || "—"} />
            <SummaryRow label="Randomize" value={randomize ? "Yes" : "No"} />
            <SummaryRow label="Show Answers" value={showAnswers ? "Yes" : "No"} />

            <Text style={[styles.sectionLabel, styles.previewLabel]}>Questions</Text>
            {questions.slice(0, 5).map((q, i) => (
              <Text key={q.id} style={styles.previewItem} numberOfLines={1}>
                {i + 1}. {q.prompt}
              </Text>
            ))}
            {questions.length > 5 && (
              <Text style={styles.previewMore}>+ {questions.length - 5} more</Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.footer}>
        <Pressable onPress={goBack} style={[styles.footerButton, styles.backButton]}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Pressable
          onPress={goNext}
          disabled={!canGoNext}
          style={[styles.footerButton, styles.nextButton, !canGoNext && styles.nextButtonDisabled]}
        >
          <Text style={styles.nextButtonText}>{step === TOTAL_STEPS - 1 ? "Create Quiz" : "Next"}</Text>
          {step < TOTAL_STEPS - 1 && <Ionicons name="arrow-forward" size={16} color={colors.background} />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function QuestionEditor({
  index,
  question,
  allowedTypes,
  onChange,
  onRemove,
}: {
  index: number;
  question: QuizQuestion;
  allowedTypes: QuestionType[];
  onChange: (q: QuizQuestion) => void;
  onRemove: () => void;
}) {
  const change = (patch: Partial<QuizQuestion>) => onChange({ ...question, ...patch });

  // Offer the enabled types, plus this question's own type if it was disabled later.
  const chipTypes = QUESTION_TYPES.filter((t) => allowedTypes.includes(t.key) || t.key === question.type);

  return (
    <View style={styles.qCard}>
      <View style={styles.qHeader}>
        <Text style={styles.qNumber}>Question {index + 1}</Text>
        <Pressable onPress={onRemove} hitSlop={10} accessibilityLabel={`Delete question ${index + 1}`}>
          <Ionicons name="trash-outline" size={20} color="#E5484D" />
        </Pressable>
      </View>

      {chipTypes.length > 1 && (
        <View style={styles.chipRow}>
          {chipTypes.map((t) => {
            const active = t.key === question.type;
            return (
              <Pressable
                key={t.key}
                onPress={() => change({ type: t.key })}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <TextInput
        style={[styles.input, styles.promptInput]}
        placeholder="Type your question"
        placeholderTextColor="#9CA3AF"
        multiline
        value={question.prompt}
        onChangeText={(text) => change({ prompt: text })}
      />

      {question.type === "multiple_choice" && (
        <>
          {question.options.map((option, i) => {
            const correct = question.correctIndex === i;
            return (
              <View key={i} style={styles.optionEditRow}>
                <Pressable
                  onPress={() => change({ correctIndex: i })}
                  hitSlop={8}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: correct }}
                  accessibilityLabel={`Mark option ${LETTERS[i]} as the correct answer`}
                >
                  <Ionicons
                    name={correct ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={correct ? colors.primary : "#C7CBD9"}
                  />
                </Pressable>
                <TextInput
                  style={[styles.input, styles.optionInput]}
                  placeholder={`Option ${LETTERS[i]}`}
                  placeholderTextColor="#9CA3AF"
                  value={option}
                  onChangeText={(text) =>
                    change({ options: question.options.map((o, j) => (j === i ? text : o)) })
                  }
                />
              </View>
            );
          })}
          <Text style={styles.qHint}>Tap the circle to mark the correct answer.</Text>
        </>
      )}

      {question.type === "true_false" && (
        <View style={styles.chipRow}>
          {[true, false].map((value) => {
            const active = question.trueFalseAnswer === value;
            return (
              <Pressable
                key={String(value)}
                onPress={() => change({ trueFalseAnswer: value })}
                style={[styles.chip, styles.chipWide, active && styles.chipActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {value ? "True" : "False"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {question.type === "short_answer" && (
        <TextInput
          style={styles.input}
          placeholder="Correct answer"
          placeholderTextColor="#9CA3AF"
          value={question.shortAnswer}
          onChangeText={(text) => change({ shortAnswer: text })}
        />
      )}
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
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
    gap: 10,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  stepCount: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.body,
  },
  scroll: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.body,
    marginBottom: spacing.md,
  },

  // Search (step 1)
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 0,
  },

  // Rows (deck list)
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginBottom: 10,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  rowPressed: {
    opacity: 0.9,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  rowMeta: {
    fontSize: 12,
    color: colors.body,
    marginTop: 2,
  },

  // Settings (step 2)
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 8,
    marginTop: spacing.md,
  },
  input: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.ink,
  },
  inputError: {
    borderColor: "#E5484D",
  },
  numberInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  numberInput: {
    width: 90,
    textAlign: "center",
    fontWeight: "700",
  },
  numberInputHint: {
    fontSize: 12,
    color: colors.body,
    flexShrink: 1,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },

  // Add questions (step 3)
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 10,
  },
  kindRow: {
    flexDirection: "row",
    gap: 10,
  },
  kindTile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  kindTileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  kindLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 2,
  },
  kindHint: {
    fontSize: 11,
    color: colors.body,
  },
  fileCard: {
    marginTop: 12,
    padding: 12,
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  generateButton: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  generateButtonBusy: {
    opacity: 0.75,
  },
  generateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: spacing.lg - 4,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    fontSize: 12,
    color: colors.body,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectCount: {
    fontSize: 12,
    color: colors.body,
    marginBottom: 10,
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.body,
    marginBottom: 12,
  },
  qCard: {
    padding: 14,
    marginBottom: 12,
    gap: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  qHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipWide: {
    flex: 1,
    alignItems: "center",
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.body,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  promptInput: {
    height: undefined,
    minHeight: 72,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
  optionEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionInput: {
    flex: 1,
  },
  qHint: {
    fontSize: 12,
    color: colors.body,
  },
  addQuestion: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  addQuestionText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  incompleteHint: {
    fontSize: 12,
    color: "#E5484D",
    marginTop: 10,
    textAlign: "center",
  },

  // Review (step 4)
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.body,
  },
  summaryValue: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "right",
  },
  previewLabel: {
    marginTop: spacing.lg - 4,
  },
  previewItem: {
    fontSize: 13,
    color: colors.ink,
    paddingVertical: 4,
  },
  previewMore: {
    fontSize: 12,
    color: colors.body,
    paddingVertical: 4,
  },

  // Footer
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