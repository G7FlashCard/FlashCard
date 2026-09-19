import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import {
  ActivityIndicator,
  Alert,
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

import { addCards, CardInput } from "./cardStore";
import { useDeck } from "./deckStore";
import { colors, radius, spacing } from "./theme";

type Props = {
  deckId: string;
};

type Stage = "pick" | "parsing" | "review" | "success";

type PickedFile = {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
};

type DraftCard = CardInput & { id: string };

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

function fileKind(mimeType: string, name: string): { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; tint: string } {
  const n = name.toLowerCase();
  if (mimeType.includes("pdf") || n.endsWith(".pdf")) {
    return { label: "PDF", icon: "document-text-outline", color: "#E5484D", tint: "#FDE7E7" };
  }
  if (mimeType.includes("presentation") || n.endsWith(".ppt") || n.endsWith(".pptx")) {
    return { label: "PowerPoint", icon: "easel-outline", color: "#D97706", tint: "#FEF3C7" };
  }
  return { label: "Word", icon: "document-outline", color: "#2563EB", tint: "#DBEAFE" };
}

function formatBytes(bytes: number): string {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// STUB: replace with a real call to your backend/parsing service.
//
// Extracting text from PDF/DOCX/PPTX reliably isn't something that can be
// done purely on-device in React Native. The usual approach is to upload
// `file.uri` to a server endpoint that extracts the text and returns
// front/back card pairs (optionally using an LLM to structure them), then
// resolve that here instead of the sample cards below.
// ---------------------------------------------------------------------------
async function extractCardsFromFile(file: PickedFile): Promise<CardInput[]> {
  await new Promise((resolve) => setTimeout(resolve, 1400)); // simulate network/parsing time

  return [
    { front: `Sample question 1 from "${file.name}"`, back: "Replace with the real extracted answer once parsing is wired up." },
    { front: `Sample question 2 from "${file.name}"`, back: "Replace with the real extracted answer once parsing is wired up." },
    { front: `Sample question 3 from "${file.name}"`, back: "Replace with the real extracted answer once parsing is wired up." },
  ];
}

export default function ImportFromFileScreen({ deckId }: Props) {
  const deck = useDeck(deckId);

  const [stage, setStage] = useState<Stage>("pick");
  const [file, setFile] = useState<PickedFile | null>(null);
  const [drafts, setDrafts] = useState<DraftCard[]>([]);
  const [addedCount, setAddedCount] = useState(0);

  const handleBackPress = () => {
    if (stage === "review") {
      setStage("pick");
      setFile(null);
    } else {
      router.back();
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name ?? "Untitled file",
        size: asset.size ?? 0,
        mimeType: asset.mimeType ?? "",
      });
    } catch {
      Alert.alert("Couldn't open file picker", "Please try again.");
    }
  };

  const startImport = async () => {
    if (!file) return;
    setStage("parsing");
    try {
      const extracted = await extractCardsFromFile(file);
      if (extracted.length === 0) {
        Alert.alert("No cards found", "We couldn't find any question/answer pairs in that file.");
        setStage("pick");
        return;
      }
      setDrafts(
        extracted.map((c, i) => ({ ...c, id: `draft-${i}-${Math.random().toString(36).slice(2, 7)}` }))
      );
      setStage("review");
    } catch {
      Alert.alert("Import failed", "Something went wrong while reading that file.");
      setStage("pick");
    }
  };

  const updateDraft = (id: string, field: "front" | "back", value: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const confirmImport = () => {
    const valid = drafts.filter((d) => d.front.trim() && d.back.trim());
    if (valid.length === 0) {
      Alert.alert("Nothing to add", "Every card needs both a front and a back.");
      return;
    }
    addCards(
      deckId,
      valid.map(({ front, back }) => ({ front: front.trim(), back: back.trim() }))
    );
    setAddedCount(valid.length);
    setStage("success");
  };

  // ----- Success -------------------------------------------------------

  if (stage === "success") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>
            {addedCount} {addedCount === 1 ? "Card" : "Cards"} Added!
          </Text>
          <Text style={styles.successBody}>
            Imported into {deck?.title ?? "your deck"} from {file?.name}.
          </Text>
        </View>

        <View style={styles.successActions}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedFade]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ----- Parsing ---------------------------------------------------------

  if (stage === "parsing") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.parsingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.parsingTitle}>Reading your file...</Text>
          <Text style={styles.parsingBody}>{file?.name}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----- Review ------------------------------------------------------------

  if (stage === "review") {
    return (
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
          <Text style={styles.headerTitle}>Review Cards</Text>
          <View style={styles.headerButton} />
        </View>

        <Text style={styles.reviewSubtitle}>
          {drafts.length} {drafts.length === 1 ? "card" : "cards"} found — edit or remove any before adding.
        </Text>

        <ScrollView contentContainerStyle={styles.reviewList} showsVerticalScrollIndicator={false}>
          {drafts.map((draft, index) => (
            <View key={draft.id} style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <Text style={styles.draftIndex}>Card {index + 1}</Text>
                <Pressable
                  onPress={() => removeDraft(draft.id)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove card ${index + 1}`}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.body} />
                </Pressable>
              </View>

              <Text style={styles.draftLabel}>Front</Text>
              <TextInput
                style={styles.draftInput}
                value={draft.front}
                onChangeText={(v) => updateDraft(draft.id, "front", v)}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.draftLabel}>Back</Text>
              <TextInput
                style={styles.draftInput}
                value={draft.back}
                onChangeText={(v) => updateDraft(draft.id, "back", v)}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}

          {drafts.length === 0 && (
            <View style={styles.emptyDrafts}>
              <Text style={styles.emptyDraftsText}>No cards left to add.</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={confirmImport}
            disabled={drafts.length === 0}
            style={({ pressed }) => [
              styles.primaryButton,
              (drafts.length === 0 || pressed) && styles.disabledOrPressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              Add {drafts.length} {drafts.length === 1 ? "Card" : "Cards"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ----- Pick (default) ----------------------------------------------------

  const kind = file ? fileKind(file.mimeType, file.name) : null;

  return (
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
        <View style={styles.headerButton} />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Import from File</Text>
        <Text style={styles.subtitle}>Upload a PDF, Word, or PowerPoint file and we'll turn it into cards.</Text>
      </View>

      {!file ? (
        <Pressable
          onPress={pickFile}
          style={({ pressed }) => [styles.dropzone, pressed && styles.pressedFade]}
          accessibilityRole="button"
        >
          <View style={styles.dropzoneIcon}>
            <Ionicons name="cloud-upload-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.dropzoneTitle}>Choose a file</Text>
          <Text style={styles.dropzoneBody}>PDF, DOC, DOCX, PPT, or PPTX</Text>

          <View style={styles.formatRow}>
            <FormatBadge label="PDF" />
            <FormatBadge label="Word" />
            <FormatBadge label="PowerPoint" />
          </View>
        </Pressable>
      ) : (
        <View style={styles.fileCard}>
          <View style={[styles.fileIconTile, { backgroundColor: kind!.tint }]}>
            <Ionicons name={kind!.icon} size={24} color={kind!.color} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={styles.fileMeta}>
              {kind!.label}
              {file.size ? ` • ${formatBytes(file.size)}` : ""}
            </Text>
          </View>
          <Pressable onPress={() => setFile(null)} hitSlop={10} accessibilityLabel="Remove file">
            <Ionicons name="close-circle" size={22} color="#9CA3AF" />
          </Pressable>
        </View>
      )}

      <View style={styles.footer}>
        {file ? (
          <View style={styles.footerRow}>
            <Pressable
              onPress={pickFile}
              style={({ pressed }) => [styles.secondaryButton, styles.footerHalf, pressed && styles.pressedFade]}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Choose Different</Text>
            </Pressable>
            <Pressable
              onPress={startImport}
              style={({ pressed }) => [styles.primaryButton, styles.footerHalf, pressed && styles.pressedFade]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Import Cards</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function FormatBadge({ label }: { label: string }) {
  return (
    <View style={styles.formatBadge}>
      <Text style={styles.formatBadgeText}>{label}</Text>
    </View>
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
  titleBlock: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    marginTop: 6,
  },

  // Dropzone
  dropzone: {
    marginHorizontal: spacing.lg - 4,
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
  },
  dropzoneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryTint,
    marginBottom: spacing.md,
  },
  dropzoneTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  dropzoneBody: {
    fontSize: 13,
    color: colors.body,
    marginTop: 4,
  },
  formatRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.md,
  },
  formatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formatBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.body,
  },

  // Selected file card
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: spacing.lg - 4,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  fileIconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  fileMeta: {
    fontSize: 12,
    color: colors.body,
    marginTop: 2,
  },

  // Parsing
  parsingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: 6,
  },
  parsingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.md,
  },
  parsingBody: {
    fontSize: 13,
    color: colors.body,
  },

  // Review
  reviewSubtitle: {
    fontSize: 13,
    color: colors.body,
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.sm,
  },
  reviewList: {
    padding: spacing.lg - 4,
    paddingTop: 0,
    gap: 12,
    paddingBottom: spacing.xl,
  },
  draftCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 12,
  },
  draftHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  draftIndex: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.body,
  },
  draftLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.body,
    marginTop: 8,
    marginBottom: 4,
  },
  draftInput: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    padding: 10,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  emptyDrafts: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyDraftsText: {
    fontSize: 14,
    color: colors.body,
  },

  // Footer
  footer: {
    padding: spacing.lg - 4,
    paddingTop: spacing.sm,
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

  // Success (shared look with AddCardManualScreen)
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
  },
});