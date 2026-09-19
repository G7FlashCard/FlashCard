import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

import {
  AuthHeader,
  AuthInput,
  AuthLayout,
  AuthSwitch,
  OrDivider,
  PrimaryButton,
  SocialButtons,
} from "../screens/AuthKit";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Missing Information", "Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Your passwords do not match.");
      return;
    }

    // Pure UI transition to Home
    router.replace("/home");
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Create Account"
        subtitle="Join FlashLearn and start your learning journey!"
      />

      <AuthInput
        icon="person-outline"
        placeholder="Full Name"
        autoCapitalize="words"
        value={fullName}
        onChangeText={setFullName}
      />
      <AuthInput
        icon="at-outline"
        placeholder="Username"
        hint="This will be your unique username."
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />
      <AuthInput
        icon="mail-outline"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      <AuthInput
        icon="lock-closed-outline"
        placeholder="Password"
        isPassword
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
      <AuthInput
        icon="lock-closed-outline"
        placeholder="Confirm Password"
        isPassword
        autoCapitalize="none"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <PrimaryButton label="Sign Up" onPress={handleRegister} />

      <OrDivider />
      <SocialButtons />

      <AuthSwitch
        prompt="Already have an account?"
        action="Login"
        onPress={() => router.replace("/login")}
      />
    </AuthLayout>
  );
}