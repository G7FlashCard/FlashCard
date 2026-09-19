import { useMemo, useState } from "react";
import {
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

import { colors, radius, spacing } from "../../screens/theme";

// ---------------------------------------------------------------------------
// This screen is a UI-only mock of the 4-step "Create Quiz" wizard. All state
// lives in local component state — nothing is persisted or wired to a real
// backend. Swap DECKS / CARDS_BY_DECK for real data when you have it.
// ---------------------------------------------------------------------------

type DeckOption = {
  id: string;
  title: string;
  cardCount: number;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  color: string;
};

const DECKS: DeckOption[] = [
  { id: "1", title: "Biology", cardCount: 24, icon: "leaf-outline", tint: "#E7FBEE", color: "#22C55E" },
  { id: "2", title: "Math Formulas", cardCount: 28, icon: "calculator-outline", tint: "#FDECEC", color: "#EF4444" },
  { id: "3", title: "English Vocabulary", cardCount: 50, icon: "book-outline", tint: "#EAF2FE", color: "#3B82F6" },
  { id: "4", title: "History", cardCount: 40, icon: "library-outline", tint: "#FDECEC", color: "#EF4444" },
  { id: "5", title: "Science", cardCount: 32, icon: "flask-outline", tint: "#EAF2FE", color: "#3B82F6" },
];

const CARDS_BY_DECK: Record<string, { id: string; front: string }[]> = {
  "1": [
    { id: "c1", front: "What is a cell?" },
    { id: "c2", front: "Parts of a cell" },
    { id: "c3", front: "Cell membrane function" },
    { id: "c4", front: "Definition of cytoplasm" },
    { id: "c5", front: "What is a nucleus?" },
    { id: "c6", front: "Types of cells" },
    { id: "c7", front: "Cell transport" },
    { id: "c8", front: "Mitochondria function" },
    { id: "c9", front: "What is DNA?" },
    { id: "c10", front: "Photosynthesis basics" },
  ],
};

const QUESTION_TYPES = [
  { key: "multiple_choice", label: "Multiple Choice" },
  { key: "true_false", label: "True or False" },
  { key: "short_answer", label: "Short Answer" },
] as const;

const QUESTION_COUNTS = [5, 10, 15, 20] as const;

const STEP_TITLES = ["Choose a deck", "Quiz Settings", "Select Questions", "Review & Create"];

export default function CreateQuizScreen() {
  // Arriving from a deck's "Quiz" button passes ?deckId=... — preselect that
  // deck and skip straight to the settings step.
  const params = useLocalSearchParams<{ deckId?: string }>();
  const preselectedDeckId = params.deckId && DECKS.some((d) => d.id === params.deckId) ? params.deckId : null;

  const [step, setStep] = useState(preselectedDeckId ? 1 : 0); // 0-3

  // Step 1 — deck
  const [deckQuery, setDeckQuery] = useState("");
  const [deckId, setDeckId] = useState<string | null>(preselectedDeckId);

  // Step 2 — settings
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [types, setTypes] = useState<Set<string>>(new Set(["multiple_choice"]));
  const [randomize, setRandomize] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);

  // Step 3 — questions
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  const deck = useMemo(() => DECKS.find((d) => d.id === deckId) ?? null, [deckId]);
  const cards = deckId ? CARDS_BY_DECK[deckId] ?? [] : [];
  const filteredDecks = useMemo(() => {
    const q = deckQuery.trim().toLowerCase();
    return q ? DECKS.filter((d) => d.title.toLowerCase().includes(q)) : DECKS;
  }, [deckQuery]);

  const toggleType = (key: string) =>
    setTypes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleCard = (id: string) =>
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedCardIds((prev) => (prev.size === cards.length ? new Set() : new Set(cards.map((c) => c.id))));

  const canGoNext =
    (step === 0 && deckId !== null) ||
    (step === 1 && title.trim().length > 0 && types.size > 0) ||
    (step === 2 && selectedCardIds.size > 0) ||
    step === 3;

  const goBack = () => (step === 0 ? router.back() : setStep((s) => s - 1));

  const goNext = () => {
    if (!canGoNext) return;
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      // "Create Quiz" — hand off to the quiz-taking mock.
      router.push({
        pathname: "/quiz/take" as any,
        params: { title: title || `${deck?.title ?? "Quiz"} Quiz`, total: String(Math.min(numQuestions, cards.length || numQuestions)) },
      });
    }
  };

  const typeLabel = QUESTION_TYPES.filter((t) => types.has(t.key))
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
          <View style={[styles.progressFill, { width: `${((step + 1) / 4) * 100}%` }]} />
        </View>
        <Text style={styles.stepCount}>{step + 1}/4</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
            <View style={styles.chipsRow}>
              {QUESTION_COUNTS.map((n) => {
                const selected = n === numQuestions;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setNumQuestions(n)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{n}</Text>
                  </Pressable>
                );
              })}
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

        {step === 2 && (
          <>
            <Text style={styles.title}>Select Questions</Text>
            <Text style={styles.subtitle}>Choose which cards to include in your quiz.</Text>

            <Pressable onPress={toggleSelectAll} style={styles.checkRow}>
              <Ionicons
                name={selectedCardIds.size === cards.length && cards.length > 0 ? "checkbox" : "square-outline"}
                size={22}
                color={selectedCardIds.size > 0 ? colors.primary : "#C7CBD9"}
              />
              <Text style={styles.checkLabel}>Select All</Text>
              <Text style={styles.selectCount}>
                {selectedCardIds.size}/{cards.length} selected
              </Text>
            </Pressable>

            {cards.map((card) => {
              const checked = selectedCardIds.has(card.id);
              return (
                <Pressable key={card.id} onPress={() => toggleCard(card.id)} style={styles.checkRow}>
                  <Ionicons
                    name={checked ? "checkbox" : "square-outline"}
                    size={22}
                    color={checked ? colors.primary : "#C7CBD9"}
                  />
                  <Text style={styles.checkLabel}>{card.front}</Text>
                </Pressable>
              );
            })}
          </>
        )}

        {step === 3 && deck && (
          <>
            <Text style={styles.title}>Review & Create</Text>
            <Text style={styles.subtitle}>Check your quiz settings.</Text>

            <View style={styles.summaryCard}>
              <View style={[styles.iconTile, { backgroundColor: deck.tint }]}>
                <Ionicons name={deck.icon} size={22} color={deck.color} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{title || `${deck.title} Quiz`}</Text>
                <Text style={styles.rowMeta}>
                  {Math.min(numQuestions, selectedCardIds.size)} Questions · {typeLabel || "No type selected"}
                </Text>
              </View>
            </View>

            <SummaryRow label="Deck" value={deck.title} />
            <SummaryRow label="Questions" value={String(Math.min(numQuestions, selectedCardIds.size))} />
            <SummaryRow label="Type" value={typeLabel || "—"} />
            <SummaryRow label="Randomize" value={randomize ? "Yes" : "No"} />
            <SummaryRow label="Show Answers" value={showAnswers ? "Yes" : "No"} />
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
          <Text style={styles.nextButtonText}>{step === 3 ? "Create Quiz" : "Next"}</Text>
          {step < 3 && <Ionicons name="arrow-forward" size={16} color={colors.background} />}
        </Pressable>
      </View>
    </SafeAreaView>
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
  chipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    width: 56,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.primary,
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
  selectCount: {
    fontSize: 12,
    color: colors.body,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.body,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
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