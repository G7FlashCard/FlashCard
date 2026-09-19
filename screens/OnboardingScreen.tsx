import React, { useRef } from 'react';
import {
  Animated,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  DecksIllustration,
  IllustrationProps,
  LearnIllustration,
  ProgressIllustration,
} from './OnboardingIllustrations';
import { colors, radius, spacing } from './theme';

type Slide = {
  id: string;
  title: string;
  body: string;
  Illustration: React.ComponentType<IllustrationProps>;
};

const SLIDES: Slide[] = [
  {
    id: 'learn',
    title: 'Learn Smarter Everyday',
    body: 'Create, study, take quizzes, and track your progress — anytime, anywhere.',
    Illustration: LearnIllustration,
  },
  {
    id: 'decks',
    title: 'Build Decks in Seconds',
    body: 'Add cards by hand, import a file, or let the AI helper draft them from a topic.',
    Illustration: DecksIllustration,
  },
  {
    id: 'progress',
    title: 'Watch Your Progress Grow',
    body: 'Take quizzes, keep your streak alive, and study alongside your friends.',
    Illustration: ProgressIllustration,
  },
];

type Props = {
  onGetStarted?: () => void;
};

export default function OnboardingScreen({ onGetStarted }: Props) {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;

  const illustrationSize = Math.min(width - spacing.xl * 2, 320);

  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => {
    const { Illustration } = item;
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.illustrationWrap}>
          <Illustration size={illustrationSize} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Animated.FlatList
        data={SLIDES}
        keyExtractor={(slide: Slide) => slide.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } 
        )}
      />

      <View style={styles.footer}>
        <Dots count={SLIDES.length} scrollX={scrollX} width={width} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get started"
          onPress={onGetStarted}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

type DotsProps = {
  count: number;
  scrollX: Animated.Value;
  width: number;
};

function Dots({ count, scrollX, width }: DotsProps) {
  return (
    <View
      style={styles.dots}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }).map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.35, 1, 0.35],
          extrapolate: 'clamp',
        });
        return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.lg + 4,
  },
  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm + 4,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.body,
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  button: {
    height: 56,
    borderRadius: radius.md + 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});