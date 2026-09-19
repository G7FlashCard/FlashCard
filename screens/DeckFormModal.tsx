import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import type { DeckInput } from "./deckStore";
import { colors, radius, spacing } from "./theme";

const TITLE_MAX = 40;
const SUBJECT_MAX = 30;
const DESCRIPTION_MAX = 120;

const EMPTY: DeckInput = { title: "", description: "", subject: "", isPrivate: false };

type Props = {
  visible: boolean;
  mode: "create" | "edit";
  /** Values to start from when the sheet opens (edit mode). */
  initial?: DeckInput;
  onClose: () => void;
  onSave: (input: DeckInput) => void;
};

export function DeckFormModal({ visible, mode, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // Load the starting values each time the sheet opens (not while typing).
  useEffect(() => {
    if (visible) {
      const start = initial ?? EMPTY;
      setTitle(start.title);
      setDescription(start.description);
      setSubject(start.subject);
      setIsPrivate(start.isPrivate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const canSave = title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      isPrivate,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.sheet} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={colors.ink} />
          </Pressable>
          <Text style={styles.sheetTitle}>{mode === "edit" ? "Edit Deck" : "New Deck"}</Text>
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
          >
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>Save</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.fieldLabel, styles.firstLabel]}>Deck Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Biology"
              placeholderTextColor="#9CA3AF"
              maxLength={TITLE_MAX}
              returnKeyType="next"
              autoFocus={mode === "create"}
            />

            <Text style={styles.fieldLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Overview of basic biology concepts."
              placeholderTextColor="#9CA3AF"
              maxLength={DESCRIPTION_MAX}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Subject (Optional)</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Science"
              placeholderTextColor="#9CA3AF"
              maxLength={SUBJECT_MAX}
              returnKeyType="done"
            />

            <View style={styles.privateRow}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.ink} />
              <Text style={styles.privateLabel}>Set as Private</Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg - 4,
    paddingVertical: spacing.md,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  saveTextDisabled: {
    color: "#9CA3AF",
  },
  form: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: 8,
  },
  firstLabel: {
    marginTop: 0,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
    fontSize: 15,
    color: colors.ink,
  },
  textArea: {
    minHeight: 96,
  },
  privateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: spacing.lg,
  },
  privateLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
  },
});