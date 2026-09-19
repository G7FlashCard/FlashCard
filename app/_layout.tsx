import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* Set status bar style across all screens */}
      <StatusBar style="dark" />

      {/* Main Stack Navigator */}
      <Stack
        screenOptions={{
          headerShown: false, 
          contentStyle: { backgroundColor: "#FFFFFF" }, 
          animation: "slide_from_right",
          animationTypeForReplace: "push", 
        }}
      >
        {/* Entry Point / Splash Screen */}
        <Stack.Screen name="index" />

        {/* Auth Screens: no transition, so switching between them is instant */}
        <Stack.Screen name="login" options={{ animation: "none" }} />
        <Stack.Screen name="register" options={{ animation: "none" }} />

        {/* Main Application Screens (tab bar) */}
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: "fade",
            gestureEnabled: false, 
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}