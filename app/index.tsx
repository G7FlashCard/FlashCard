import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { G, Rect } from "react-native-svg";

import { colors, radius, spacing } from "../screens/theme";

const APP_NAME = "FlashLearn";
const TAGLINE = "Small Cards. Big Progress.";
const SPLASH_MS = 2000;

// Simulated state. Replace with real checks later
// (e.g. an AsyncStorage flag for onboarding + your auth state).
const isLoggedIn = false;
const hasSeenOnboarding = false;

function navigateNext() {
  if (isLoggedIn) {
    router.replace("/home");
  } else if (!hasSeenOnboarding) {
    router.replace("/onboarding");
  } else {
    router.replace("/login");
  }
}

/** Two stacked flashcards, matching the logo in the mockup. */
function Logo({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <G rotation={-12} origin="52, 56">
        <Rect
          x={18}
          y={20}
          width={64}
          height={64}
          rx={12}
          fill={colors.primaryMid}
          stroke={colors.navy}
          strokeWidth={4}
        />
      </G>
      <G rotation={8} origin="68, 64">
        <Rect
          x={36}
          y={36}
          width={64}
          height={64}
          rx={12}
          fill={colors.primaryTint}
          stroke={colors.navy}
          strokeWidth={4}
        />
        <Rect x={50} y={56} width={36} height={5} rx={2.5} fill={colors.primary} />
        <Rect x={50} y={69} width={24} height={5} rx={2.5} fill={colors.primaryMid} />
      </G>
    </Svg>
  );
}

export default function SplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fill the loading bar over the splash duration, then move on.
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // width can't use the native driver
    });

    animation.start(({ finished }) => {
      if (finished) navigateNext();
    });

    return () => animation.stop(); // stops cleanly if the screen unmounts early
  }, [progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Logo />
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{TAGLINE}</Text>
      </View>

      <View style={styles.loader}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: barWidth }]} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.ink,
    marginTop: spacing.md,
  },
  tagline: {
    fontSize: 15,
    color: colors.body,
    marginTop: spacing.sm,
  },
  loader: {
    alignItems: "center",
    paddingBottom: spacing.xl + spacing.md,
    gap: spacing.sm + 4,
  },
  track: {
    width: 180,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  loadingText: {
    fontSize: 13,
    color: colors.body,
  },
});