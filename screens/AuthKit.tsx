import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "./theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Page wrapper: safe area, keyboard avoiding, scrollable so long forms fit. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {/* The ScrollView adjusts for the keyboard natively (smooth on iOS, and
          Android resizes the window by default), so no KeyboardAvoidingView. */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

type AuthInputProps = TextInputProps & {
  icon: IconName;
  /** Adds the show/hide eye button and hides the text by default. */
  isPassword?: boolean;
  /** Small helper text shown under the field. */
  hint?: string;
};

export function AuthInput({ icon, isPassword, hint, ...inputProps }: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <Ionicons name={icon} size={20} color={focused ? colors.primary : colors.body} />
        <TextInput
          placeholderTextColor="#9CA3AF"
          {...inputProps}
          style={styles.input}
          secureTextEntry={isPassword ? hidden : inputProps.secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.body}
            />
          </Pressable>
        )}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function OrDivider({ label = "or continue with" }: { label?: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

type Provider = "google" | "apple";

const PROVIDERS: Record<Provider, { label: string; icon: IconName; color: string }> = {
  google: { label: "Continue with Google", icon: "logo-google", color: "#EA4335" },
  apple: { label: "Continue with Apple", icon: "logo-apple", color: "#000000" },
};

/**
 * Google and Apple buttons. Sign-in isn't wired up yet, so by default they
 * show a "coming soon" alert. Pass onPress to handle real sign-in later.
 */
export function SocialButtons({ onPress }: { onPress?: (provider: Provider) => void }) {
  const handle = (provider: Provider) => {
    if (onPress) {
      onPress(provider);
    } else {
      Alert.alert("Coming soon", `${PROVIDERS[provider].label} isn't set up yet.`);
    }
  };

  return (
    <View style={styles.socialGroup}>
      {(Object.keys(PROVIDERS) as Provider[]).map((provider) => {
        const { label, icon, color } = PROVIDERS[provider];
        return (
          <Pressable
            key={provider}
            onPress={() => handle(provider)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
          >
            <Ionicons name={icon} size={20} color={color} />
            <Text style={styles.socialText}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** "Already have an account? Login" style footer link. */
export function AuthSwitch({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchPrompt}>{prompt}</Text>
      <Pressable onPress={onPress} hitSlop={8} accessibilityRole="link">
        <Text style={styles.switchAction}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.body,
    marginTop: spacing.sm,
  },
  field: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8F9FC",
  },
  inputRowFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 0,
  },
  hint: {
    fontSize: 12,
    color: colors.body,
    marginTop: 6,
    marginLeft: 4,
  },
  primaryButton: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: colors.body,
  },
  socialGroup: {
    gap: 12,
  },
  socialButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  socialButtonPressed: {
    backgroundColor: "#F3F4F6",
  },
  socialText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: spacing.lg,
  },
  switchPrompt: {
    fontSize: 14,
    color: colors.body,
  },
  switchAction: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});