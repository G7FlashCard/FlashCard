import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import {
  AuthHeader,
  AuthInput,
  AuthLayout,
  AuthSwitch,
  PrimaryButton,
} from "../screens/AuthKit";
import { colors } from "../screens/theme";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!identifier.trim() || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your email or username and your password."
      );
      return;
    }
    
    router.replace("/home");
  };

  const handleForgotPassword = () => {
    Alert.alert("Reset password", "Password reset isn't available yet.");
  };

  return (
    <AuthLayout>
      <AuthHeader title="Welcome Back!" subtitle="Login to continue learning." />

      <AuthInput
        icon="person-outline"
        placeholder="Email or Username"
        autoCapitalize="none"
        autoCorrect={false}
        value={identifier}
        onChangeText={setIdentifier}
      />
      <AuthInput
        icon="lock-closed-outline"
        placeholder="Password"
        isPassword
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.forgotRow}>
        <Pressable onPress={handleForgotPassword} hitSlop={8} accessibilityRole="link">
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
      </View>

      <PrimaryButton label="Login" onPress={handleLogin} />

      <AuthSwitch
        prompt="Don't have an account?"
        action="Sign Up"
        onPress={() => router.replace("/register")}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
});