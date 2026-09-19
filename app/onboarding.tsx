import { router } from "expo-router";

import OnboardingScreen from "../screens/OnboardingScreen";

export default function Onboarding() {
  return <OnboardingScreen onGetStarted={() => router.replace("/login")} />;
}